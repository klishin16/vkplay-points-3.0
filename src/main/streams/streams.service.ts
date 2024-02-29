import { Inject, Injectable } from 'einf'
import { SchedulerService } from '@main/scheduler/scheduler.service'
import { DataSource } from 'typeorm'
import { AccountModel } from '@main/entities/account.entity'
import { ApiService } from '@main/api/api.service'
import { EStreamStatus, IStream } from '@main/ws-engine/ws-engine'
import { MAIN_PAGE } from '@main/constants'
import { WsEngineService } from '@main/ws-engine/ws-engine.service'
import { logger } from '@main/logger'
import { EScannerStatus, IAccount } from '@common/models.types'
import { delay, getReadyDrops, setIntervalImmediately } from '@common/helpers'
import { ENotificationType } from '@common/types'
import { StreamModel } from '@main/entities/stream.entity'
import { v4 as uuidv4 } from 'uuid'
import { IpcService } from '@main/ipc/ipc.service'
import { AccountsService } from '@main/accounts/accounts.service'

@Injectable()
export class StreamsService {
  constructor(
    private readonly schedulerService: SchedulerService,
    @Inject('DATABASE') private readonly database: DataSource,
    private readonly apiService: ApiService,
    private readonly wsEngineService: WsEngineService,
    private readonly ipcService: IpcService,
    private readonly accountsService: AccountsService,
  ) {
    this.schedulerService.subscribe(async (accountId) => {
      try {
        await this.scanStreamsHandler(accountId)
      }
      catch (e) {
        this.ipcService.sendNotification({
          title: 'ScanStreamsHandler error!',
          message: e.toString(),
          type: ENotificationType.ERROR,
        })
      }
    })
  }

  public async startStreamsScanner(accountId: string) {
    this.schedulerService.addScanner(accountId)

    const accountsRepository = this.database.getRepository(AccountModel)
    const account = await accountsRepository.findOne({ where: { id: accountId } })
    this.startViewerStatusSender(account)
    account.scannerStatus = EScannerStatus.ACTIVE
    return this.accountsService.updateAccount(account)
  }

  public async stopStreamsScanner(accountId: string) {
    this.schedulerService.removeScanner(accountId)
    const accountsRepository = this.database.getRepository(AccountModel)
    const account = await accountsRepository.findOne({ where: { id: accountId } })
    account.scannerStatus = EScannerStatus.INACTIVE
    return this.accountsService.updateAccount(account)
  }

  private async scanStreamsHandler(accountId: string) {
    const accountsRepository = this.database.getRepository(AccountModel)
    const account = await accountsRepository.findOne({ where: { id: accountId } })

    const data = await this.apiService.fetchStreamers(account.accessToken)
    if (!data)
      throw new Error('No fetchStreamers data!')

    const streams = data.map((stream_info) => {
      return {
        accountId,
        name: stream_info.blog.owner.nick,
        url: MAIN_PAGE + stream_info.blog.blogUrl,
        blogUrl: stream_info.blog.blogUrl,
        streamStatus: stream_info.stream.isOnline ? EStreamStatus.ONLINE : EStreamStatus.OFFLINE,
        wsChannelPrivate: stream_info.stream?.wsStreamChannelPrivate || null,
      } as IStream
    })

    // deprecated
    // const streamsRepository = this.database.getRepository(StreamModel)
    // await streamsRepository.save(streams)

    /** Обновить страницы со стримами (добавить/закрыть) */
    const onlineStreams = streams.filter(stream => stream.streamStatus === EStreamStatus.ONLINE)
    const offlineStreams = streams.filter(stream => stream.streamStatus === EStreamStatus.OFFLINE)

    const addedStreams: IStream[] = []
    const removedStreams: IStream[] = []
    const streamsMap = this.wsEngineService.getStreamsMap(accountId)

    /** Удаляем завершившиеся трансляции */
    for (const stream of offlineStreams) {
      if (streamsMap.has(stream.wsChannelPrivate)) {
        await this.closeStream(account, stream)
        removedStreams.push(stream)
      }
    }

    /** Добавляем начавшиеся стримы */
    for (const stream of onlineStreams) {
      if (!streamsMap.has(stream.wsChannelPrivate)) {
        await this.openStream(account, stream)
        addedStreams.push(stream)
      }
    }

    /** Удаляем стримы стримеров, которые были удалены */
    const blogs_urls = streams.map(stream => stream.blogUrl)
    streamsMap.forEach((stream) => {
      if (!blogs_urls.includes(stream.blogUrl)) {
        this.closeStream(account, stream)
        removedStreams.push(stream)
      }
    })

    return {
      addedStreams,
      removedStreams,
    }
  }

  private async openStream(account: IAccount, stream: IStream) {
    logger.log('Open stream', stream.blogUrl)

    try {
      /** Gather bonuses */
      const bonuses = await this.apiService.fetchPendingBonuses(stream.blogUrl, account.accessToken)
      if (bonuses) {
        for (const bonus of bonuses) {
          await this.apiService.gatherBonusBox(stream.blogUrl, account.accessToken, bonus.id)
          this.ipcService.sendMessage({
            id: uuidv4(),
            title: 'Gather bonus box!',
            message: `Account: ${account.name} Stream: ${stream.name}`,
            accountId: account.id,
          })
        }
      }

      /** Gather drops */
      const drops_data = await this.apiService.fetchPendingDropBoxes(stream.blogUrl, account.accessToken)
      const drops = getReadyDrops(drops_data)
      if (drops) {
        for (const drop of drops) {
          await this.apiService.gatherDropBox(stream.blogUrl, account.accessToken, drop.id)
          this.ipcService.sendMessage({
            id: uuidv4(),
            title: 'Gather drop box!',
            message: `Account: ${account.name} Stream: ${stream.name}`,
            accountId: account.id,
          })
        }
      }
    }
    catch (e) {
      logger.log('Fetching bonuses or drops error', e.toString())
    }

    if (!stream.wsChannelPrivate)
      throw new Error('No wsChannelPrivate')

    await this.wsEngineService.addStream(account.id, stream)
    logger.log(`Connected to ${stream.blogUrl}, channel ${stream.wsChannelPrivate}`)

    const streamRepository = this.database.getRepository(StreamModel)
    const existStream = await streamRepository.findOne({
      where: {
        accountId: account.id,
        blogUrl: stream.blogUrl,
      },
    })
    // Because we don't have streamId
    await streamRepository.save({
      ...existStream,
      ...stream,
    })

    return stream
  }

  public async closeStream(account: IAccount, stream: IStream) {
    this.wsEngineService.removeStream(account.id, stream)
    logger.log(`Disconnected from ${stream.blogUrl}, channel ${stream.wsChannelPrivate}`)
    const streamRepository = this.database.getRepository(StreamModel)
    return await streamRepository.update(
      {
        accountId: account.id,
        blogUrl: stream.blogUrl,
      },
      {
        streamStatus: EStreamStatus.OFFLINE,
      },
    )
  }

  public startViewerStatusSender(account: IAccount) {
    setIntervalImmediately(() => {
      logger.log('Send viewer status to live streams')

      const streamsMap = this.wsEngineService.getStreamsMap(account.id)
      streamsMap.forEach(async (stream) => {
        try {
          await this.apiService.sendViewerAlive(account.accessToken, stream.blogUrl)
          await delay(100)
        }
        catch (e) {
          logger.log('startViewerStatusSender error', e.toString())
        }
      })
    }, 1000 * 60)
  }
}

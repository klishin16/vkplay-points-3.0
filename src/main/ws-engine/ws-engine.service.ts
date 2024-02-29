import { Inject, Injectable } from 'einf'
import { IStream, WsEngine } from '@main/ws-engine/ws-engine'
import { WS_URL } from '@main/constants'
import { logger } from '@main/logger'
import { IWSMessage, isWSChannelConnect, isWSStreamView } from '@main/types'
import websocket from 'websocket'
import { ENotificationType } from '@common/types'
import { delay, getReadyDrops } from '@common/helpers'
import { ApiService } from '@main/api/api.service'
import { EWsStatus, IAccount } from '@common/models.types'
import { StreamModel } from '@main/entities/stream.entity'
import { v4 as uuidv4 } from 'uuid'
import { IpcService } from '@main/ipc/ipc.service'
import { AccountsService } from '@main/accounts/accounts.service'
import { DataSource } from 'typeorm'

@Injectable()
export class WsEngineService {
  constructor(
          @Inject('WS_ENGINES') private readonly wsEngines: Map<string, WsEngine>,
          @Inject('DATABASE') private readonly database: DataSource,
          private readonly accountsService: AccountsService,
          private readonly ipcService: IpcService,
          private readonly apiService: ApiService,
  ) { }

  public async startWsEngine(accountId: string) {
    const account = await this.accountsService.getAccount(accountId)

    if (!account.wsToken) {
      this.ipcService.sendNotification({
        title: 'No WS token!',
        type: ENotificationType.ERROR,
      })
      return logger.log('No WS token!')
    }

    const wsEngine = new WsEngine()
    try {
      await wsEngine.connectToWSServer(WS_URL)
      logger.log('WebSocket client connected successfully!')
      wsEngine.connection.on('error', (error) => {
        logger.log(`Connection Error: ${error.toString()}`)
      })

      wsEngine.connection.on('close', () => {
        logger.log('echo-protocol Connection Closed')
        this.accountsService.updateAccount({
          ...account,
          wsStatus: EWsStatus.INACTIVE,
        })
      })

      wsEngine.connection.on('message', message => this.wsMessageHandler(message, wsEngine, account))

      wsEngine.authenticateOnWsServer(account.wsToken)
    }
    catch (e) {
      logger.error(e)
    }
    this.wsEngines.set(accountId, wsEngine)
    account.wsStatus = EWsStatus.ACTIVE
    return this.accountsService.updateAccount(account)
  }

  public getStreamsMap(accountId: string) {
    return this.wsEngines.get(accountId).wsChannelsMap
  }

  public async addStream(accountId: string, stream: IStream): Promise<IStream> { // TODO Promise ?
    await delay(500)
    if (!stream.wsChannelPrivate)
      throw new Error('No wsChannelPrivate!')

    const wsEngine = this.wsEngines.get(accountId)

    wsEngine.wsChannelsMap.set(stream.wsChannelPrivate, stream)
    wsEngine.connectToPrivateChannel(stream.wsChannelPrivate)

    return stream
  }

  public removeStream(accountId: string, stream: IStream) {
    const wsEngine = this.wsEngines.get(accountId)
    wsEngine.wsChannelsMap.delete(stream.wsChannelPrivate)
    wsEngine.disconnectFromPrivateChannel(stream.wsChannelPrivate)

    return stream
  }

  private wsMessageHandler(message: websocket.Message, wsEngine: WsEngine, account: IAccount) {
    if (message.type === 'utf8') {
      try {
        const data = JSON.parse(message.utf8Data) as IWSMessage

        switch (true) {
          case isWSChannelConnect(data):
            logger.log('WS connected or disconnected', data.result)
            break
          case isWSStreamView(data): {
            const channel = data.result.channel
            const inner_data = data.result.data.data

            switch (inner_data.type) {
              case 'cp_balance_change': {
                const stream = wsEngine.wsChannelsMap.get(channel)
                const streamRepository = this.database.getRepository(StreamModel)
                streamRepository.update({ blogUrl: stream.blogUrl, accountId: account.id }, { points: inner_data.data.balance })
                  .then(() => {
                    this.ipcService.sendMessage({
                      id: uuidv4(),
                      title: 'Balance change',
                      message: `Account: ${account.name} Stream: ${stream.name} Value: ${inner_data.data.balance}`,
                      accountId: account.id,
                    })
                  })
                break
              }
              case 'cp_bonus_pending': {
                const stream = wsEngine.wsChannelsMap.get(channel)
                if (!stream) {
                  logger.error(`No stream for wsChannel ${channel}`)
                  break
                }
                this.apiService.gatherBonusBox(stream.blogUrl, account.accessToken, inner_data.data.id)
                  .then(() => {
                    this.ipcService.sendMessage({
                      id: uuidv4(),
                      title: 'Gather bonus box!',
                      message: `Account: ${account.name} Stream: ${stream.name}`,
                      accountId: account.id,
                    })
                  })
                break
              }
              case 'drop_campaign_progress': {
                const ready_drops = getReadyDrops(inner_data)
                if (ready_drops) {
                  const stream = wsEngine.wsChannelsMap.get(channel)
                  for (const drop of ready_drops) {
                    this.apiService.gatherDropBox(stream.blogUrl, account.accessToken, drop.id)
                      .then(() => {
                        this.ipcService.sendMessage({
                          id: uuidv4(),
                          title: 'Gather drop box!',
                          message: `Account: ${account.name} Stream: ${stream.name}`,
                          accountId: account.id,
                        })
                      })
                  }
                }
                break
              }
            }
          }
        }
      }
      catch (e) {
        logger.error(e.toString())
        this.ipcService.sendNotification({
          title: 'Message handler error',
          message: e.toString(),
          type: ENotificationType.ERROR,
        })
      }
    }
  }
}

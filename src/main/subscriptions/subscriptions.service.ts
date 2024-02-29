import { Injectable } from 'einf'
import { IpcService } from '@main/ipc/ipc.service'
import { AccountsService } from '@main/accounts/accounts.service'
import { ApiService } from '@main/api/api.service'
import { ENotificationType } from '@common/types'
import { CopySubscriptionsDto } from '@common/dto/copy-subscriptions.dto'

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly ipcService: IpcService,
    private readonly accountsService: AccountsService,
    private readonly apiService: ApiService,
  ) {
  }

  public async copySubscriptions({ fromAccountId, toAccountId }: CopySubscriptionsDto) {
    const fromAccount = await this.accountsService.getAccount(fromAccountId)
    const toAccount = await this.accountsService.getAccount(toAccountId)

    if (!fromAccount.accessToken || !toAccount.accessToken)
      throw new Error('No access token!')

    const fromSubscriptions = await this.apiService.fetchStreamers(fromAccount.accessToken)
      .then(streams => streams.map(stream => stream.blog.blogUrl))

    const toSubscriptions = await this.apiService.fetchStreamers(toAccount.accessToken)
      .then(streams => streams.map(stream => stream.blog.blogUrl))

    for (const subscription of fromSubscriptions) {
      if (!toSubscriptions.find(s => s === subscription))
        await this.apiService.subscribeToStreamer(subscription, toAccount.accessToken)
    }

    return this.ipcService.sendNotification({
      title: 'Subscriptions copied successfully!',
      message: `From: ${fromAccount.name} to: ${toAccount.name}`,
      type: ENotificationType.SUCCESS,
    })
  }
}

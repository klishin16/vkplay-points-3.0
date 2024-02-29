import { Controller, IpcHandle } from 'einf'
import { AccountsService } from '@main/accounts/accounts.service'
import { CreateAccountDto } from '@common/dto/create-account.dto'
import { UpdateAccountDto } from '@common/dto/update-account.dto'
import { SubscriptionsService } from '@main/subscriptions/subscriptions.service'
import { CopySubscriptionsDto } from '@common/dto/copy-subscriptions.dto'
import { IpcService } from '@main/ipc/ipc.service'
import { ENotificationType } from '@common/types'
import { LaunchService } from '@main/launch/launch.service'

@Controller()
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly ipcService: IpcService,
    private readonly launchService: LaunchService,
  ) { }

  @IpcHandle('accounts')
  public getAccountsList() {
    return this.accountsService.getAccountsList()
  }

  @IpcHandle('accounts/create')
  public async createAccount(data: CreateAccountDto) {
    const account = await this.accountsService.createAccount(data)
    this.ipcService.createdAccount(account)
  }

  @IpcHandle('account/streams')
  public getAccountStreams(accountId: string) {
    return this.accountsService.getAccountStreams(accountId)
  }

  @IpcHandle('account/update')
  public updateAccount(data: UpdateAccountDto) {
    return this.accountsService.updateAccount(data)
  }

  @IpcHandle('account/remove')
  public removeAccount(accountId: string) {
    return this.accountsService.removeAccount(accountId)
  }

  @IpcHandle('accounts/copy-subscriptions')
  public async copySubscriptions(data: CopySubscriptionsDto) {
    try {
      await this.subscriptionsService.copySubscriptions(data)
    }
    catch (e) {
      this.ipcService.sendNotification({
        title: 'Copy subscriptions error',
        message: e.toString(),
        type: ENotificationType.ERROR,
      })
    }
  }

  @IpcHandle('account/launch-bot')
  public async launchBot(accountId: string) {
    try {
      await this.launchService.launchBot(accountId)
    }
    catch (e) {
      this.ipcService.sendNotification({
        title: 'Launch bot error',
        message: e.toString(),
        type: ENotificationType.ERROR,
      })
    }
  }
}

import type { IpcInstance } from '@render/plugins'
import { useIpc } from '@render/plugins'
import type { IAccount } from '@common/models.types'
import type { CreateAccountDto } from '@common/dto/create-account.dto'
import { useStore } from '@render/store'
import type { IStream } from '@main/ws-engine/ws-engine'
import type { UpdateAccountDto } from '@common/dto/update-account.dto'
import type { CopySubscriptionsDto } from '@common/dto/copy-subscriptions.dto'

class IpcAPI {
  private ipcInstance: IpcInstance
  constructor() {
    this.ipcInstance = useIpc()

    this.ipcInstance.on('account/created', (account) => {
      useStore.getState().addAccount(account)
    })

    this.ipcInstance.on('account/updated', (account) => {
      useStore.getState().updateAccount(account)
    })

    this.ipcInstance.on('account/removed', (accountId) => {
      useStore.getState().removeAccount(accountId)
    })

    this.ipcInstance.on('notification', (notification) => {
      useStore.getState().addNotification(notification)
    })

    this.ipcInstance.on('message', (message) => {
      useStore.getState().addMessage(message)
    })
  }

  public getAccountsList() {
    return this.ipcInstance.send<IAccount[]>('accounts')
  }

  public createAccount(data: CreateAccountDto) {
    return this.ipcInstance.send<IAccount>('accounts/create', data)
  }

  public updateAccount(data: UpdateAccountDto) {
    return this.ipcInstance.send<IAccount>('account/update', data)
  }

  public removeAccount(accountId: string) {
    return this.ipcInstance.send('account/remove', accountId)
  }

  public startWsEngine(accountId: string) {
    return this.ipcInstance.send<IAccount>('ws-engine/start', accountId)
  }

  public authenticate(accountId: string) {
    return this.ipcInstance.send('auth/authenticate', accountId)
  }

  public authenticateWs(accountId: string) {
    return this.ipcInstance.send('auth/authenticateWs', accountId)
  }

  public startStreamsScanner(accountId: string) {
    return this.ipcInstance.send('streams/start-scanner', accountId)
  }

  public stopStreamsScanner(accountId: string) {
    return this.ipcInstance.send('streams/stop-scanner', accountId)
  }

  public getAccountStreams(accountId: string) {
    return this.ipcInstance.send<IStream[]>('account/streams', accountId)
  }

  public copySubscriptions(data: CopySubscriptionsDto) {
    return this.ipcInstance.send('accounts/copy-subscriptions', data)
  }

  public launchBot(accountId: string) {
    return this.ipcInstance.send('account/launch-bot', accountId)
  }
}

export const ipcAPI = new IpcAPI()

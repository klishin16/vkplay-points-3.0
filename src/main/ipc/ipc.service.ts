import { Injectable, Window } from 'einf'
import { BrowserWindow } from 'electron'
import { IMessage, INotification } from '@common/types'
import { IAccount } from '@common/models.types'

@Injectable()
export class IpcService {
  private webContents: Electron.WebContents

  constructor(@Window() private readonly mainWin: BrowserWindow) {
    this.webContents = this.mainWin.webContents
  }

  public sendMessage(message: IMessage) {
    this.webContents.send('message', message)
  }

  public sendNotification(notification: INotification) {
    this.webContents.send('notification', notification)
  }

  public createdAccount(account: IAccount) {
    this.webContents.send('account/created', account)
  }

  public updateAccount(account: Partial<IAccount>) {
    this.webContents.send('account/updated', account)
  }

  public removeAccount(accountId: string) {
    this.webContents.send('account/removed', accountId)
  }
}

import { Controller, IpcHandle, IpcSend, Window } from 'einf'
import { WsEngineService } from '@main/ws-engine/ws-engine.service'
import { AuthService } from '@main/auth/auth.service'
import { ENotificationType } from '@common/types'
import { BrowserWindow } from 'electron'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(
    private appService: AppService,
    private wsEngineService: WsEngineService,
    private authService: AuthService,
    @Window() private readonly mainWin: BrowserWindow,
  ) { }

  @IpcSend('reply-msg')
  public replyMsg(msg: string) {
    return `${this.appService.getDelayTime()} seconds later, the main process replies to your message: ${msg}`
  }

  @IpcHandle('send-msg')
  public async handleSendMsg(msg: string): Promise<string> {
    setTimeout(() => {
      this.replyMsg(msg)
    }, this.appService.getDelayTime() * 1000)

    return `The main process received your message: ${msg}`
  }

  @IpcHandle('ws-engine/start')
  public async startWsEngine(accountId: string) {
    await this.wsEngineService.startWsEngine(accountId)
    // const { webContents } = this.mainWin
    // webContents.send('notification', {
    //   title: 'WS engine started successfully!',
    //   type: ENotificationType.SUCCESS,
    // })
  }

  @IpcHandle('auth/authenticate')
  public async authenticate(accountId: string) {
    const { webContents } = this.mainWin
    try {
      await this.authService.authenticate(accountId)
      webContents.send('notification', {
        title: 'Auth successfully!',
        type: ENotificationType.SUCCESS,
      })
    }
    catch (e) {
      console.log('Error', e)
      webContents.send('notification', {
        title: 'Auth error!',
        message: e.toString(),
        type: ENotificationType.ERROR,
      })
    }
  }

  @IpcHandle('auth/authenticateWs')
  public async authenticateWs(accountId: string) {
    const { webContents } = this.mainWin
    try {
      await this.authService.processWSToken(accountId)
      webContents.send('notification', {
        title: 'Ws auth successfully!',
        type: ENotificationType.SUCCESS,
      })
    }
    catch (e) {
      console.log('Error', e)
      webContents.send('notification', {
        title: 'Ws auth error!',
        message: e.toString(),
        type: ENotificationType.ERROR,
      })
    }
  }
}

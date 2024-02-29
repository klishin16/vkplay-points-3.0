import { app } from 'electron'
import { createEinf } from 'einf'
import { connectToDb } from '@main/data-source'
import { AccountsController } from '@main/accounts/accounts.controller'
import { StreamsController } from '@main/streams/streams.controller'
import type { WsEngine } from '@main/ws-engine/ws-engine'
import { AppController } from './app.controller'
import { createWindow } from './main.window'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

async function electronAppInit() {
  const isDev = !app.isPackaged
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
      app.exit()
  })

  if (isDev) {
    if (process.platform === 'win32') {
      process.on('message', (data) => {
        if (data === 'graceful-exit')
          app.exit()
      })
    }
    else {
      process.on('SIGTERM', () => {
        app.exit()
      })
    }
  }
}

async function bootstrap() {
  try {
    await electronAppInit()

    const database = await connectToDb()
    const wsEngines: Map<string, WsEngine> = new Map()

    await createEinf({
      window: createWindow,
      controllers: [AppController, AccountsController, StreamsController],
      injects: [
        {
          name: 'IS_DEV',
          inject: !app.isPackaged,
        },
        {
          name: 'DATABASE',
          inject: database,
        },
        {
          name: 'WS_ENGINES',
          inject: wsEngines,
        },
      ],
    })
  }
  catch (error) {
    console.error(error)
    app.quit()
  }
}

bootstrap()

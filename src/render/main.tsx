import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@render/components/providers/theme-provider'
import './index.css'
import { Notifications } from '@render/components/notifications'
import { Toaster } from '@render/components/ui/toaster'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <App />
      <Notifications />
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>,
)

// TODO (delayed) ipc типизация
// TODO (done: ipc.service) ipc notifications helper
// TODO (not actual) return from scheduler (наложение тиков)
// TODO (done) #frontend статусы аккаунтов (auth status, ws server status, scanner status)
// TODO (done) #frontend Account not selected placeholder
// TODO (done) #frontend Header duplicate
// TODO (done) Stream database id
// TODO (done) Анимация добавления сообщения в историю
// TODO (done) CRUD аккаунтов
// TODO (done) in removeStream change stream status
// TODO (done) drops
// TODO (done) #frontend update streams table indicator
// TODO (done) copy account subscriptions
// TODO (done) selected account color

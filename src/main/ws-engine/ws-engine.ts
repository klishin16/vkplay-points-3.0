import websocket from 'websocket'

export enum EStreamStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

export interface IStream {
  accountId: string
  name: string
  url: string
  blogUrl: string
  wsChannelPrivate: string | null
  streamStatus: EStreamStatus
  points: number
  // targets: IPointsTarget[]
}

const { client: WSClient } = websocket

export class WsEngine {
  public connection: websocket.connection
  public wsChannelsMap = new Map<string, IStream>()

  public connectToWSServer = (url: string) => new Promise<websocket.connection>((resolve, reject) => {
    const client = new WSClient()

    client.on('connectFailed', (error) => {
      reject(error.toString())
    })

    client.on('connect', (connection) => {
      this.connection = connection
      resolve(connection)
    })

    client.connect(url, undefined, undefined, {
      'Connection': 'Upgrade',
      'Upgrade': 'websocket',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.3',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      'Origin': 'https://vkplay.live',
      'Host': 'pubsub.vkplay.live',
    })
  })

  public authenticateOnWsServer = (wsToken: string) => {
    const token_message = JSON.stringify({
      params: {
        name: 'js',
        token: wsToken,
      },
      id: 1,
    })
    this.connection.send(token_message)
  }

  public connectToPrivateChannel = (channel: string) => {
    const message = JSON.stringify({
      params: {
        channel,
      },
      id: 1,
      method: 1,
    })
    this.connection.send(message)
  }

  public disconnectFromPrivateChannel = (channel: string) => {
    const message = JSON.stringify({
      params: {
        channel,
      },
      id: 1,
      method: 2,
    })
    this.connection.send(message)
  }

  // public on(...params: OverloadedParameters<typeof this.connection.on>) {
  //   return this.connection.on(...params)
  // }
}

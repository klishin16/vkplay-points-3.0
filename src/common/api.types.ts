export interface IAPIBonus {
  id: string
  bonus: {
    type: string
    name: string
    channelPointAmount: number
    description: string
  }
}

export interface IAPIDrop {
  currentRule: {
    id: number
    watchingDuration: number
    progress: {
      current: number
      goal: number
      goalReached: boolean
    }
  }
  campaign: {
    id: number
    title: string
  }
}

export interface IAPIStream {
  blog: {
    blogUrl: string
    owner: {
      displayName: string
      avatarUrl: string
      nick: string
      id: number
      name: string
    }
    coverUrl: string
    hasAdultContent: boolean
    title: string
  }
  stream?: {
    title: string
    wsStreamChannelPrivate: string
    isOnline: boolean
  }
}

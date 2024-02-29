import type { IAPIBonus, IAPIDrop, IAPIStream } from '@common/api.types'

export interface IAPIFetchPendingBonusesResponse {
  data: {
    bonuses: IAPIBonus[]
  }
}

export interface IAPIFetchPendingDropsResponse {
  data: {
    dropProgresses: IAPIDrop[]
  }
}

export interface IAPIFetchStreamsResponse {
  data: {
    streamBlogs: IAPIStream[]
  }
}

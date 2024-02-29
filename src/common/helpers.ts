import type { IAPIFetchPendingDropsResponse } from '@common/api-response.types'
import { EScannerStatus, EWsStatus, type IAccount } from '@common/models.types'

export const delay = (time: number = 1000) => new Promise(r => setTimeout(r, time))

export function setIntervalImmediately<TArgs extends never[]>(callback: (...args: TArgs) => void, ms?: number, ...args: TArgs): NodeJS.Timeout {
  callback(...args)
  return setInterval(() => callback(...args), ms)
}

export function getReadyDrops(data: IAPIFetchPendingDropsResponse) {
  return data.data.dropProgresses?.reduce((drops, dropProgress) => {
    if (dropProgress.currentRule.progress.goalReached) {
      drops.push({
        id: dropProgress.campaign.id,
        title: dropProgress.campaign.title,
      })
    }

    return drops
  }, [] as Array<{ id: number, title: string }>)
}

// export function getStatusColor(status: EAccountStatus) {
//   switch (status) {
//     case EAccountStatus.ACTIVE:
//       return 'bg-green-600'
//     case EAccountStatus.INACTIVE:
//       return 'bg-red-600'
//     case EAccountStatus.STARTING:
//       return 'bg-amber-600'
//     case EAccountStatus.STOPPING:
//       return 'bg-amber-600'
//     default:
//       return 'bg-gray-600'
//   }
// }

export function getAuthStatusColor(account: IAccount) {
  return account.accessToken && account.wsToken ? 'bg-green-600' : 'bg-red-600'
}

export function getWsStatusColor(account: IAccount) {
  return account.wsStatus === EWsStatus.ACTIVE ? 'bg-green-600' : 'bg-red-600'
}

export function getScannerStatusColor(account: IAccount) {
  return account.scannerStatus === EScannerStatus.ACTIVE ? 'bg-green-600' : 'bg-red-600'
}

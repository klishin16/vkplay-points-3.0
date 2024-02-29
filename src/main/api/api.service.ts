import type { AxiosError } from 'axios'
import axios from 'axios'
import type {
  IAPIFetchPendingBonusesResponse,
  IAPIFetchPendingDropsResponse,
  IAPIFetchStreamsResponse,
} from '@common/api-response.types'
import { delay } from '@common/helpers'
import type { IAPIBonus, IAPIStream } from '@common/api.types'
import { Injectable } from 'einf'
import { logger } from "@main/logger";

@Injectable()
export class ApiService {
  public async fetchStreamers(token: string, retry: number = 0, maxRetries: number = 3): Promise<IAPIStream[]> {
    return axios.get<IAPIFetchStreamsResponse>('https://api.vkplay.live/v1/user/public_video_stream/subscriptions', {
      headers: {
        'Content-type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => response.data.data.streamBlogs)
      .catch(async (e: AxiosError) => {
        if (retry < maxRetries) {
          logger.log('Failed load streamers list from API:', e.message, 'retry...')
          await delay((retry + 1) * 1000)
          return await this.fetchStreamers(token, retry + 1, maxRetries)
        }
        else {
          throw new Error('fetchStreamers error')
        }
      })
  }

  public async sendViewerAlive(token: string, blogUrl: string) {
    return axios.put(`https://api.vkplay.live/v1/blog/${blogUrl}/public_video_stream/heartbeat/viewer`, {}, {
      headers: {
        'Content-type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${token}`,
        'Origin': 'https://vkplay.live',
        'Referer': `https://vkplay.live/${blogUrl}`,
      },
    }).then(response => response.data)
  }

  public async gatherBonusBox(blogUrl: string, token: string, bonusBoxId: string) {
    return axios.put(`https://api.vkplay.live/v1/channel/${blogUrl}/point/pending_bonus/${bonusBoxId}/gather`, {
      nextRequestInterval: 60,
    }, {
      headers: {
        'Content-type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${token}`,
        'Origin': 'https://vkplay.live',
        'Referer': `https://vkplay.live/${blogUrl}`,
      },
    }).then(response => response.data)
  }

  public async fetchPendingBonuses(blogUrl: string, token: string): Promise<IAPIBonus[] | void> {
    return axios.get<IAPIFetchPendingBonusesResponse>(`https://api.vkplay.live/v1/channel/${blogUrl}/point/pending_bonus/`, {
      headers: {
        'Content-type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${token}`,
        'Referer': `https://vkplay.live/${blogUrl}`,
      },
    }).then(response => response.data.data.bonuses)
  }

  public async fetchPendingDropBoxes(blogUrl: string, token: string): Promise<IAPIFetchPendingDropsResponse> {
    return axios.get(`https://api.vkplay.live/v1/channel/${blogUrl}/drop_campaign/progress/`, {
      headers: {
        'Content-type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${token}`,
        'Origin': 'https://vkplay.live',
        'Referer': `https://vkplay.live/app/box/campaigns`,
      },
    })
      .then(response => response.data)
  }

  public async gatherDropBox(blogUrl: string, token: string, dropBoxId: number) {
    await delay(1000) // На всякий случай
    return axios.put(`https://api.vkplay.live/v1/drop_campaign/${dropBoxId}/products_request`, {
      nextRequestInterval: 60,
    }, {
      headers: {
        'Content-type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${token}`,
        'Origin': 'https://vkplay.live',
        'Referer': `https://vkplay.live/app/box/campaigns`,
      },
    })
      .then(response => response.data)
  }

  public async subscribeToStreamer(blogUrl: string, token: string) {
    return axios.post(`https://api.vkplay.live/v1/blog/${blogUrl}/follow`, {}, {
      headers: {
        'Content-type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${token}`,
        'Origin': 'https://vkplay.live',
        'Referer': `https://vkplay.live/app/box/campaigns`,
      },
    })
  }
}

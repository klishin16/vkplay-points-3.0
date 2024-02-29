import { Inject, Injectable } from 'einf'
import { GET_TOKEN_URL, GET_WS_TOKEN_URL, SIGN_IN_URL, SIGN_IN_URL2 } from '@main/constants'
import axios from 'axios'
import { DataSource } from 'typeorm'
import { AccountModel } from '@main/entities/account.entity'
import { wrapper } from 'axios-cookiejar-support'
import { Cookie, CookieJar } from 'tough-cookie'
import Serialized = Cookie.Serialized
import { AccountsService } from '@main/accounts/accounts.service'

@Injectable()
export class AuthService {
  constructor(private readonly accountsService: AccountsService) {}

  public async authenticate(accountId: string) {
    const account = await this.accountsService.getAccount(accountId)

    const jar = new CookieJar()
    const client = wrapper(axios.create({ jar }))

    const res1 = await client.post(
      SIGN_IN_URL,
      {
        login: account.email,
        password: account.password,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'origin': 'https://account.vkplay.ru',
          'referer': 'https://account.vkplay.ru/',
        },

      },
    )

    const csrf_cookie: Serialized | undefined = res1.config.jar?.toJSON().cookies.find(cookie => cookie.key === 'csrftoken')

    if (!csrf_cookie)
      throw new Error(`CSRF token cookie was not found`)

    await client.post(
      SIGN_IN_URL2,
      {
        csrfmiddlewaretoken: csrf_cookie.value,
        response_type: 'code',
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'origin': 'https://account.vkplay.ru',
          'referer': 'https://account.vkplay.ru/',
        },

      },
    )

    const token_response = await client.get(
      GET_TOKEN_URL,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'origin': 'https://account.vkplay.ru',
          'referer': 'https://account.vkplay.ru/',
        },
      },
    )

    const auth_cookie: Serialized | undefined = token_response.config.jar?.toJSON().cookies.find(cookie => cookie.key === 'auth')

    const client_id_cookie: Serialized | undefined = token_response.config.jar?.toJSON().cookies.find(cookie => cookie.key === '_clientId')

    if (!auth_cookie)
      throw new Error(`Auth token cookie was not found`)

    if (!client_id_cookie)
      throw new Error('Client id cookie was not found')

    const decoded_url_cookie = decodeURIComponent(auth_cookie.value as unknown as string)
    const res = JSON.parse(decoded_url_cookie)

    return this.accountsService.updateAccount({
      ...account,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      expiresAt: new Date(res.expiresAt),
      clientId: decodeURIComponent(client_id_cookie.value as unknown as string),
    })
  }

  public async processWSToken(accountId: string) {
    const account = await this.accountsService.getAccount(accountId)

    if (!account.accessToken || !account.clientId)
      throw new Error('No accessToken or clientId')

    const data = await axios.get(GET_WS_TOKEN_URL, {
      headers: {
        'Content-type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${account.accessToken}`,
        'X-From-Id': account.clientId,
        'Origin': 'https://vkplay.live',
        'Referer': 'https://vkplay.live/',
      },
    })

    return this.accountsService.updateAccount({
      ...account,
      wsToken: data.data.token,
    })
  }
}

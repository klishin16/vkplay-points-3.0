import { Injectable } from 'einf'
import { AccountsService } from '@main/accounts/accounts.service'
import { AuthService } from '@main/auth/auth.service'
import { EScannerStatus, EWsStatus } from '@common/models.types'
import { WsEngineService } from '@main/ws-engine/ws-engine.service'
import { StreamsService } from '@main/streams/streams.service'

@Injectable()
export class LaunchService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly authService: AuthService,
    private readonly wsEngineService: WsEngineService,
    private readonly streamsService: StreamsService,
  ) {
  }

  public async launchBot(accountId: string) {
    const account = await this.accountsService.getAccount(accountId)

    if (!account.accessToken)
      await this.authService.authenticate(accountId)

    if (!account.wsToken)
      await this.authService.processWSToken(accountId)

    if (account.wsStatus === EWsStatus.INACTIVE)
      await this.wsEngineService.startWsEngine(accountId)

    if (account.scannerStatus === EScannerStatus.INACTIVE)
      await this.streamsService.startStreamsScanner(accountId)
  }
}

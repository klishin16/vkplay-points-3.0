import { Inject, Injectable } from 'einf'
import { AccountModel } from '@main/entities/account.entity'
import { DataSource } from 'typeorm'
import { CreateAccountDto } from '@common/dto/create-account.dto'
import { StreamModel } from '@main/entities/stream.entity'
import { EScannerStatus, EWsStatus, IAccount } from '@common/models.types'
import { IpcService } from '@main/ipc/ipc.service'

@Injectable()
export class AccountsService {
  constructor(
          @Inject('DATABASE') private database: DataSource,
          private readonly ipcService: IpcService,
  ) {
    this.clearAccountsStatuses()
  }

  public getAccountsList() {
    const accountRepository = this.database.getRepository(AccountModel)
    return accountRepository.find()
  }

  public createAccount(dto: CreateAccountDto) {
    const accountRepository = this.database.getRepository(AccountModel)
    return accountRepository.save(dto)
  }

  public async updateAccount(account: Partial<IAccount>) {
    const accountRepository = this.database.getRepository(AccountModel)
    await accountRepository.update({ id: account.id }, account)
    return this.ipcService.updateAccount(account)
  }

  public async removeAccount(accountId: string) {
    const accountRepository = this.database.getRepository(AccountModel)
    await accountRepository.delete({
      id: accountId,
    })
    return this.ipcService.removeAccount(accountId)
  }

  public getAccountStreams(accountId: string) {
    const streamsRepository = this.database.getRepository(StreamModel)
    return streamsRepository.find(
      {
        where: {
          accountId,
        },
        order: {
          streamStatus: 'DESC',
        },
      },
    )
  }

  public async getAccount(accountId: string) {
    const accountRepository = this.database.getRepository(AccountModel)
    return accountRepository.findOne({
      where: {
        id: accountId,
      },
    })
  }

  private clearAccountsStatuses() {
    const accountRepository = this.database.getRepository(AccountModel)
    return accountRepository.update({}, {
      wsStatus: EWsStatus.INACTIVE,
      scannerStatus: EScannerStatus.INACTIVE,
    })
  }
}

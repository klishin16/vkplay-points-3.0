import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { EScannerStatus, EWsStatus, IAccount } from '@common/models.types'
import { StreamModel } from '@main/entities/stream.entity'

@Entity()
export class AccountModel implements IAccount {
  @PrimaryGeneratedColumn()
  id: string

  @Column()
  name: string

  @Column()
  email: string

  @Column()
  password: string

  @Column({ type: 'varchar', nullable: false, default: EWsStatus.INACTIVE })
  wsStatus: EWsStatus

  @Column({ type: 'varchar', nullable: false, default: EScannerStatus.INACTIVE })
  scannerStatus: EScannerStatus

  @Column({ type: 'varchar', nullable: true })
  accessToken: string | null

  @Column({ type: 'varchar', nullable: true })
  refreshToken: string | null

  @Column({ type: 'date', nullable: true })
  expiresAt: Date | null

  @Column({ type: 'varchar', nullable: true })
  clientId: string | null

  @Column({ type: 'varchar', nullable: true })
  wsToken: string | null

  @OneToMany(() => StreamModel, stream => stream.account)
  streams: StreamModel[]
}

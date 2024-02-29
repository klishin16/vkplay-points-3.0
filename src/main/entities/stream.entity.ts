import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { EStreamStatus, IStream } from '@main/ws-engine/ws-engine'
import { AccountModel } from '@main/entities/account.entity'

@Entity()
export class StreamModel implements Omit<IStream, 'wsChannelPrivate' | 'url'> {
  @PrimaryGeneratedColumn()
  id: string

  @Column()
  blogUrl: string

  @Column()
  name: string

  @Column('integer', { default: 0 })
  points: number

  @Column({ type: 'varchar', nullable: true })
  streamStatus: EStreamStatus

  @Column()
  public accountId: string

  @ManyToOne(() => AccountModel, account => account.streams)
  @JoinColumn({ name: 'accountId' })
  account: AccountModel
}

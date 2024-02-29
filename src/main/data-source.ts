import { DataSource } from 'typeorm'
import { AccountModel } from '@main/entities/account.entity'
import { logger } from '@main/logger'
import { StreamModel } from '@main/entities/stream.entity'

export function connectToDb(): Promise<DataSource> {
  return new Promise((resolve, reject) => {
    const data_source = new DataSource({
      type: 'sqlite',
      database: 'vk-points-db',
      entities: [AccountModel, StreamModel],
      synchronize: true,
      logging: 'all',
    })

    data_source.initialize()
      .then(() => {
        logger.log('Database connected successfully')
        // here you can start to work with your database
        resolve(data_source)
      })
      .catch((error) => {
        logger.error(error)
        reject(data_source)
      })
  })
}

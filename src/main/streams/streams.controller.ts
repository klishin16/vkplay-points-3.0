import { Controller, IpcHandle } from 'einf'
import { StreamsService } from '@main/streams/streams.service'

@Controller()
export class StreamsController {
  constructor(private readonly streamsService: StreamsService) { }

  @IpcHandle('streams/start-scanner')
  public startStreamsScanner(accountId: string) {
    return this.streamsService.startStreamsScanner(accountId)
  }

  @IpcHandle('streams/stop-scanner')
  public stopStreamsScanner(accountId: string) {
    return this.streamsService.stopStreamsScanner(accountId)
  }
}

import { Injectable } from 'einf'
import { setIntervalImmediately } from '@common/helpers'

@Injectable()
export class SchedulerService {
  private scanners = []
  private actualScanners = []
  private currentScanner = 0
  private subscribers: Array<Function> = []

  constructor() {
    setIntervalImmediately(() => {
      if (this.actualScanners.length) {
        this.emit(this.actualScanners[this.currentScanner])

        if (this.currentScanner === this.actualScanners.length - 1) {
          this.currentScanner = 0
          this.actualScanners = [...this.scanners]
        }

        else { this.currentScanner++ }
      }
      else {
        this.actualScanners = [...this.scanners]
        console.log('Scheduler empty')
      }
    }, 10000)
  }

  public addScanner(id: string) {
    this.scanners.push(id)
  }

  public removeScanner(id: string) {
    this.scanners = this.scanners.filter(scannerId => scannerId !== id)
  }

  public subscribe(subscriber: (id: string) => void) {
    this.subscribers.push(subscriber)
  }

  private emit(id: string) {
    this.subscribers.forEach(subscriber => subscriber(id))
  }
}

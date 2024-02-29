import type { IStream } from '@main/ws-engine/ws-engine'
import React, { useEffect, useRef } from 'react'
import { Button } from '@render/components/ui/button'
import { ipcAPI } from '@render/api'

interface IStreamTableHeaderProps {
  streams: IStream[]
  selectedAccountId: string | null
}

export function StreamTableHeader({ streams, selectedAccountId }: IStreamTableHeaderProps) {
  const pingRef = useRef(null)

  useEffect(() => {
    pingRef.current.classList.add('animate-ping-one')
    setTimeout(() => {
      pingRef.current.classList.remove('animate-ping-one')
    }, 1000)
  }, [streams])

  const handleLaunchBot = () => {
    return ipcAPI.launchBot(selectedAccountId)
  }

  return (
    <header className="bg-background w-full border-b">
      <div className="container pl-4 pr-4 flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex flex-1 items-center justify-start space-x-4">
          <nav className="flex items-center space-x-1">
            { selectedAccountId && <Button variant="outline" onClick={handleLaunchBot}>Launch bot</Button> }
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <span className="text-sm font-medium pr-1">Streams update</span>
            <span className="relative flex h-3 w-3">
              <div
                ref={pingRef}
                className="absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"
              >
              </div>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
            </span>
          </nav>
        </div>
      </div>
    </header>
  )
}

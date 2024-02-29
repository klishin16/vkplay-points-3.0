import { SiteHeader } from '@render/components/site-header'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@render/components/ui/resizable'
import { Separator } from '@render/components/ui/separator'
import { useEffect, useState } from 'react'
import AddAccount from '@render/components/add-account'
import { AccountsList } from '@render/components/accounts-list'
import { useStore } from '@render/store'
import StreamsTable from '@render/components/streams-table'
import type { IStream } from '@main/ws-engine/ws-engine'
import { ipcAPI } from '@render/api'
import { setIntervalImmediately } from '@common/helpers'
import MessagesList from '@render/components/messages-list'
import EditAccount from '@render/components/edit-account'
import type { IAccount } from '@common/models.types'
import { StreamTableHeader } from '@render/components/stream-table-header'

function App() {
  const defaultLayout = [140, 380, 140]
  const [isCollapsed, setIsCollapsed] = useState(false)
  const accounts = useStore(state => state.accounts)
  const selectedAccountId = useStore(state => state.selectedAccountId)
  const loadAccounts = useStore(state => state.loadAccounts)

  const messages = useStore(state => state.messages)

  const [streams, setStreams] = useState<IStream[]>()
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>()

  const [editedAccount, setEditedAccount] = useState<IAccount | null>()
  const [openEditor, setOpenEditor] = useState<boolean>()

  const handleEditorChange = (opened: boolean) => {
    setOpenEditor(opened)
  }

  const handleSelectEditAccount = (account: IAccount) => {
    setEditedAccount(account)
    setOpenEditor(true)
  }

  useEffect(() => {
    loadAccounts()
  }, [])

  useEffect(() => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
    if (selectedAccountId) {
      const intervalId = setIntervalImmediately(() => {
        ipcAPI.getAccountStreams(selectedAccountId).then((data) => {
          setStreams(data)
        })
      }, 5000)
      setIntervalId(intervalId)
    }
  }, [selectedAccountId])

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full items-stretch">
      <ResizablePanel
        defaultSize={defaultLayout[0]}
        minSize={15}
        maxSize={20}
      >
        <AddAccount isCollapsed={isCollapsed} />
        <Separator />
        <AccountsList isCollapsed={isCollapsed} accounts={accounts} openAccountEditor={handleSelectEditAccount} />
        <EditAccount isCollapsed={isCollapsed} account={editedAccount} open={openEditor} onOpenChange={handleEditorChange} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
        { streams && <StreamTableHeader streams={streams} selectedAccountId={selectedAccountId} /> }
        { streams
          ? <StreamsTable streams={streams} />
          : (
            <div className="m-2 p-3 rounded-lg border text-left text-sm transition-all hover:bg-accent">
              <div className="font-sm">Account not selected</div>
            </div>
            ) }
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={defaultLayout[2]} minSize={25}>
        <SiteHeader />
        <MessagesList messages={messages} />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export default App

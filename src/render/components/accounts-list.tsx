import { cn } from '@render/lib/utils'
import type { IAccount } from '@common/models.types'
import { EScannerStatus } from '@common/models.types'
import { Tooltip, TooltipContent, TooltipTrigger } from '@render/components/ui/tooltip'
import { Link } from 'lucide-react'
import { buttonVariants } from '@render/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@render/components/ui/context-menu'
import { ipcAPI } from '@render/api'
import { useStore } from '@render/store'
import { memo } from 'react'
import { getAuthStatusColor, getScannerStatusColor, getWsStatusColor } from '@common/helpers'

const AccountStatuses = memo(
  ({ account }: IAccountStatusesProps) => {
    return (
      <div className="flex gap-2">
        <span className={cn(
          'flex h-3 w-3 rounded-full',
          getAuthStatusColor(account),
        )}
        />
        <span className={cn(
          'flex h-3 w-3 rounded-full',
          getWsStatusColor(account),
        )}
        />
        <span className={cn(
          'flex h-3 w-3 rounded-full',
          getScannerStatusColor(account),
        )}
        />
      </div>
    )
  },
)

interface AccountsListProps {
  accounts: IAccount[]
  isCollapsed: boolean
  openAccountEditor: (account: IAccount) => void
}

export function AccountsList({ accounts, isCollapsed, openAccountEditor }: AccountsListProps) {
  const selectAccount = useStore(state => state.selectAccount)
  const selectedAccountId = useStore(state => state.selectedAccountId)
  const handleStartWsEngine = (accountId: string) => {
    return ipcAPI.startWsEngine(accountId)
  }

  const handleAuthenticate = (accountId: string) => {
    return ipcAPI.authenticate(accountId)
  }

  const handleAuthenticateWs = (accountId: string) => {
    return ipcAPI.authenticateWs(accountId)
  }

  const handleToggleStreamsScanner = (account: IAccount) => {
    return account.scannerStatus === EScannerStatus.INACTIVE
      ? ipcAPI.startStreamsScanner(account.id)
      : ipcAPI.stopStreamsScanner(account.id)
  }

  const handleRemoveAccount = (accountId: string) => {
    return ipcAPI.removeAccount(accountId)
  }

  const handleCopySubscriptions = (fromAccountId: string) => {
    return ipcAPI.copySubscriptions({ fromAccountId, toAccountId: selectedAccountId })
  }

  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        { accounts.map(account =>
          isCollapsed
            ? (
              <Tooltip key={account.id} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href="#"
                    className={cn(
                      buttonVariants({ variant: 'link', size: 'icon' }),
                      'h-9 w-9',
                      'dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white',
                    )}
                  >
                    {/* <link.icon className="h-4 w-4" /> */ }
                    <span className="sr-only">{ account.email }</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-4">
                  { account.email }
                </TooltipContent>
              </Tooltip>
              )
            : (
              <ContextMenu key={account.id}>
                <ContextMenuTrigger
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    'justify-between',
                    account.id === selectedAccountId
                    && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white',
                  )}
                  onClick={() => selectAccount(account.id)}
                >
                  { account.name }
                  <AccountStatuses account={account} />
                </ContextMenuTrigger>
                <ContextMenuContent className="w-64">
                  <ContextMenuItem inset onClick={() => handleAuthenticate(account.id)}>
                    Authenticate on server
                    <ContextMenuShortcut>A</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem inset onClick={() => handleAuthenticateWs(account.id)}>
                    Authenticate WS
                    <ContextMenuShortcut>B</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem inset onClick={() => handleStartWsEngine(account.id)}>
                    Start WS engine
                    <ContextMenuShortcut>C</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem inset onClick={() => handleToggleStreamsScanner(account)}>
                    { account.scannerStatus === EScannerStatus.INACTIVE ? 'Start ' : 'Stop ' }
                    {' '}
                    streams scanner
                    <ContextMenuShortcut>D</ContextMenuShortcut>
                  </ContextMenuItem>
                  { selectedAccountId && selectedAccountId !== account.id
                  && (
                    <ContextMenuItem inset onClick={() => handleCopySubscriptions(account.id)}>
                      Copy subscriptions to selected account
                      <ContextMenuShortcut>G</ContextMenuShortcut>
                    </ContextMenuItem>
                  )}
                  <ContextMenuItem inset onClick={() => openAccountEditor(account)}>
                    Edit account
                    <ContextMenuShortcut>E</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem inset onClick={() => handleRemoveAccount(account.id)}>
                    Remove account
                    <ContextMenuShortcut>F</ContextMenuShortcut>
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
              ),
        ) }
      </nav>
    </div>
  )
}

interface IAccountStatusesProps {
  account: IAccount
}

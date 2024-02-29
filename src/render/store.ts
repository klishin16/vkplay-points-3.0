import type { StateCreator } from 'zustand'
import { create } from 'zustand'
import type { IAccount } from '@common/models.types'
import { ipcAPI } from '@render/api'
import type { IMessage, INotification } from '@common/types'

interface IAccountsSlice {
  accounts: IAccount[]
  isAccountsLoading: boolean
  selectedAccountId: string | null
  setAccounts: (data: IAccount[]) => void
  addAccount: (data: IAccount) => void
  loadAccounts: () => Promise<void>
  selectAccount: (accountId: string) => void
  updateAccount: (account: IAccount) => void
  removeAccount: (accountId: string) => void
}

interface INotificationsSlice {
  notifications: INotification[]
  addNotification: (data: INotification) => void
}

interface IMessagesSlice {
  messages: IMessage[]
  addMessage: (data: IMessage) => void
}

type TStore = IAccountsSlice & INotificationsSlice & IMessagesSlice

const createAccountsSlice: StateCreator<TStore, [], [], IAccountsSlice> = set => ({
  accounts: [],
  isAccountsLoading: false,
  selectedAccountId: null,
  setAccounts: data => set(() => ({ accounts: data })),
  addAccount: data => set(state => ({ accounts: state.accounts.concat(data) })),
  loadAccounts: async () => {
    set(() => ({ isAccountsLoading: true }))
    const accounts = await ipcAPI.getAccountsList()
    set(() => ({
      accounts,
      isAccountsLoading: false,
    }))
  },
  selectAccount: accountId => set(() => ({ selectedAccountId: accountId })),
  updateAccount: account => set((state) => {
    const accountIndex = state.accounts.findIndex(ac => ac.id === account.id)
    state.accounts[accountIndex] = account
    return ({
      accounts: [...state.accounts],
    })
  }),
  removeAccount: accountId => set(state => ({ accounts: state.accounts.filter(ac => ac.id !== accountId) })),
})

const createNotificationsSlice: StateCreator<TStore, [], [], INotificationsSlice> = set => ({
  notifications: [],
  addNotification: data => set(state => ({ notifications: state.notifications.concat(data) })),
})

const createMessagesSlice: StateCreator<TStore, [], [], IMessagesSlice> = set => ({
  messages: [],
  addMessage: data => set(state => ({ messages: [data].concat(state.messages) })),
})

export const useStore = create<TStore>()((...a) => ({
  ...createAccountsSlice(...a),
  ...createNotificationsSlice(...a),
  ...createMessagesSlice(...a),
}))

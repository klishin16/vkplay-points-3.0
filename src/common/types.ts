export type Nullable<T> = T | null

export type Voidable<T> = T | null | undefined

export enum ENotificationType {
  ERROR = 'destructive',
  SUCCESS = 'default',
}

export interface INotification {
  title: string
  message?: string
  type: ENotificationType
}

export interface IMessage {
  id: string
  title: string
  message: string
  accountId: string
}

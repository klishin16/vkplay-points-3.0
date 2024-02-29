export enum EWsStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  STARTING = 'pending',
  STOPPING = 'stopping',
}

export enum EScannerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface IAccount {
  id: string
  name: string
  email: string
  password: string
  wsStatus: EWsStatus
  scannerStatus: EScannerStatus
  accessToken: string | null
  refreshToken: string | null
  expiresAt: Date | null
  wsToken: string | null
}

export type AdminLoginPayload = {
  username: string
  password: string
}

export type AdminLoginResponse = {
  status?: boolean
  success?: boolean
  message?: string
  data?: {
    id?: number
    username?: string
  }
}

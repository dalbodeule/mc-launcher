import axios, { AxiosPromise } from 'axios'

export interface IResponseError {
  error: string
  errorMessage: string
  errorCause?: string
}

export interface IAuthenticatePayload {
  agent: {
    name: 'Minecraft'
    version: 1
  }
  username: string
  password: string
  clientToken?: string
  requestUser: boolean
}

export interface IAuthenticateResponse {
  accessToken: string
  clientToken: string
  availableProfiles: Array<{
    agent: 'minecraft'
    id: string
    name: string
    userId: string
    createdAt: number
    legacyProfile: boolean
    suspended: boolean
    paid: boolean
    migrated: boolean
    legacy: boolean
  }>
  selectedProfile: {
    id: string
    name: string
    userId: string
    createdAt: number
    legacyProfile: boolean
    suspended: boolean
    paid: boolean
    migrated: boolean
    legacy: boolean
  }
  user?: {
    id: string
    email: string
    username: string
    registerIp: string
    migratedFrom: 'minecraft.net'
    migratedAt: number
    registeredAt: number
    passwordChangedAt: number
    dateOfBirth: number
    suspended: boolean
    blocked: boolean
    secured: boolean
    migrated: boolean
    emailVerified: boolean
    legacyUser: boolean
    verifiedByParent: boolean
    properties?: [
      {
        name: 'preferredLanguage'
        value: string
      },
      {
        name: 'twitch_access_token'
        value: string
      }
    ]
  }
}

export interface IRefreshPayload {
  accessToken: string
  clientToken: string
  selectedProfile?: {
    id: string
    name: string
  }
  requestUser?: boolean
}

export interface IRefreshResponse {
  accessToken: string
  clientToken: string
  selectedProfile: {
    id: string
    name: string
  }
  user?: {
    id: string
    properties: [
      {
        name: 'preferredLanguage'
        value: string
      },
      {
        name: 'twitch_access_token'
        value: string
      }
    ]
  }
}

const MOJANG_AUTH_SERVER = 'https://authserver.mojang.com/'

export default class MojangUser {
  private accessToken = ''
  private clientToken = ''

  constructor(clientToken?: string) {
    this.clientToken = clientToken || ''

    return
  }

  public async login(
    username: string,
    password: string
  ): Promise<IAuthenticateResponse> {
    const payload: IAuthenticatePayload = {
      agent: {
        name: 'Minecraft',
        version: 1
      },
      username: username,
      password: password,
      clientToken: this.clientToken,
      requestUser: false
    }

    const result = await this._makeAxiosRequest<
      IAuthenticatePayload,
      IAuthenticateResponse
    >(payload, '/authenticate')

    if (result.status == 200) {
      this.clientToken = result.data?.clientToken
      this.accessToken = result.data?.accessToken

      return result.data
    } else {
      throw this._makeException((result.data as unknown) as IResponseError)
    }
  }

  public async refresh(): Promise<IRefreshResponse> {
    const payload: IRefreshPayload = {
      accessToken: this.accessToken,
      clientToken: this.clientToken
    }

    const result = await this._makeAxiosRequest<
      IRefreshPayload,
      IRefreshResponse
    >(payload, '/refresh')

    if (result.status == 200) {
      this.accessToken = result.data.accessToken
      this.clientToken = result.data.clientToken

      return result.data
    } else {
      throw this._makeException((result.data as unknown) as IResponseError)
    }
  }

  private _makeAxiosRequest<T, V>(payload: T, uri: string) {
    return axios({
      url: `${MOJANG_AUTH_SERVER}${uri}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(payload)
    }) as AxiosPromise<V>
  }

  private _makeException(error: IResponseError) {
    return new Error(
      `${error.error}${error?.errorCause}: ${error.errorMessage}`
    )
  }
}

import { readBody } from 'h3'
import { $fetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    return await $fetch(`${getUpstreamApiBase()}/register/siswa`, {
      method: 'POST',
      body,
      timeout: 15000
    })
  } catch (error: any) {
    return proxyUpstreamError(event, error)
  }
})

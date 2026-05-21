import { readFormData } from 'h3'
import { $fetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  const formData = await readFormData(event)

  try {
    return await $fetch(`${getUpstreamApiBase()}/register/berkas`, {
      method: 'POST',
      body: formData,
      timeout: 30000
    })
  } catch (error: any) {
    return proxyUpstreamError(event, error)
  }
})

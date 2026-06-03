import { defineEventHandler, sendRedirect } from 'h3'

const adminPanelUrl = 'https://mdspanel.mdscendekia.oirul.com/login'

export default defineEventHandler((event) => {
  return sendRedirect(event, adminPanelUrl, 301)
})

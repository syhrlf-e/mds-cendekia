import { defineEventHandler, sendRedirect } from 'h3'

const adminPanelUrl = 'https://admin.mdscendekia.my.id/login'

export default defineEventHandler((event) => {
  return sendRedirect(event, adminPanelUrl, 301)
})

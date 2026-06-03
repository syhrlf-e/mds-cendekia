import { defineEventHandler, setHeader } from 'h3'

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'X-Robots-Tag', 'noindex, nofollow, noarchive')

  return [
    'User-Agent: *',
    'Disallow: /',
    ''
  ].join('\n')
})

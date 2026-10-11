import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/*
 * Content Security Policy. GitHub Pages cannot send response
 * headers, so it is declared as a <meta> tag (which does not
 * support frame-ancestors). It is added to production builds
 * only: the dev server relies on inline scripts (React Refresh).
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com',
  "img-src 'self' https://armenian-catalogs.s3.eu-west-par.io.cloud.ovh.net",
  "connect-src 'self' https://raw.githubusercontent.com",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ')

function contentSecurityPolicy(): Plugin {
  return {
    name: 'content-security-policy',
    apply: 'build',
    transformIndexHtml: () => [
      {
        tag: 'meta',
        attrs: {
          'http-equiv': 'Content-Security-Policy',
          content: CONTENT_SECURITY_POLICY,
        },
        injectTo: 'head-prepend',
      },
    ],
  }
}

export default defineConfig({
  plugins: [react(), contentSecurityPolicy()],
  base: '/',
})

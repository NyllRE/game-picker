
import type { Defu } from 'defu'


declare const inlineConfig = {
  "url": "http://localhost:3000"
}
type ResolvedAppConfig = Defu<typeof inlineConfig, []>

declare module '@nuxt/schema' {
  interface AppConfig extends ResolvedAppConfig { }
}

import type { NavigationGuard } from 'vue-router'
export type MiddlewareKey = "auth"
declare module "/home/nyll/dev/mobile/playground/node_modules/nuxt/dist/pages/runtime/composables" {
  interface PageMeta {
    middleware?: MiddlewareKey | NavigationGuard | Array<MiddlewareKey | NavigationGuard>
  }
}
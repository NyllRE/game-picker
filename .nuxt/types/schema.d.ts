import { NuxtModule } from '@nuxt/schema'
declare module '@nuxt/schema' {
  interface NuxtConfig {
    ["pwa"]?: typeof import("@kevinmarrec/nuxt-pwa").default extends NuxtModule<infer O> ? Partial<O> : Record<string, any>
    ["ionic"]?: typeof import("@nuxtjs/ionic").default extends NuxtModule<infer O> ? Partial<O> : Record<string, any>
    ["proxy"]?: typeof import("nuxt-proxy").default extends NuxtModule<infer O> ? Partial<O> : Record<string, any>
    ["telemetry"]?: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O> ? Partial<O> : Record<string, any>
  }
  interface RuntimeConfig {
   app: {
      baseURL: string,

      buildAssetsDir: string,

      cdnURL: string,
   },

   jwtAccessSecret: string,

   jwtRefreshSecret: string,

   proxy: {
      options: Array<any>,
   },
  }
  interface PublicRuntimeConfig {
   pwaManifest: {
      name: string,

      short_name: string,

      description: any,

      lang: string,

      start_url: string,

      display: string,

      background_color: string,

      theme_color: string,

      icons: Array<{

      }>,
   },
  }
}
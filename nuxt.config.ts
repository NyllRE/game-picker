/** @format */

//==<< use the node envs to do ssr >>==//

export default defineNuxtConfig({
	modules: ['@nuxtjs/ionic', 'nuxt-proxy'],
	runtimeConfig: {
		jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
		jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
	},
	appConfig: {
		url: process.env.API_URL,
	},
	experimental: {
		payloadExtraction: false,
	},
	ionic: {
		integrations: {
			icons: true,
			meta: true,
			pwa: true,
			router: true,
		},

		css: {
			core: true,
			basic: true,
			utilities: false,
		},
	},
	routeRules: {
		'/tabs/*': { ssr: false },
		'/api/*': {
			cors: false,
			headers: { 'Access-Control-Allow-Origin': '*' },
		},
	},
	vite: {
		/* options for vite */
		// ssr: true // enable unstable server-side rendering for development (false by default)
		// experimentWarning: false // hide experimental warning message (disabled by default for tests)
		vue: {
			reactivityTransform: true,
		},
	},
});

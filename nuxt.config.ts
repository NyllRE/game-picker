/** @format */

//==<< use the node envs to do ssr >>==//

export default defineNuxtConfig({
	modules: ['@nuxtjs/ionic', 'nuxt-proxy'],
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
	// Only valid on preview
	routeRules: {
		'/tabs/': { ssr: false },
		'/api/*': {
			cors: true,
			headers: { 'Access-Control-Allow-Origin': '*' },
		},
	},
	// See options here https://github.com/chimurai/http-proxy-middleware#options
	proxy: {
		options: {
			target: 'http://localhost:3001',
			changeOrigin: true,
			secure: false,
			pathFilter: ['/api/count', '/api/custom/'],
		},
	},
});

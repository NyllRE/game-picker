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

		//! Deleting IG one more time !//

		css: {
			core: true,
			basic: true,
			utilities: false,
		},
	},
	// See options here https://github.com/chimurai/http-proxy-middleware#options
	proxy: {
		options: {
			target: 'https://game-picker-p7mfstlo9-nyllre.vercel.app',
			changeOrigin: true,
			secure: false,
			pathRewrite: {
				'^/api/todos': '/todos',
				'^/api/users': '/users',
			},
			pathFilter: ['/api/todos', '/api/users'],
		},
	},
});

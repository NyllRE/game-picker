/** @format */

export default defineEventHandler(async (event) => {
	console.log('lmao?', event.context.auth);

	return {
		user: event.context.auth,
	};
});

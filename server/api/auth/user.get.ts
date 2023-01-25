/** @format */

export default defineEventHandler(async (event) => {
	const user = event.context.auth?.user;

	return {
		user: {
			id: user.id,
			name: user.username,
			updated: user.updated,
		},
	};
});

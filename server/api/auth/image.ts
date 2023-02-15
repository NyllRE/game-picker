/** @format */

import { addImageIdToUser, getUserById } from '~~/server/db/users';

export default defineEventHandler(async (event) => {
	if (event.node.req.method !== 'PUT') {
		return sendError(
			event,
			createError({
				statusCode: 405,
				statusMessage: 'incorrect request method',
			})
		);
	}

	const refresh_token = getCookie(event, 'refresh_token');
	console.log(refresh_token);

	const body = await readBody(event);

	const { userId, imageId } = body;

	if (!userId || !imageId) {
		return sendError(
			event,
			createError({
				statusCode: 401,
				statusMessage: 'missing values',
			})
		);
	} else if (imageId.length !== 5) {
		return sendError(
			event,
			createError({
				statusCode: 403,
				statusMessage: "HACKER!!!!!!!! YOU THOUGHT I WOULDN'T KNOW????",
			})
		);
	}

	const user = await getUserById(userId);

	if (!user) {
		return sendError(
			event,
			createError({
				statusCode: 402,
				statusMessage: 'user_not_found',
			})
		);
	}

	const image = await addImageIdToUser(user.id, imageId);

	return image;
});

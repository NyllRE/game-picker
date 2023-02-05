/** @format */

//=>> Nuxt will automatically read in any file in the ~/server/middleware to create server middleware for your project.
//=>> Middleware handlers will run on every request before any other server route to add or check headers, log requests, or extend the event's request object.
//=> https://nuxt.com/docs/guide/directory-structure/server#server-middleware

import UrlPattern from 'url-pattern';
import { getUserById } from '~~/server/db/users';
import { decodeAccessToken } from '~~/server/utils/jwt';

export default defineEventHandler(async (event) => {
	const endpoints = ['/api/auth/user'];

	const isHandledByMiddleware = endpoints.some((endpoint) => {
		const pattern = new UrlPattern(endpoint);
		return pattern.match(event.node.req.url!);
	});

	if (!isHandledByMiddleware) return;

	const token = event.node.req.headers['authorization']?.split(' ')[1]!;
	// console.log('middleware: ', event.node.req.headers);

	const decoded = decodeAccessToken(token);

	if (!decoded) {
		return sendError(
			event,
			createError({
				statusCode: 401,
				statusMessage: 'Unauthorized',
			})
		);
	}

	try {
		const userId = decoded.id;
		const user = await getUserById(userId);
		event.context.auth = { user };
	} catch (err) {
		console.error(err);

		return null;
	}
});

/** @format */

// export default defineEventHandler( (event) => {
//    //=>> Nuxt will automatically read in any file in the ~/server/middleware to create server middleware for your project.
//    //=>> Middleware handlers will run on every request before any other server route to add or check headers, log requests, or extend the event's request object.
//    //=> https://nuxt.com/docs/guide/directory-structure/server#server-middleware

//    console.log('New request: ' + event.node.req.url)
// })

/** @format */
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

	const decoded = decodeAccessToken(token);
	// console.log(event.node.req.headers['cookie']?.split('=')[1]);
	console.log(token);

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
		console.log(event.context.auth);
	} catch (err) {
		console.error(err);

		return null;
	}
});

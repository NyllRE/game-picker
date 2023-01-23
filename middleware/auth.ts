/** @format */
import UrlPattern from 'url-pattern';
import { getUserById } from '~~/server/db/users';
import { decodeAccessToken } from '~~/server/utils/jwt';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineEventHandler(async (event) => {
	const endpoints = ['/api/auth/user'];

	const isHandledByMiddleware = endpoints.some((endpoint) => {
		const pattern = new UrlPattern(endpoint);
		return pattern.match(event.node.req.url!);
	});

	if (!isHandledByMiddleware) return;

	const token = event.node.req.headers['authorization']?.split(' ')[1]!;

	const decoded = decodeAccessToken(token);

	if (!decoded) {
		return sendError(
			event,
			createError({
				statusCode: 401,
				message: 'Unauthorized',
			})
		);
	}

	try {
		const userId = decoded.id;
		const user = await getUserById(userId);
		event.context.auth = { user };
	} catch {
		return null;
	}
});

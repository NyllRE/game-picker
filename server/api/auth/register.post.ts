/** @format */
import { sendError } from 'h3';
import { createUser } from '../../db/users';

export default defineEventHandler(async (event) => {
	const body = await readBody(event);

	const { username, password } = body;

	if (!username || !password) {
		return sendError(
			event,
			createError({
				statusCode: 400,
				statusMessage: 'no username or password',
			})
		);
	}

	const user = await createUser({
		username,
		password,
	});

	return {
		id: user.id,
		username: user.username,
		updated: user.updated,
		role: user.role,
	};
});

/** @format */
import { addRole } from '../../db/modifySchema';

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const user = event.context.auth?.user;

	const { role } = body;

	console.log(user);
	if (user.roleName === 'BASIC') {
		return sendError(
			event,
			createError({
				statusCode: 403,
				statusMessage: 'you cant modify roles',
			})
		);
	} else if (user.roleName === 'ADMIN') {
		return await addRole(role);
	} else {
		return sendError(
			event,
			createError({
				statusCode: 500,
				statusMessage: 'Unknown role',
			})
		);
	}
});

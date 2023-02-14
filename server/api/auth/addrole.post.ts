/** @format */
import { addRole } from '../../db/modifySchema';

export default defineEventHandler(async (event) => {
	const body = await readBody(event);

	const { role } = body;

	return await addRole(role);
});

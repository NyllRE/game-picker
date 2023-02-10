/** @format */

import { removeRefreshToken } from '~~/server/db/refreshTokens';
import { sendRefreshToken } from '~~/server/utils/jwt';

/** @format */
export default defineEventHandler(async (event) => {
	try {
		const refreshToken = getCookie(event, 'refresh_token');
		await removeRefreshToken(refreshToken);
	} catch (error) {}

	await sendRefreshToken(event, null);

	return 200;
});

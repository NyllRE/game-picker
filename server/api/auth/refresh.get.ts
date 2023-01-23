/** @format */

import { getRefreshTokenByToken } from '~~/server/db/refreshTokens';
import { getUserById } from '~~/server/db/users';
import { decodeRefreshToken, generateTokens } from '~~/server/utils/jwt';

export default defineEventHandler(async (event) => {
	const refreshToken: string | null = getCookie(event, 'refresh_token') || null;

	if (!refreshToken) {
		return sendError(
			event,
			createError({
				statusMessage: 'Refresh token is invalid',
				statusCode: 401,
			})
		);
	}

	const tokenFromDb = await getRefreshTokenByToken(refreshToken);

	if (!tokenFromDb) {
		return sendError(
			event,
			createError({
				statusMessage: 'Refresh token is invalid',
				statusCode: 401,
			})
		);
	}

	//=>> checking if token is expired
	const decodedToken = decodeRefreshToken(refreshToken);

	if (decodedToken) {
		try {
			const user = await getUserById(decodedToken.id);

			// @ts-expect-error: user is declared don't worry
			const { accessToken } = generateTokens(user);

			return { accessToken };
		} catch (e) {
			return sendError(
				event,
				createError({
					statusMessage: 'Something went wrong',
					statusCode: 500,
				})
			);
		}
	}

	return {
		hello: decodedToken,
	};
});

//=

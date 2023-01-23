/** @format */

import { getUserByUsername } from '~~/server/db/users';

import { User } from '@prisma/client';

import bcrypt from 'bcryptjs';
import { generateTokens } from '~~/server/utils/jwt';
import { createRefreshToken } from '~~/server/db/refreshTokens';

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

	//=>> cheking if user is registered
	const user: User | null = await getUserByUsername(username);

	if (!user) {
		return sendError(
			event,
			createError({
				statusCode: 404,
				statusMessage: 'user not found',
			})
		);
	}

	//=>> comparing passwords
	const passwordsMatch = await bcrypt.compare(password, user.password);

	if (!passwordsMatch) {
		return sendError(
			event,
			createError({
				statusCode: 404,
				statusMessage: 'password is incorrect',
			})
		);
	}

	//=>> generating tokens -> saving token to db
	const { accessToken, refreshToken } = generateTokens(user);

	await createRefreshToken({
		token: refreshToken,
		userId: user.id,
	});

	//=>> add httponly token
	setCookie(
		event, //=> ??
		'refresh_token',
		refreshToken,
		{ httpOnly: true }
	);

	return {
		user: {
			id: user.id,
			username: user.username,
			accessToken,
		},
	};
});

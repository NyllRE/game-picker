/** @format */

import { User } from '@prisma/client';
import { H3Event } from 'h3';
import jwt from 'jsonwebtoken';

const config = useRuntimeConfig();

const generateAccessToken = (user: User) => {
	return jwt.sign(
		{ id: user.id },
		config.jwtAccessSecret, //=> defined in .env file
		{ expiresIn: '10m' }
	);
};

const generateRefreshToken = (user: User) => {
	return jwt.sign(
		{ id: user.id },
		config.jwtRefreshSecret, //=> defined in .env file
		{ expiresIn: '30d' }
	);
};

export const generateTokens = (user: User) => {
	return {
		accessToken: generateAccessToken(user),
		refreshToken: generateRefreshToken(user),
	};
};

export const decodeRefreshToken = (refreshToken: string): any => {
	try {
		return jwt.verify(refreshToken, config.jwtRefreshSecret);
	} catch (error) {
		return null;
	}
};

export const decodeAccessToken = (accessToken: string): any => {
	try {
		return jwt.verify(accessToken, config.jwtAccessSecret);
	} catch (error) {
		return null;
	}
};

export const sendRefreshToken = (event: H3Event, token: string | null) => {
	setCookie(event, 'refresh_token', token!, {
		httpOnly: true,
	});
}; 
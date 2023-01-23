/** @format */
import { prisma } from '.';

export const createRefreshToken = (refreshToken: any) => {
	return prisma.refreshToken.create({
		data: refreshToken,
	});
};

export const getRefreshTokenByToken = (token: any) => {
	return prisma.refreshToken.findUnique({
		where: { token },
	});
};

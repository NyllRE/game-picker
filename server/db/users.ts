/** @format */

import { prisma } from '.';
import bcrypt from 'bcryptjs';

export const createUser = async (userData: any) => {
	const securedData = {
		...userData,
		password: bcrypt.hashSync(userData.password, 10),
	};

	return prisma.user.create({
		data: securedData,
	});
};

export const getUserByUsername = async (username: string) => {
	return await prisma.user.findUnique({ where: { username } });
};

export const getUserById = async (id: string) => {
	return await prisma.user.findUnique({ where: { id } });
};

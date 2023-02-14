/** @format */

import { prisma } from '.';

export const addRole = async (role: string) => {
	return await prisma.role.create({
		data: {
			name: role,
		},
	});
};

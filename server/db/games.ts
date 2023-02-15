/** @format */

import { prisma } from '.';
export const getAllGames = async () => {
	return await prisma.game.findMany();
};

export const addGame = async (game: any) => {
	game = JSON.parse(game);
	console.log(game, typeof game);

	return await prisma.game.create({
		data: {
			name: game.name,
		},
	});
};

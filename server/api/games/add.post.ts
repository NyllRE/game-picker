/** @format */

import { addGame, getAllGames } from '~~/server/db/games';

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const user = event.context.auth?.user;

	const addedGame = await addGame(body);

	return {
		games: addedGame,
	};
});

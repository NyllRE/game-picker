/** @format */

import { getAllGames } from '~~/server/db/games';

export default defineEventHandler(async (event) => {
	const user = event.context.auth?.user;
	const games = await getAllGames();
	return games;
});

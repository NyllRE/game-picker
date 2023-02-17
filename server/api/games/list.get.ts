/** @format */
// const user = event.context.auth?.user;

import { getAllGames } from '~~/server/db/games';

export default defineEventHandler(async (event) => {
	const games = await getAllGames();
	return games;
});

/** @format */

import {
	fetchAndStoreGames,
	fetchAndStoreGamesFaster,
} from '~~/server/db/games';

export default defineEventHandler(async (event) => {
	// const user = event.context.auth?.user;

	console.log('attempting to fetch games');
	const fetchedGames = await fetchAndStoreGamesFaster();

	return fetchedGames;
});

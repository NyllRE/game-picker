/** @format */

import {
	fetchAndStoreGames,
	fetchAndStoreGamesFaster,
} from '~~/server/db/games';

function range(start: number, end: number, step = 1) {
	const result = [];
	for (let i = start; i <= end; i += step) {
		result.push(i);
	}
	return result;
}

interface Queries {
	range: number;
	atonce: number;
}

export default defineEventHandler(async (event) => {
	// const user = event.context.auth?.user;
	let query = getQuery(event) as unknown as Queries;

	console.log(
		`attempting to fetch games:\nrange: ${query.range}\nAt Once: ${query.atonce}`
	);
	const fetchedGames = [];
	for (const i in range(1, query.range)) {
		fetchedGames.push(await fetchAndStoreGamesFaster(query.atonce));
	}

	return fetchedGames;
});

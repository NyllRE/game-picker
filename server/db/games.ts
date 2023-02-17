/** @format */

import { prisma } from '.';
export const getAllGames = async () => {
	return await prisma.game.findMany();
};

export const addGame = async (game: any) => {
	console.log(game, typeof game);

	return await prisma.game.create({
		data: {
			name: game.name,
		},
	});
};

function remFromArray(arr: number[], num: any) {
	const index = arr.indexOf(num);
	if (index !== -1) {
		arr.splice(index, 1);
	}
	return arr;
}

export const fetchAndStoreGames = async () => {
	try {
		// Fetch all games from the Steam API
		const appListResponse = await fetch(
			'http://api.steampowered.com/ISteamApps/GetAppList/v0002/'
		);
		const appListJson = await appListResponse.json();
		const appList = appListJson.applist.apps;

		let progress = 0;

		console.log('now we will try to fetch the list');

		//=>> Loop through each game and fetch its data from the Steam API
		for (const app of appList) {
			try {
				progress++;

				const exists = await prisma.fetched.findFirst({
					where: {
						gameid: Number(app.appid),
					},
				});
				if (exists != null) {
					continue;
				}

				const appDetailsResponse = await $fetch(
					`http://store.steampowered.com/api/appdetails?appids=${app.appid}`
				).catch((err: any) => {
					return Error(err);
				});

				//=>> only check if it is fetched after actually fetching
				if (exists == null) {
					console.log(
						`${progress} out of ${appList.length} (%${
							(progress / appList.length) * 100
						}) - new`
					);
					await prisma.fetched.create({
						data: {
							gameid: Number(app.appid),
						},
					});
				}

				const appDetails = appDetailsResponse[app.appid].data;
				const status: boolean = appDetailsResponse[app.appid].success;

				//=>> check if the game exists
				if (status == false) {
					console.log('Skipped: ', app.appid);
					continue;
				}
				console.log(`Saving:  ${appDetails.steam_appid} ${appDetails.name}`);
				const constructedData = {
					name: appDetails.name,
					short_description: appDetails.short_description,
					header_image: appDetails.header_image,
					website: appDetails.website,
					developers: {
						connectOrCreate: appDetails.developers.map((developer: string) => ({
							where: { name: developer },
							create: { name: developer },
						})),
					},
					publishers: {
						connectOrCreate: appDetails.publishers.map((publisher: string) => ({
							where: { name: publisher },
							create: { name: publisher },
						})),
					},
					genres: {
						connectOrCreate: appDetails.genres.map(
							(genre: { id: string; description: string }) => ({
								where: {
									genreid: Number(genre.id),
								},
								create: {
									genreid: Number(genre.id),
									name: genre.description,
								},
							})
						),
					},
					rating: appDetails.metacritic
						? appDetails.metacritic.score / 100
						: null,
				};
				//=>> Store the game in the Prisma database
				await prisma.game.upsert({
					where: { id: appDetails.steam_appid },
					update: constructedData,
					create: {
						id: appDetails.steam_appid,
						...constructedData,
					},
				});
			} catch (err) {
				console.error(`Skipped: didn't fill data properly: ${err}`);
				continue;
			}
		}

		console.log('Finished fetching and storing games');

		return await getAllGames();
	} catch (error) {
		console.error(error);
		return error;
	} finally {
		await prisma.$disconnect();
	}
};
export const fetchAndStoreGamesFaster = async (atOnce: number) => {
	try {
		// Fetch all games from the Steam API
		const appListResponse = await fetch(
			'http://api.steampowered.com/ISteamApps/GetAppList/v0002/'
		);
		const appListJson = await appListResponse.json();
		const appList = appListJson.applist.apps;

		let progress = 0;

		console.log('now we will try to fetch the list');

		/**
		 * ### These are the ids that we will then clean up
		 */
		let appTrigger: number[] = [1326560, 1326590, 1326650]; //=>> we will collect each ${atOnce} games at one time
		let fetchedGamesCount = 0;

		/**
		 * ### These urls does not exist in the API, so we need to fetch them
		 */
		let urls: string[] = [];
		//=>> Loop through each game and fetch its data from the Steam API
		for (const app of appList) {
			if (appTrigger.length < atOnce) {
				appTrigger.push(app.appid);
			} else {
				//=>> create the batch of urls to fetch
				for (const idx in appTrigger) {
					progress++;
					//=>> we have to check if we already fetched this game
					const exists = await prisma.fetched.findFirst({
						where: {
							gameid: Number(app.appid),
						},
					});
					if (exists != null) {
						appTrigger = remFromArray(appTrigger, appTrigger[idx]);
						continue;
					}

					//==<< if we did not fetch this game before, we will add it to the database >>==//
					urls.push(
						`http://store.steampowered.com/api/appdetails?appids=${appTrigger[idx]}`
					);

					fetchedGamesCount++;
					console.log(
						`${progress} out of ${appList.length} (%${String(
							(progress / appList.length) * 100
						).slice(0, 4)}) - new`
					);

					//! we will add them to the database later
					// await prisma.fetched.create({
					// 	data: {
					// 		gameid: Number(app.appid),
					// 	},
					// });
				}
				// appTrigger = urls.length < 10 ? [] : appTrigger; //=>> Reset the array if it's 10 or greater
				if (urls.length <= atOnce) continue;
				console.log(fetchedGamesCount, urls);

				console.log(`just got ${urls.length} urls\n`);

				const promises = urls.map((url) =>
					fetch(url).then((response) => response.json())
				);
				const data = await Promise.all(promises)
					.then((data) => {
						// data will be an array containing the JSON data from each URL
						return data;
					})
					.catch((error) => {
						return error;
					});

				return data;
				// return appDetailsResponse;

				// const appDetails = appDetailsResponse[app.appid].data;
				// const status: boolean = appDetailsResponse[app.appid].success;
			}
		}
	} catch (error) {
		console.error(error);
		return error;
	} finally {
		await prisma.$disconnect();
	}
};

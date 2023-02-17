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
export const fetchAndStoreGamesFaster = async () => {
	try {
		// Fetch all games from the Steam API
		const appListResponse = await fetch(
			'http://api.steampowered.com/ISteamApps/GetAppList/v0002/'
		);
		const appListJson = await appListResponse.json();
		const appList = appListJson.applist.apps;

		let progress = 0;

		console.log('now we will try to fetch the list');

		let appTrigger = []; //=>> we will collect each 10 games at one time

		//=>> Loop through each game and fetch its data from the Steam API
		for (const app of appList) {
			if (appTrigger.length < 10) {
				appTrigger.push(app.appid);
			} else {
				const urls = appTrigger.map(
					(appid) =>
						`http://store.steampowered.com/api/appdetails?appids=${appid}`
				); //=>> join the array into a comma separated string
				const promises = urls.map((url) =>
					fetch(url).then((response) => response.json())
				);
				Promise.all(promises)
					.then((data) => {
						// data will be an array containing the JSON data from each URL
						return data;
					})
					.catch((error) => {
						return error;
					});

				appTrigger = []; //=>> Reset the array
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


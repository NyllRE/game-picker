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

class InconclusiveError extends Error {
	constructor(message: any) {
		super(message);
		this.name = 'InconclusiveError';
		this.message = message;
	}
}

const saveGame = async (appDetails: any) => {
	try {
		const constructedData = {
			name: appDetails.name,
			short_description: appDetails.short_description
				? appDetails.short_description
				: appDetails.detailed_description,
			header_image: appDetails.header_image
				? appDetails.header_image
				: undefined,
			website: appDetails.website ? appDetails.website : undefined,
			developers: {
				connectOrCreate: appDetails.developers
					? appDetails.developers.map((developer: string) => ({
							where: { name: developer },
							create: { name: developer },
					  }))
					: undefined,
			},
			publishers: {
				connectOrCreate: appDetails.publishers
					? appDetails.publishers.map((publisher: string) => ({
							where: { name: publisher },
							create: { name: publisher },
					  }))
					: undefined,
			},
			genres: {
				connectOrCreate: appDetails.genres
					? appDetails.genres.map(
							(genre: { id: string; description: string }) => ({
								where: {
									genreid: Number(genre.id),
								},
								create: {
									genreid: Number(genre.id),
									name: genre.description,
								},
							})
					  )
					: undefined,
			},
			categories: {
				connectOrCreate: appDetails.categories.map(
					(category: { id: number; description: string }) => ({
						where: {
							categoryid: category.id,
						},
						create: {
							categoryid: category.id,
							name: category.description,
						},
					})
				),
			},
			rating: appDetails.metacritic
				? appDetails.metacritic.score / 100
				: undefined,
		};
		//=>> Store the game in the Prisma database
		return await prisma.game.upsert({
			where: { id: appDetails.steam_appid },
			update: constructedData,
			create: {
				id: appDetails.steam_appid,
				...constructedData,
			},
		});
	} catch (error) {
		return `data was not filled correctly ${error}`;
	}
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
					categories: {
						connectOrCreate: appDetails.categories.map(
							(category: { id: number; description: string }) => ({
								where: {
									categoryid: category.id,
								},
								create: {
									categoryid: category.id,
									name: category.description,
								},
							})
						),
					},
					rating: appDetails.metacritic
						? appDetails.metacritic.score / 100
						: null,
				};
				console.log(constructedData);

				//=>> Store the game in the Prisma database
				return await prisma.game.upsert({
					where: { id: appDetails.steam_appid },
					update: constructedData,
					create: {
						id: appDetails.steam_appid,
						...constructedData,
						categories: {
							connectOrCreate: appDetails.categories.map(),
						},
					},
				});
			} catch (err) {
				console.error(`Skipped: didn't fill data properly: ${err}`);
				continue;
			}
		}

		console.log('Finished fetching and storing games');
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
		let appTrigger: number[] = []; //=>> we will collect each ${atOnce} games at one time

		/**
		 * ### These urls does not exist in our database, so we need to fetch them
		 */
		let urls: string[] = [];
		//=>> Loop through each game and fetch its data from the Steam API
		for (const app of appList) {
			if (appTrigger.length < atOnce) {
				appTrigger.push(app.appid);
			} else {
				//=>> create the batch of urls to fetch
				let alreadyDone = 0;
				for (const idx in appTrigger) {
					if (appTrigger[idx] === alreadyDone) return Error('WHAT?');
					alreadyDone = appTrigger[idx];
					progress++;
					// console.log(JSON.stringify(appTrigger[idx]));

					//=>> we have to check if we already fetched this game
					const exists = await prisma.fetched.findFirst({
						where: {
							gameid: Number(app.appid),
						},
					});
					const stored = await prisma.game.findFirst({
						where: {
							id: Number(app.appid),
						},
					});

					if (exists != null || stored != null) {
						appTrigger = remFromArray(appTrigger, appTrigger[idx]);
						// console.log(`skipped ${exists.gameid}`);
						continue;
					}

					//=>> if we did not fetch this game before, we will add it to the database
					urls.push(
						`http://store.steampowered.com/api/appdetails?appids=${appTrigger[idx]}`
					);

					console.log(
						`(%${String((progress / appList.length) * 100).slice(
							0,
							4
						)}) ${progress}/${appList.length} ${appTrigger[idx]}`
					);
				}
				appTrigger = urls.length < atOnce ? [] : appTrigger; //=>> Reset the array if it's ${atOnce} or greater
				if (urls.length < atOnce) {
					continue;
				}

				console.log(`just got ${urls.length} urls\n`);

				const promises = urls.map((url) =>
					fetch(url)
						.then((response): {} => response.json())
						.then(async (app: any) => {
							if (app == null) return new InconclusiveError('Limited requests');
							const entries = Object.entries(app);
							const [steam_appid, appData]: any[] = entries[0];
							const appDetails = appData.data;

							const status: boolean = appData.success;
							try {
								//=>> the saveGame function saves it, we put it to the completedData array just for a response
								if (!status) return status; //=> skipping if fetching failed
								const game = await saveGame({
									steam_appid,
									...appDetails,
								}).catch((error) => error.message);

								return game;
							} catch (e) {
								console.error(`data was incomplete ${JSON.stringify(e)}`);
								return e;
							}
							// return app;
						})
				);
				const data = await Promise.all(promises).then(
					async (data: object[]) => {
						//=>> data will be an array containing the JSON data from each URL

						let game: any;
						for (game in data) {
							game = data[game];
							if (!game.id) continue;

							const fetched = await prisma.fetched.findFirst({
								where: {
									gameid: Number(game.id),
								},
							});

							if (fetched != null) continue;

							await prisma.fetched.create({
								data: {
									gameid: Number(game.id),
								},
							});
						}

						return data;
					}
				);
				return data;
			}
		}
	} catch (error) {
		console.error(error);
		return error;
	} finally {
		await prisma.$disconnect();
	}
};

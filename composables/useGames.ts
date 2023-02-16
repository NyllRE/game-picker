/** @format */

export default () => {
	const config = useAppConfig();
	const useLoading = () => useState<boolean>('auth_loading', () => false);
	const gamesList = () => useState<Array<{}>>('games_list');

	const getGames = async () => {
		return new Promise(async (resolve, reject) => {
			try {
				useLoading().value = true;
				const data = await useFetchApi(`${config.url}/api/games/list`);

				gamesList().value = data;

				resolve({
					status: 200,
					response: true,
				});
				useLoading().value = false;
			} catch (error: any) {
				reject({
					status: error.status,
					response: error,
				});
			}
		});
	};

	return {
		getGames,
		gamesList,
		useLoading,
	};
};

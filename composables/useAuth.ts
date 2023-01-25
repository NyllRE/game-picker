/** @format */

export default () => {
	const config = useAppConfig();
	console.log(config);
	const useAuthToken = () => useState('auth_token');
	const useAuthUser = () => useState('auth_user');

	const setToken = (newToken: string) => {
		const authToken = useAuthToken();
		authToken.value = newToken;
	};

	const setUser = (newUser: string) => {
		const authUser = useAuthUser();
		authUser.value = newUser;
	};

	const login = async ({ username, password }: any) => {
		return new Promise(async (resolve, reject) => {
			try {
				const data = await $fetch(`${config.url}/api/auth/login`, {
					method: 'POST',
					body: { username, password },
				});
				setToken(data.accessToken);
				setUser(data.user);

				resolve(true);
			} catch (error) {
				reject(error);
			}
		});
	};

	const refreshToken = async () => {
		return new Promise(async (resolve, reject) => {
			try {
				const data = await $fetch(`${config.url}/api/auth/refresh`);
				setToken(data.accessToken);
				resolve(true);
			} catch (error) {
				reject(error);
			}
		});
	};

	const initAuth = async () => {
		return new Promise(async (resolve, reject) => {
			try {
				await refreshToken();
				resolve(true);
			} catch (error) {
				reject(error);
			}
		});
	};


	const getUser = () => {
		return new Promise(async (resolve, reject) => {
			try {
				const data = await $fetch(`${config.url}/api/auth/user`, {
					Headers: {
						Authorization: `Bearer ${useAuthToken().value}`,
					},
				});

				setUser(data.user);
				resolve(true);
			} catch (error) {
				reject(error);
			}
		});
	};

	return {
		login,
		useAuthToken,
		useAuthUser,
		setToken,
		setUser,
		refreshToken,
		initAuth,
		getUser,
	};
};

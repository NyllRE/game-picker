/** @format */

export default () => {
	const config = useAppConfig();
	const useLoading = () => useState<boolean>('auth_loading', () => false);
	const useAuthToken = () => useState<string>('auth_token');
	const useAuthUser = () =>
		useState<string | null>('auth_user', () =>
			localStorage.getItem('auth_user')
		);

	const setToken = (newToken: string): void => {
		const authToken = useAuthToken();
		authToken.value = newToken;
	};

	const setUser = (newUser: string): void => {
		const authUser = useAuthUser();
		authUser.value = newUser;

		localStorage.setItem('auth_user', newUser);
	};

	const newSetUser = (newUser: string): void => {
		const authUser = useAuthUser();
		authUser.value = JSON.stringify(newUser);

		localStorage.setItem('auth_user', JSON.stringify(newUser));
	};

	const login = async ({ username, password }: any): apiRequest => {
		return new Promise(async (resolve, reject) => {
			try {
				useLoading().value = true;
				const data = await $fetch(`${config.url}/api/auth/login`, {
					method: 'POST',
					body: { username, password },
				});
				setToken(data.user.accessToken);
				setUser(
					JSON.stringify({
						id: data.user.id,
						name: data.user.username,
					})
				);

				useLoading().value = false;

				resolve({
					status: 200,
					response: true,
				});
			} catch (error: any) {
				reject({
					status: error.status,
					response: error,
				});
			}
		});
	};

	const logout = async (): apiRequest => {
		return new Promise(async (resolve, reject) => {
			try {
				useLoading().value = true;
				const data = await useFetchApi(`${config.url}/api/auth/logout`, {
					method: 'POST',
				});
				newSetUser(null);

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

	const register = async ({
		username,
		password,
	}: {
		username: string;
		password: string;
	}): apiRequest => {
		return new Promise(async (resolve, reject) => {
			try {
				useLoading().value = true;
				const registerData = await $fetch(`${config.url}/api/auth/register`, {
					method: 'POST',
					body: { username, password },
				});

				await login({ username, password });

				useLoading().value = false;

				resolve({
					status: 200,
					response: true,
				});
			} catch (error) {
				reject(error);
			}
		});
	};

	const refreshToken = async (): apiRequest => {
		return new Promise(async (resolve, reject) => {
			try {
				const data = await $fetch(`${config.url}/api/auth/refresh`);
				setToken(data.accessToken);
				resolve({
					status: 200,
					response: true,
				});
			} catch (error) {
				reject(error);
			}
		});
	};

	const initAuth = async (): apiRequest => {
		return new Promise(async (resolve, reject) => {
			try {
				useLoading().value = true;
				await refreshToken();
				useLoading().value = false;
				resolve({
					status: 200,
					response: true,
				});
			} catch (error) {
				reject(error);
			}
		});
	};

	const getUser = (): apiRequest => {
		return new Promise(async (resolve, reject) => {
			try {
				const data = await useFetchApi(`${config.url}/api/auth/user`);

				setUser(data.user);
				resolve({
					status: 200,
					response: true,
				});
			} catch (error) {
				reject(error);
			}
		});
	};

	const changeImage = (imageId: string): apiRequest => {
		return new Promise(async (resolve, reject) => {
			try {
				await useFetchApi(`${config.url}/api/auth/image`, {
					method: 'PUT',
					body: {
						userId: JSON.parse(useAuthUser().value!).id,
						imageId: imageId,
					},
				})
					.then((response) => {
						const user = JSON.parse(useAuthUser().value!);

						setUser(
							JSON.stringify({
								id: user.id,
								name: user.name,
								imageId: imageId,
							})
						);

						resolve({
							status: 200,
							response: response,
						});
					})
					.catch((err) => {
						console.log(err);

						reject({
							status: 400,
							response: 'There was a connection error',
						});
					});
			} catch (error) {
				console.log(error);
			}
		});
	};

	return {
		useAuthToken,
		refreshToken,
		useAuthUser,
		changeImage,
		useLoading,
		register,
		initAuth,
		setToken,
		setUser,
		getUser,
		logout,
		login,
	};
};

type apiRequest = Promise<{ status: number; response: any }>;

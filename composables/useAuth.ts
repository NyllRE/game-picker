/** @format */
import type { Ref } from 'nuxt/dist/app/compat/capi';

export default () => {
	const config = useAppConfig();
	const useLoading = () => useState<boolean>('auth_loading', () => true);
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

	const login = async ({ username, password }: any): Promise<true | string> => {
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

				resolve(true);
			} catch (error) {
				reject(error);
			}
		});
	};

	const register = async ({
		username,
		password,
	}: {
		username: string;
		password: string;
	}): Promise<true | string> => {
		return new Promise(async (resolve, reject) => {
			try {
				useLoading().value = true;
				const registerData = await $fetch(`${config.url}/api/auth/register`, {
					method: 'POST',
					body: { username, password },
				});

				await login({ username, password });

				useLoading().value = false;

				resolve(true);
			} catch (error) {
				reject(error);
			}
		});
	};

	const refreshToken = async (): Promise<true | string> => {
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

	const initAuth = async (): Promise<true | string> => {
		return new Promise(async (resolve, reject) => {
			try {
				useLoading().value = true;
				await refreshToken();
				useLoading().value = false;
				resolve(true);
			} catch (error) {
				reject(error);
			}
		});
	};

	const getUser = (): Promise<true | string> => {
		return new Promise(async (resolve, reject) => {
			try {
				const data = await useFetchApi(`${config.url}/api/auth/user`);

				setUser(data.user);
				resolve(true);
			} catch (error) {
				reject(error);
			}
		});
	};

	return {
		login,
		register,
		useAuthToken,
		useAuthUser,
		setToken,
		setUser,
		refreshToken,
		useLoading,
		initAuth,
		getUser,
	};
};

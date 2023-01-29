/** @format */
import type { Ref } from 'nuxt/dist/app/compat/capi';

export default () => {
	const config = useAppConfig();
	const useLoading = () => useState('auth_loading', () => true);
	const useAuthToken = () => useState('auth_token');
	const useAuthUser = (): Ref<string | null> =>
		useState('auth_user', () => localStorage.getItem('auth_user'));

	const setToken = (newToken: string) => {
		const authToken = useAuthToken();
		authToken.value = newToken;
	};

	const setUser = (newUser: any) => {
		const authUser = useAuthUser();
		authUser.value = newUser;

		localStorage.setItem('auth_user', newUser);
	};

	const login = async ({ username, password }: any) => {
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

	const register = async ({ username, password }: any) => {
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
				useLoading().value = true;
				await refreshToken();
				useLoading().value = false;
				resolve(true);
			} catch (error) {
				reject(error);
			}
		});
	};

	const getUser = () => {
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

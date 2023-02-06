/** @format */


export default async (url: string, options: Options = {}) => {
	const { useAuthToken } = useAuth();

	return await $fetch(url, {
		...options,
		headers: {
			...options.headers,
			Authorization: `Bearer ${useAuthToken().value}`,
		},
	});
};

interface Options {
	headers?: {};
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	body?: any;
}

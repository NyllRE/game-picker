/** @format */

export default (url: string, options: Options = {}) => {
	const { useAuthToken } = useAuth();

	return $fetch(url, {
		...options,
		headers: {
			...options.headers,
			Authorization: `Bearer ${useAuthToken().value}`,
		},
	});
};

interface Options {
	headers?: {};
}

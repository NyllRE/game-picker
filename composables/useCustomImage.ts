/** @format */

import { createAvatar } from '@dicebear/core';
import { lorelei } from '@dicebear/collection';

export default () => {
	const avatarGen = (seed: string): string => {
		return createAvatar(lorelei, {
			seed: seed,
			radius: 5,
			backgroundType: ['gradientLinear'],
			backgroundColor: ['b6e3f4', 'c0aede', 'a1a4f9'],
			backgroundRotation: [45, -45, 135, -135],
		}).toDataUriSync();
	};

	return {
		avatarGen,
	};
};

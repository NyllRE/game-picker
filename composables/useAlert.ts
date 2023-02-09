/** @format */
import { alertController } from '@ionic/core';

export default async (message: any, header: string = 'Alert') => {
	const alert = await alertController.create({
		header: header,
		message: JSON.stringify(message),
		buttons: ['OK'],
	});

	await alert.present();
};

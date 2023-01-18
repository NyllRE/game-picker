<!-- @format -->

<script setup>
const tester = (an) => {
	an.play();
	console.log(an);
};

// Template ref of your element
const squareRef = ref();
// Your animation object
const animation = createAnimation()
	.addElement(squareRef.value)
	.duration(3000)
	.keyframes([
		{ offset: 0, background: 'red' },
		{ offset: 1, background: 'green' },
	]);



const data = ref('fetchin');
onMounted(async () => {
	console.log(squareRef.value, animation);
	animation.play();
	data.value = await $fetch('https://game-picker-p7mfstlo9-nyllre.vercel.app/api/count')
		.then((res) => res.api)
		.catch((e) => 'error: ' + e);
});

const url = ref('');
const tryInternet = async () => {
	// fetch data from url and return it
	data.value = await $fetch(url.value)
		.then((res) => res)
		.catch((e) => 'error: ' + e);
};
</script>

<template lang="pug">
IonPage
	ion-header
		ion-toolbar
			ion-title Animation examples
	IonContent(:fullscreen="true")
		.ion-padding
			h1 {{ data }}
			IonInput( v-model="url" placeholder="try")
			IonButton( expand="block" @click="tryInternet" ) Get
</template>

<style scoped>
.ion-padding {
	padding: 1em;
}
</style>

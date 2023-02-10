<script setup>

const data = ref('fetching');
onMounted(async () => {
	data.value = await $fetch('/api/count', {
		mode: 'no-cors'
	})
		.then((res) => res.api)
		.catch((e) => 'error: ' + e);
});

const url = ref('');
const tryInternet = async () => {
	// fetch data from url and return it
	data.value = await useFetch(url.value)
		.then(res => {
			return res.data;
		})
		.catch((e) => 'error: ' + e)
};

</script>

<template lang="pug">
IonPage
  ion-header
    ion-toolbar
      ion-title API example
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

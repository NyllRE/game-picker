<!-- @format -->

<script setup lang="ts">
import useAvatar from '~~/composables/useAvatar';

const { useAuthUser, useLoading, logout } = useAuth()

let user = $ref<{id: string, name: string, imageId: string}>(JSON.parse(useAuthUser().value!))

watch(useAuthUser(), async (newUser, oldUser): Promise<void> => {
	user = await JSON.parse(newUser!)
})

let profile = $ref('')

onMounted(async () => {
	user = JSON.parse(useAuthUser().value!)
	profile = useAvatar(user.imageId)
})

</script>

<template lang="pug">
IonPage
	ion-header
		ion-toolbar
			ion-title Profile
	IonContent(:fullscreen="true")
		.center( v-if="user" )
			img.profile-image( :src="profile" )
			h1
				b {{ user.name }}
		IonButton( @click="logout" color="danger" ) Logout

</template>

<style scoped>
.center {
  display: grid;
  place-items: center;
  text-align: center;
}
.ion-padding {
	padding: 1em;
}
img.profile-image {
   padding-top: 4em;
   width: 70%;
}
</style>

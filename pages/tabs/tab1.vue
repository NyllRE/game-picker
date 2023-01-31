<!-- @format -->

<script setup>
definePageMeta({
	alias: ['/', '/tabs'],
});
const { useAuthUser } = useAuth()
const user = ref(JSON.parse(useAuthUser().value))

watch(useAuthUser(), async (newUser, oldUser) => {
   user.value = JSON.parse(newUser)
   console.log("DETECTED CHANGE: ", user.value)
})
const isLoading = ref(false);
</script>

<template lang="pug">
ion-page
  ion-header
    ion-toolbar
      ion-title Home
  ion-content(:fullscreen="true")


    ion-loading(
      v-if="loading"
      :is-open="isOpenRef"
      cssClass="my-custom-class"
      message="Please wait..."
      @didDismiss="loading = false"
    )

    HomeAuth( v-else-if="!user")

    .center( v-else )
      h1 Welcome {{ user.name }}!
      img( src="/icon.png" )
      ion-button( @click="" ) change image
</template>


<style lang="sass">

.center
  display: grid
  place-items: center
  text-align: center

</style>
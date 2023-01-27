<!-- @format -->

<script setup>
definePageMeta({
	alias: ['/', '/tabs'],
});
const { useAuthUser } = useAuth()
const user = ref(JSON.parse(useAuthUser().value))
</script>

<template lang="pug">
ion-page
  ion-header
    ion-toolbar
      ion-title Home
  ion-content(:fullscreen="true")


    .loading( v-if="loading" )
      h1 Loading

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
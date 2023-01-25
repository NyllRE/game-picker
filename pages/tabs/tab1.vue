<!-- @format -->

<script setup>
definePageMeta({
	alias: ['/', '/tabs'],
});

const { useAuthUser, login, getUser, useLoading } = useAuth()
const user = ref(JSON.parse(useAuthUser().value))
const loading = useLoading()
console.log(user.value.name);

const form = reactive({
  username: '',
  password: '',
})

const loginUser = () => {
  login({
    username: form.username,
    password: form.password,
  })
}




</script>

<template lang="pug">
ion-page
  ion-header
    ion-toolbar
      ion-title Home
  ion-content(:fullscreen="true")

    .loading( v-if="loading")
      h1 Loading

    .ion-padding( v-else-if="!user" )
      ion-item
        ion-label( position="floating" ) Username
        ion-input( v-model.lazy="form.username" )
      ion-item
        ion-label( position="floating" ) Password
        ion-input( type="password" v-model.lazy="form.password" )
      ion-button( expand="block" @click="loginUser()" ) Login

    .center( v-else )
      h1 Welcome {{ user.name || 'br' }}!
      img( src="/icon.png" )
      ion-button( @click="" ) change image
</template>


<style lang="sass">

.center
  display: grid
  place-items: center
  text-align: center

</style>
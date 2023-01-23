<!-- @format -->

<script setup lang="ts">
definePageMeta({
	alias: ['/', '/tabs'],
});

const { useAuthUser, login } = useAuth()
const user = useAuthUser()

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
      ion-title Tab 3
  ion-content(:fullscreen="true")
    .ion-padding( v-if="!user" )
      ion-item
        ion-label( position="floating" ) Username
        ion-input( v-model.lazy="form.username" )
      ion-item
        ion-label( position="floating" ) Password
        ion-input( type="password" v-model.lazy="form.password" )
      ion-button( expand="block" @click="loginUser()" ) Login
    h1( v-else ) Welcome!

</template>

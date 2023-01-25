<!-- @format -->

<script setup lang="ts">
definePageMeta({
	alias: ['/', '/tabs'],
});

const { useAuthUser, login, useAuthToken, getUser } = useAuth()
const user = useAuthUser()
const token = useAuthToken()
const config = useAppConfig()

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

const userData = ref()


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
    template( v-else )
      h1 Welcome!
      ion-button( @click="getUser" ) Get User
      p {{ userData }}

</template>

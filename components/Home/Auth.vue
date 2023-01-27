<script setup lang="ts">
const { useAuthUser, login, getUser, useLoading } = useAuth()
const user = ref(JSON.parse(useAuthUser().value as string))
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

const registerUser = () => {
   register({
      username: form.username,
      password: form.password,
   })
}

const isLogin = ref(true)
</script>


<template lang="pug">

.ion-padding(v-if="!user && isLogin")
   ion-item
      ion-label( position="floating" ) Username
      ion-input( v-model.lazy="form.username" )
   ion-item
      ion-label( position="floating" ) Password
      ion-input( type="password" v-model.lazy="form.password" )
   ion-button( expand="block" @click="loginUser()" ) Login

.ion-padding(v-else-if="!user && !isLogin")

</template>
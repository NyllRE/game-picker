<script setup lang="ts">
const { useAuthUser, login, register, getUser, useLoading } = useAuth()
const user = ref(JSON.parse(useAuthUser().value as string))
const loading = useLoading()
console.log(user.value);

watch(useAuthUser(), async (newUser, oldUser) => {
   user.value = JSON.parse(newUser as string)
   console.log("DETECTED CHANGE: ", user.value);
   
})

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

const isLogin = ref(false)
</script>


<template lang="pug">

// Login
.ion-padding(v-if="!user && isLogin")
   ion-item
      ion-label( position="floating" ) Username
      ion-input( v-model.lazy="form.username" )
   ion-item
      ion-label( position="floating" ) Password
      ion-input( type="password" v-model.lazy="form.password" )
   ion-button( expand="block" @click="loginUser()" ) Login
   br
   ion-text.center
      | Not a user?
      a( @click="isLogin = false" ) Register

// Registration 
.ion-padding(v-else-if="!user && !isLogin")
   ion-item
      ion-label( position="floating" ) Username
      ion-input( v-model.lazy="form.username" )
   ion-item
      ion-label( position="floating" ) Password
      ion-input( type="password" v-model.lazy="form.password" )
   ion-button( expand="block" @click="registerUser()" ) Register
   br
   ion-text.center
      | Already have an account?
      a( @click="isLogin = true" ) Login


</template>


<style scoped>

.center {
   grid-auto-flow: column;
   justify-content: center;
   gap: .3em;
}

</style>
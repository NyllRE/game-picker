<!-- @format -->

<script setup lang="ts">
definePageMeta({
	alias: ['/', '/tabs'],
});
const { useAuthUser, useLoading } = useAuth()
const user = ref<{id: string, name: string}>(JSON.parse(useAuthUser().value!))

watch(useAuthUser(), async (newUser, oldUser) => {
   user.value = JSON.parse(newUser!)
})

onMounted(() => {
  useLoading().value = false
  console.log(user.value);
  
})
</script>

<template lang="pug">
ion-page
  ion-header
    ion-toolbar
      ion-title Home
  ion-content(:fullscreen="true")

    ion-loading(
      :is-open="useLoading().value"
      cssClass="my-custom-class"
      :message="useLoading().value"
      @didDismiss="loading = false"
    )

    UIModal( v-if="!user" :open="!user" title="Accounts" )
      HomeAuth

    UIModal( v-else-if="!user.imageId" :open="true" title="Choose Image" )
      HomeImageGen

    .center( v-else )
      h1 Welcome {{ user.name }}!
</template>


<style lang="sass">

.center
  display: grid
  place-items: center
  text-align: center

</style>
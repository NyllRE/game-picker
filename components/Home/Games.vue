<!-- @format -->

<script setup lang="ts">
import useGames from '~~/composables/useGames';


const { getGames, useLoading, gamesList } = useGames()

let listedGames = ref<Array<{}>>([])

onMounted(async () => {
   await getGames()
  listedGames.value = await gamesList()
})
</script>

<template lang="pug">

IonList( :inset="true" )
   IonItem( v-for="game in listedGames.value" :key="game.id" )
      IonLabel {{ game.name }}

</template>


<style lang="sass">

.center
  display: grid
  place-items: center
  text-align: center

</style>
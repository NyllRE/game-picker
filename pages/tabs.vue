<!-- @format -->

<script setup lang="ts">
useHead({
	title: 'Nuxt Ionic',
});
</script>

<template lang="pug">
ion-page
  ion-content
    ion-tabs
      ion-router-outlet
      ion-tab-bar(slot="bottom")
        ion-tab-button(tab="tab1" href="/tabs/tab1")
          ion-icon(:icon="ioniconsHome")
          ion-label Tab 1
        ion-tab-button(tab="tab2" href="/tabs/tab2")
          ion-icon(:icon="ioniconsGlobe")
          ion-label API
        ion-tab-button(tab="tab3" href="/tabs/tab3")
          ion-icon(:icon="ioniconsList")
          ion-label Todo
        ion-tab-button(tab="tab4" href="/tabs/tab4")
          ion-icon(:icon="ioniconsPerson")
          ion-label Profile
</template>

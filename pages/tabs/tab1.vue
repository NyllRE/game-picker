<!-- @format -->

<script setup lang="ts">
definePageMeta({
	alias: ['/', '/tabs'],
});
</script>

<template lang="pug">
ion-page
  ion-header(translucent)
    ion-toolbar
      ion-thumbnail(slot="start")
        ion-img(src="/icon.png")
      ion-title Nuxt Ionic
  ion-content(:fullscreen="true")
    ion-header(collapse="condense")
      ion-toolbar
        ion-title(size="large")
          | Tab 1
    ion-list
      ion-item
        ion-checkbox(slot="start")
        ion-label
          h1 Create Idea
          ion-note Run Idea By Brandy
        ion-badge(slot="end" color="success")
          | 5 Days
</template>

<!-- @format -->

<script setup lang="ts">
definePageMeta({
	alias: ['/', '/tabs'],
});
</script>

<template lang="pug">
ion-page
  ion-header
    ion-toolbar
      ion-title Tab 3
  ion-content(:fullscreen="true")
    ion-header(collapse="condense")
      ion-toolbar
        ion-title(size="large")
          | Tab 1
    ExploreContainer(name="Tab 1 page")

</template>

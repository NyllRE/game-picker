<template lang="pug">
ion-page
  ion-header
    ion-toolbar
      ion-title Tab 3
  ion-content(:fullscreen="true")
    ion-header(collapse="condense")
      ion-toolbar
        ion-title(size="large")
          | Tab 3
    ExploreContainer(name="Tab 3 page")
</template>

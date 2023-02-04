<script setup lang="ts">
import { actionSheetController } from '@ionic/vue'
// import { UserPhoto } from '@/composables/usePhotoGallery'
const { photos, takePhoto, deletePhoto } = usePhotoGallery()

const showActionSheet = async (photo: any) => {
  const actionSheet = await actionSheetController.create({
    header: 'Photos',
    buttons: [
      {
        text: 'Delete',
        role: 'destructive',
        icon: ioniconsTrash,
        handler: () => {
          deletePhoto(photo)
        },
      },
      {
        text: 'Cancel',
        icon: ioniconsClose,
        role: 'cancel',
        handler: () => {
          // Nothing to do, action sheet is automatically closed
        },
      },
    ],
  })
  await actionSheet.present()
}
</script>

<template lang="pug">
ion-page
  ion-header
    ion-toolbar
      ion-title Photo Gallery
  ion-content(:fullscreen="true")
    ion-header(collapse="condense")
      ion-toolbar
        ion-title(size="large")
          | Photo Gallery
    ion-grid
      ion-row
        ion-col(size="6" :key="photo.filepath" v-for="photo in photos")
          ion-img(:src="photo.webviewPath" @click="showActionSheet(photo)")
    ion-fab(vertical="bottom" horizontal="center" slot="fixed")
      ion-fab-button(@click="takePhoto()")
        ion-icon(:icon="ioniconsCamera")
</template>

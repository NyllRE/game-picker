
<script setup lang="ts">
import { alertController } from '@ionic/vue';
import useAvatar from '~~/composables/useAvatar';

const { changeImage } = useAuth()


function randomString(): string {
  let possibleChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return result;
}  

const imgSeed = ref( randomString() )
const svg = ref()
onMounted(() => {
const avatar = useAvatar(imgSeed.value)
   svg.value = avatar;
})

const presentAlert = async (message: any) => {
   const alert = await alertController.create({
      header: 'Alert',
      message: JSON.stringify(message),
      buttons: ['OK'],
   });

   await alert.present();
};
const randomAvatar = (): void => {
   imgSeed.value = randomString();
   svg.value = useAvatar(imgSeed.value)
}

const applyImage = async () => {
   await changeImage(imgSeed.value).then( async (res) => {
      await presentAlert(res.response.imageId)
   }).catch(async (err) => {
      await presentAlert(err.response)
   })

   // if (status === 200) {
   // }
}

</script>

<template lang="pug">
   
ion-content.center
   img.profile-image( :src="svg" )
   
ion-footer.footer.ion-no-border( :translucent="true" )
   ion-toolbar.center
      .image-toolbar
         ion-button( @click="randomAvatar()" shape="round" fill="outline" )
            | change image
            ion-ripple-effect
         ion-button( shape="round" @click="applyImage" )
            | Accept
            ion-ripple-effect

</template>


<style lang="scss">
img.profile-image {
   padding-top: 4em;
   width: 70%;
}


.footer {
   position: fixed;
   bottom: 0;
   padding-left: 10%;
   padding-bottom: 20%;
   width: 90%;
   min-height: 5em;
}

.image-toolbar {
   display: flex;
   flex-direction: column;
}
</style>
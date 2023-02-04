
<script setup lang="ts">
import { createAvatar } from '@dicebear/core';
import { icons } from '@dicebear/collection';

const avatar = createAvatar(icons, {
  seed: "Rio",
  radius: 5
});

const svg = ref(avatar.toString())

function randomString(): string {
  let possibleChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return result;
}

function randomAvatar(): void {
   svg.value = createAvatar(icons, {
      seed: randomString(),
      radius: 5
   }).toString();
}

console.log(svg.value);

</script>

<template lang="pug">

.center
   span.profile-image( v-html="svg" )
   ion-button( @click="randomAvatar" ) change image

</template>


<style lang="scss">

span.profile-image {

   svg {
      height: 200px;
      width: 200px;
   }

}

</style>
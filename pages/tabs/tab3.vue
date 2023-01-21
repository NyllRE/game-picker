<script setup lang="ts">import { alertController } from '@ionic/vue';


const items = ref([
  {
    title: 'Create idea',
    description: 'Create a new idea',
    badge: '5 days'
  }
])

const addTodo = async () => {
  console.log(items.value);
  const alert = await alertController.create({
    header: 'Please enter your todo',
    buttons: ['OK'],
    inputs: [
      {
        placeholder: 'Title',
      },
      {
        type: 'textarea',
        placeholder: 'Description',
        // attributes: {
        //   maxlength: 8,
        // },
      },
      {
        placeholder: 'Badge',
      },
    ],
  });
  await alert.present();

}

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
          | Todo List
    ion-list
      ion-item( v-for="item in items" :key="item.title" )
        ion-checkbox(slot="start")
        ion-label
          h1 {{ item.title }}
          ion-note {{ item.description }}
        ion-badge(slot="end" color="success")
          | {{ item.badge }}
    ion-fab(vertical="bottom" horizontal="center" slot="fixed")
      ion-fab-button(@click="addTodo()")
        ion-icon(:icon="ioniconsAdd")
</template>


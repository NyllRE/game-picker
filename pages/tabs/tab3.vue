<!-- @format -->

<script setup lang="ts">
import { alertController } from '@ionic/vue';

interface todoItem {
  title: string
  description: string
  badge: string
}

const items = useState('todo_items', () => [
	{
		title: "don't use this",
		description: 'It will not be saved',
		badge: 'uselessville',
	},
])

const addItem = (item: todoItem) => {
  items.value.push(item)
}


const addTodo = async () => {
	const alert = await alertController.create({
		header: "Please don't enter an item",
		inputs: [
      {
        name: 'title',
				placeholder: 'Title',
			},
			{
        name: 'description',
				type: 'textarea',
				placeholder: 'Description',
				// attributes: {
				//   maxlength: 8,
				// },
			},
			{
        name: 'badge',
				placeholder: 'Badge',
			},
		],
		buttons: [
			{
				text: 'Cancel',
				role: 'cancel',
				cssClass: 'secondary',
				handler: () => console.log('Confirm Cancel')
			},
			{
				text: 'Ok',
				handler: (item: todoItem) => addItem(item)
			},
		],
	});
	await alert.present();
};
</script>

<template lang="pug">
ion-page
  ion-header(translucent)
    ion-toolbar
      ion-title Nuxt Ionic
  ion-content(:fullscreen="true")
    ion-header(collapse="condense")
      ion-toolbar
        ion-title(size="large")
          | Todo List
    ion-list
      ion-item-sliding( v-for="item in items" :key="item.title" )
        ion-item
          ion-checkbox(slot="start")
          ion-label
            h1 {{ item.title }}
            ion-note {{ item.description }}
          ion-badge(slot="end" color="success")
            | {{ item.badge }}
            
        ion-item-options( side="start" )
          ion-item-option( expandable )
            ion-icon( slot="start" :icon="ioniconsTrash" )
            | useless
				
          ion-item-option( color="secondary" ) kinda useless
        ion-item-options( side="end" ) 
          ion-item-option( color="danger" ) extra useless
          ion-item-option( color="warning" ) also useles

    ion-fab(vertical="bottom" horizontal="center" slot="fixed")
      ion-fab-button(@click="addTodo()")
        ion-icon(:icon="ioniconsAdd")
</template>

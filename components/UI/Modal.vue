<!-- @format -->

<script lang="ts" setup>
const emit = defineEmits(['confirm', 'cancel'])
const props = defineProps<{
	open: boolean,
   title: string,
   cancelButton?: boolean,
}>()

const message = ref(
	'This modal example uses triggers to automatically open a modal when the button is clicked.'
);

const modal = ref();
const input = ref();
const cancel = () => {
	modal.value?.$el.dismiss(null, 'cancel');
	emit('cancel')
};
const confirm = () => {
	modal.value?.$el.dismiss(input.value, 'confirm');
	emit('confirm')
};
const onWillDismiss = (ev: any) => {
	if (ev.detail.role === 'confirm') {
		message.value = `Hello, ${ev.detail.data}!`;
	}
};
</script>

<template lang="pug">
ion-modal(ref="modal" :is-open="open" trigger="open-modal" @willDismiss="onWillDismiss")
   ion-header( mode="ios" )
      ion-toolbar
         ion-buttons(slot="start")
            ion-button(@click="cancel()" v-if="(cancelButton === null ? true : cancelButton)" ) Cancel
         ion-title {{ title }}
         //- ion-buttons(slot="end")
         //- 	ion-button(:strong="true" @click="confirm()") Confirm
   //- ion-content.ion-padding
   slot
</template>
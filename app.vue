<!-- @format -->
<script setup>
const { initAuth } = useAuth()

onBeforeMount(() => {
	initAuth()    
})
</script>

<template>
	<ion-app>
		<ion-router-outlet />
	</ion-app>
</template>

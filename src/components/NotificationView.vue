<script setup lang="ts">

import NotificationBar from './NotificationBar.vue';
</script>

<template>
  <NotificationBar class="f-2 " />
</template>

<style scoped>
.f-2 {
  flex: 2;
  height: 100%;
  width: 100%;
}
</style>

<!--
Este componente:
Não tem lógica própria, ele serve apenas para mostrar a barra de notificações em uma página com tamanho controlado.
Ele aponta para o componente principal, que é o NotificationBar.vue, onde estão os dados e a interação com o usuário.
-->

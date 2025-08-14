<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';

const authStore = useAuthStore();
const router = useRouter();

interface Notification {
  id: number;
  recipient: string;
  sender: {
    username: string;
  }
  message: string;
  created_at: string;
  is_read: boolean;
  post?: {
    id: number;
  };
} /* Define a estrutura esperada de um objeto de notificação. */

const notifications = computed<Notification[]>(() => authStore.notifications || []);

const handleNotificationClick = async (notification: Notification) => {
const token = authStore.accessToken;

  if (authStore.isAuthenticated) {
    try {
      await api.post(
        `https://mpfback-twitterclone.onrender.com/api/notifications/${notification.id}/mark_as_read/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      /* Atualiza apenas a notificação clicada */

      const updated = authStore.notifications.map(n =>
        n.id === notification.id ? { ...n, is_read: true } : n
      );
      authStore.notifications = updated;
      /* Atualiza localmente a notificação para refletir o novo estado (is_read: true). */

      await authStore.fetchUnreadNotifications();
      await authStore.fetchNotifications();
      /* Recarrega a lista de notificações e atualiza o número de não lidas.*/

      router.push(`/profile/${notification.sender.username}`);
      /* Redireciona para o perfil do remetente da notificação.*/

    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }
};

onMounted(async () => {
  await authStore.fetchNotifications();
}); /* Ao montar o componente, carrega todas as notificações da API via store.*/
</script>


<template>
  <div class="container-post">
    <div class="header">
      <h3>Notificações</h3>
    </div>
    <div>
      <ul>
        <li v-for="notification in notifications" :key="notification.id">
          <div :class="{ 'card-unread': !notification.is_read, 'card-read': notification.is_read }"
            @click="handleNotificationClick(notification)">
            <p>
              {{ notification.message }}
              <span class="mention"> @{{ notification.sender.username }}</span>
            </p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.notification {
  text-decoration: none;
  color: inherit;
}

span {
  font-weight: 800;
}

.mention {
  margin-left: 4px;
}

ul {
  gap: 8px;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.card-unread {
  display: flex;
  align-items: center;
  width: 80%;
  background-color: var(--blue-pastel);
  margin-left: 16px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
}

.card-read {
  display: flex;
  cursor: pointer;
  align-items: center;
  width: 80%;
  background-color: transparent;
  margin-left: 16px;
  padding: 8px;
  border-radius: 8px;
}

.header {
  max-width: 100%;
  margin: 8px 8px;
}

.header h3 {
  font-family: Inter;
  font-weight: 800;
  color: #1e355e;
  font-size: 24px;
}
</style>

<!--
Este componente:
Mostra a lista de notificações;
Diferencia o que foi lido ou não;
Marca notificações como lidas ao clicar;
Leva o usuário para o perfil do remetente.
-->

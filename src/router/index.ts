import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/components/DashboardView.vue'
import ProfileView from '@/components/ProfileView.vue'
import LoginView from '@/components/LoginView.vue'
import RegisterView from '@/components/RegisterView.vue'
import PasswordView from '@/components/PasswordView.vue'
import ExploreView from '@/components/ExploreView.vue'
import BookmarkView from '@/components/BookmarkView.vue'
import WelcomeView from '@/components/WelcomeView.vue'
import NotificationView from '@/components/NotificationView.vue'
import NotFoundView from '@/components/NotFoundView.vue'

import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', name: 'dashboard', component: DashboardView },
  { path: '/profile/:username/:postId?', name: 'profile', component: ProfileView },
  { path: '/profile/:username/:postId?/followers', name: 'followers', component: ProfileView },
  { path: '/profile/:username/:postId?/following', name: 'following', component: ProfileView },

  { path: '/explore', name: 'explore', component: ExploreView },
  { path: '/notification', name: 'notification', component: NotificationView },
  { path: '/bookmark', name: 'bookmark', component: BookmarkView },
  { path: '/welcome', name: 'welcome', component: WelcomeView },

  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/password', name: 'password', component: PasswordView },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  const publicPages = ['/login', '/register', '/password', '/welcome']
  const isNotFound = to.name === 'NotFound'
  const authRequired = !publicPages.some((page) => to.path.startsWith(page)) && !isNotFound

  if (authRequired && !auth.isAuthenticated) {
    next('/welcome')
  } else {
    next()
  }
})

export default router

import { createRouter, createWebHistory } from 'vue-router';
import Inicio from '../views/Inicio.vue';
import Juego from '../views/Juego.vue';

const routes = [
  {
    path: '/',
    name: 'Inicio',
    component: Inicio
  },
  {
    path: '/juego',
    name: 'Juego',
    component: Juego
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;


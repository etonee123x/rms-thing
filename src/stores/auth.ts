import { defineStore } from 'pinia';
import { ref } from 'vue';

const isAuthed = ref<boolean>(false);
type TryAuth = (arg0: { login: string; password: string; rememberMe: boolean }) => boolean;

export const useAuthStore = defineStore('auth', () => {
  const tryAuth: TryAuth = ({ password, rememberMe }) => {
    if (import.meta.env.VITE_SECRET !== password) return false;
    isAuthed.value = true;
    sessionStorage.setItem('THE_PASSWORD', password);
    if (rememberMe) localStorage.setItem('THE_PASSWORD', password);
    return true;
  };
  return { tryAuth, isAuthed };
});

import { defineStore } from 'pinia';
import { ref } from 'vue';

import { auth } from '@/requests';

const tryAuthWithToken = async (): Promise<boolean> => {
  const token = localStorage.getItem('rms-app-token') || sessionStorage.getItem('rms-app-token');
  if (token) return (await auth.requestAuthByToken(token)).ok;
  return false;
};

const isAuthed = ref<boolean>(await tryAuthWithToken());
type TryGetToken = (arg0: { login: string; password: string; rememberMe: boolean }) => Promise<boolean>;

export const useAuthStore = defineStore('auth', () => {
  const tryGetToken: TryGetToken = async ({ login, password, rememberMe }) => {
    const response = await auth.requestAuthByLoginAndPassword({ login, password });
    if (!response.ok) return false;
    isAuthed.value = true;
    const token = await response.json();
    if (rememberMe) localStorage.setItem('rms-app-token', token);
    sessionStorage.setItem('rms-app-token', token);
    return true;
  };
  return { tryGetToken, isAuthed };
});

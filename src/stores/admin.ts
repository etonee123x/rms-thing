import { defineStore } from 'pinia';
import { ref } from 'vue';

const choosenTracks = ref<File[]>([]);

export const useAdminStore = defineStore('admin', () => {
  const load = (tracks: File[]) => {
    choosenTracks.value = [...tracks];
  };
  return { load, choosenTracks };
});

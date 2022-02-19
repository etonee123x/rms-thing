<template>
  <slot v-if="isAuthed"></slot>
  <form v-else class="auth">
    <BaseInput v-model="model.login" class="auth__login" placeholder="Username" />
    <BaseInput
      v-model="model.password"
      autocomplete="on"
      type="password"
      class="auth__password"
      placeholder="Password"
    />
    <BaseCheckbox v-model="model.rememberMe" class="auth__remember-me">Remember me</BaseCheckbox>
    <BaseButton :enabled="isSubmitButtonEnabled" class="auth__submit-button" @click="tryAuth">Try...</BaseButton>
  </form>
</template>

<script setup lang="ts">
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseCheckbox from '@/components/BaseCheckbox.vue';
import { useAuthStore } from '@/stores/auth';
import { computed, ref, onMounted, ComputedRef } from 'vue';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
let isSubmitButtonEnabled: ComputedRef<boolean>;
const { isAuthed } = storeToRefs(authStore);

onMounted(() => {
  isSubmitButtonEnabled = computed(() => Boolean(model.value.login.length) && Boolean(model.value.password.length));
});

const model = ref<{
  login: string;
  password: string;
  rememberMe: boolean;
}>({
  login: '',
  password: '',
  rememberMe: false,
});

const tryAuth = () => {
  if (!authStore.tryGetToken({ ...model.value })) return console.log('you fucked up');
};
</script>

<style lang="scss" scoped></style>

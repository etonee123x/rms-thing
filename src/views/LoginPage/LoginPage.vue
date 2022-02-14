<template>
  <div class="page">
    <div class="page__authorisation-form">
      <BaseInput v-model="model.login" class="page__login" placeholder="Username" />
      <BaseInput v-model="model.password" type="password" class="page__password" placeholder="Password" />
      <BaseCheckbox v-model="model.rememberMe" class="page__remember-me">Remember me</BaseCheckbox>
      <BaseButton :enabled="isSubmitButtonEnabled" @click="tryAuth">Try...</BaseButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseCheckbox from '@/components/BaseCheckbox.vue';
import { useAuthStore } from '@/stores/auth';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();

const isSubmitButtonEnabled = computed(() => Boolean(model.value.login.length) && Boolean(model.value.password.length));

const router = useRouter();

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
  if (!authStore.tryAuth({ ...model.value })) return console.log('you fucked up');
  return router.push('/admin-page');
};
</script>

<style lang="scss" scoped></style>

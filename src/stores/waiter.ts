import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { Action, ActionGroup } from '@/types';

export const waitersActions: Record<ActionGroup, Record<string, Action>> = {
  THE_ANALYZER: {
    CONVERTING: {
      id: 0,
      text: 'Converting mp3 to wav',
    },
    GETTING_THE_LOUDEST_SEGMENT: {
      id: 1,
      text: 'Finding the loudest segment',
    },
    GETTING_RMS: {
      id: 2,
      text: 'Calculating RMS values',
    },
    GETTING_SPECTRUM: {
      id: 3,
      text: 'Calculating spectrum values',
    },
  },
};

export const useWaiterStore = defineStore('waiter', () => {
  const whatWeAreWaitingFor = ref<Action[]>([]);
  const isWaitingForSomething = computed(() => Boolean(whatWeAreWaitingFor.value.length));

  const addAction = (action: Action) => {
    whatWeAreWaitingFor.value.push(action);
    console.log('+1 action to wait:', whatWeAreWaitingFor.value);
  };

  const removeAction = (action: Action) => {
    whatWeAreWaitingFor.value = whatWeAreWaitingFor.value.filter(el => el.id !== action.id);
    console.log('-1 action to wait:', whatWeAreWaitingFor.value);
  };

  const removeAll = () => {
    whatWeAreWaitingFor.value = [];
  };

  return { isWaitingForSomething, whatWeAreWaitingFor, addAction, removeAction, removeAll };
});

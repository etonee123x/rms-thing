import { AvailableTagTypes } from '@/types';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { tags } from '@/requests';

const artistsList = ref<string[]>([]);
const trackTitlesList = ref<string[]>([]);
const genresList = ref<string[]>([]);
const yearsList = ref<string[]>([]);
const countriesList = ref<string[]>([]);

export const useTagsStore = defineStore('tags', () => {
  const loadByTagType = async (tagType: AvailableTagTypes) => {
    switch (tagType) {
      case 'artists':
        return (artistsList.value = await tags.getByTagType('artists'));
      case 'track-titles':
        return (trackTitlesList.value = await tags.getByTagType('track-titles'));
      case 'genres':
        return (genresList.value = await tags.getByTagType('genres'));
      case 'years':
        return (yearsList.value = await tags.getByTagType('years'));
      case 'countries':
        return (countriesList.value = await tags.getByTagType('countries'));
    }
  };
  const getByTagType = (tagType: AvailableTagTypes) => {
    switch (tagType) {
      case 'artists':
        return artistsList;
      case 'track-titles':
        return trackTitlesList;
      case 'genres':
        return genresList;
      case 'years':
        return yearsList;
      case 'countries':
        return countriesList;
    }
  };
  return {
    loadByTagType,
    getByTagType,
    artistsList,
    trackTitlesList,
    genresList,
    yearsList,
    countriesList,
  };
});

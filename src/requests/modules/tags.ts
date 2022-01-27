import { AvailableTagTypes } from '@/types';
import { get } from '../requests';

const modulePath = '/tags';

export default {
  async getByTagType(tagType: AvailableTagTypes): Promise<string[]> {
    return (await get(`${modulePath}/${tagType}`)).json();
  },
};

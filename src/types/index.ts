type AvailableTagTypes =
  | 'artists'
  | 'track-titles'
  | 'genres'
  | 'countries'
  | 'years';
type AvailableTagViews = 'text' | 'combobox';

type TagType = {
  title: string;
  tagType: AvailableTagTypes;
  view: AvailableTagViews;
};

export { TagType, AvailableTagTypes, AvailableTagViews };

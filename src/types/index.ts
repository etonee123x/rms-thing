export type AvailableTagTypes = 'artists' | 'track-titles' | 'genres' | 'countries' | 'years';
export type AvailableTagViews = 'text' | 'combobox';

export type TagType = {
  title: string;
  tagType: AvailableTagTypes;
  view: AvailableTagViews;
};

export type ActionGroup = 'THE_ANALYZER';

export type Action = {
  id: number;
  text: string;
  time?: string;
};

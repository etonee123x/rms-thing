import { rest } from 'msw';
import { API_URL } from '@/config';

const artistsList: string[] = [
  'Artists 1',
  'Artists 2',
  'Artists 3',
  'Artists 4',
  'Artists 5',
];

const trackTitlesList: string[] = [
  'Title 1',
  'Title 2',
  'Title 3',
  'Title 4',
  'Title 5',
];

const genresList: string[] = [
  'Rock',
  'Techno',
  'Hip-hop',
  'Rap',
  'Electronic',
  'Dubstep',
  'Trance',
];

const yearsList: string[] = [
  "60's",
  "70's",
  "80's",
  "90's",
  "00's",
  "10's",
  "20's",
];

const countriesList: string[] = ['Russia', 'Not Russia'];

export const handlers = [
  rest.get(`${API_URL}/tags/artists`, (req, res, ctx) => {
    return res(ctx.json(artistsList));
  }),
  rest.get(`${API_URL}/tags/track-titles`, (req, res, ctx) => {
    return res(ctx.json(trackTitlesList));
  }),
  rest.get(`${API_URL}/tags/genres`, (req, res, ctx) => {
    return res(ctx.json(genresList));
  }),
  rest.get(`${API_URL}/tags/years`, (req, res, ctx) => {
    return res(ctx.json(yearsList));
  }),
  rest.get(`${API_URL}/tags/countries`, (req, res, ctx) => {
    return res(ctx.json(countriesList));
  }),
  rest.get(`${API_URL}/test`, (req, res, ctx) => {
    return res(ctx.json('testing!!!'));
  }),
];

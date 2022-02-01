import { setupWorker } from 'msw';
import { handlers } from './handlers';

const worker = setupWorker(...handlers);

export const startMSW = async () =>
  worker.start({
    onUnhandledRequest: 'bypass',
  });

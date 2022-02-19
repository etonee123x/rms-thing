import { get } from '../requests';

const modulePath = '/auth';

export default {
  async requestAuthByLoginAndPassword({ login, password }: { login: string; password: string }): Promise<Response> {
    return get(`${modulePath}?login=${login}&password=${password}`);
  },
  async requestAuthByToken(token: string): Promise<Response> {
    return get(`${modulePath}?token=${token}`);
  },
};

import { API_URL } from '@/config';

export function get(path: string, config?: RequestInit): Promise<Response> {
  return fetch(`${API_URL}${path}`, { method: 'get', ...config });
}

export const apiRequest = async (method: string, url: string, data?: any): Promise<Response> => {
  const config: RequestInit = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  const res = await fetch(url, config);

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`${res.status}: ${error}`);
  }

  return res;
};

type RequestOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  body?: string
  headers?: Record<string, string>
}

export default async function fetchFromApi<T>(requestOptions: RequestOptions, errorMsg: string): Promise<T> {
  try {
    const response = await fetch(requestOptions.url, {
      method: requestOptions.method,
      headers: {
        ...requestOptions.headers
      },
      body: requestOptions.body
    });
    if (!response.ok) {
      throw new Error(errorMsg);
    }
    return response.json();
  } catch (error) {
    console.log(error);
    throw new Error(errorMsg);
  }
}
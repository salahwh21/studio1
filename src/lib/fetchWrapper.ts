
export async function fetchWrapper<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      return response.json();
    } else {
      // For non-json responses, return as text. Adjust as needed.
      return response.text() as unknown as T;
    }
  } catch (error: any) {
    console.error('Fetch error:', error);
    throw new Error(error.message || 'An unknown error occurred during fetch.');
  }
}

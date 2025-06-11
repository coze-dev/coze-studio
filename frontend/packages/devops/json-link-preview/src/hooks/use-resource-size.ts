import { useState, useEffect } from 'react';

function useResourceSize(url: string) {
  const [size, setSize] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    const fetchSize = async () => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          setSize(parseInt(contentLength, 10));
        } else {
          setSize(0);
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSize();
  }, [url]);

  return { size, loading, error };
}

export { useResourceSize };

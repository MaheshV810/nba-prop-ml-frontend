import { useState, useCallback } from "react";

export function useAsync() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (promise) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await promise;
      setData(result);
      return result;
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, run, reset };
}
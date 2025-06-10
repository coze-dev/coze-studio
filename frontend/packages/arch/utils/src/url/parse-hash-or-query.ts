/**
 * @deprecated use query-string or URLSearchParams instead
 * @param queryString query or hash string
 * @returns key value pair as the parse result, if a key show up more than ones in query, the last value will be taken
 */
export const parseHashOrQuery = (queryString: string) => {
  if (queryString.startsWith('?') || queryString.startsWith('#')) {
    queryString = queryString.slice(1);
  }

  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};

  for (const [key, value] of params.entries()) {
    result[key] = value;
  }

  return result;
};

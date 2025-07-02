const INDENT = 4;
export const formatJson = (json: string) => {
  try {
    return JSON.stringify(JSON.parse(json), null, INDENT);
  } catch (e) {
    return json;
  }
};

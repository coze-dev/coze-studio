export function safeJSONParse(jsonStr?: string) {
  try {
    if (!jsonStr) {
      return {};
    }
    return JSON.parse(jsonStr);
  } catch (e) {
    return {};
  }
}

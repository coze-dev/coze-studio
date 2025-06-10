import { typeSafeJSONParse } from './safe-json-parse';

export function arrayBufferToObject(
  buffer: ArrayBuffer,
  encoding = 'utf-8',
): Record<string, unknown> {
  try {
    const decoder = new TextDecoder(encoding);
    const string = decoder.decode(buffer);
    return typeSafeJSONParse(string) as Record<string, unknown>;
  } catch (error) {
    return {};
  }
}

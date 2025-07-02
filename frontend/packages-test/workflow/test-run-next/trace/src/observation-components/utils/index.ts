import JSONBig from 'json-bigint';
import dayjs from 'dayjs';

const jsonBig = JSONBig({ storeAsString: true });
export const textWithFallback = (text?: string | number) =>
  text && text !== '' ? text.toString() : '-';

export const formatTime = (timestamp?: number | string) =>
  dayjs(Number(timestamp)).format('YYYY-MM-DD HH:mm:ss.SSS');

export const isJsonString = (str: string) => {
  try {
    const jsonData = JSON.parse(str);
    if (
      Object.prototype.toString.call(jsonData) !== '[object Object]' &&
      Object.prototype.toString.call(jsonData) !== '[object Array]'
    ) {
      return false;
    }
  } catch (error) {
    return false;
  }
  return true;
};

export const jsonParseWithBigNumber = (jsonString: string) =>
  JSON.parse(JSON.stringify(jsonBig.parse(jsonString)));

export const jsonParse = (
  jsonString: string,
): Record<string, unknown> | string => {
  if (isJsonString(jsonString)) {
    return jsonParseWithBigNumber(jsonString);
  } else {
    return jsonString;
  }
};

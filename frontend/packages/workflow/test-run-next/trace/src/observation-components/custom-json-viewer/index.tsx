import { isString } from 'lodash-es';
import {
  JsonViewer,
  type JsonViewerProps,
  type Path,
} from '@textea/json-viewer';

const objectToCopyableString = (value: any): string => {
  if (isString(value)) {
    return value;
  }
  try {
    return JSON.stringify(value, null, 4);
  } catch (_err) {
    return String(value);
  }
};

export const CustomJsonViewer = <T,>(props: JsonViewerProps<T>) => {
  const { onCopy } = props;
  return (
    <JsonViewer
      style={{
        whiteSpace: 'pre-wrap',
        fontSize: '12px',
      }}
      rootName={false}
      {...props}
      onCopy={(
        _path: Path,
        value: unknown,
        copy: (value: string) => Promise<void>,
      ) => {
        copy(objectToCopyableString(value));
        onCopy?.(_path, objectToCopyableString(value), copy);
      }}
    />
  );
};
export type { JsonViewerProps };

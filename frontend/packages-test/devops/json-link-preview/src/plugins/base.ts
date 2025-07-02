const DEFAULT_PRIORITY = 0;

export abstract class JsonPreviewBasePlugin {
  abstract match: (contentType: string) => boolean;
  abstract name: string;
  priority = DEFAULT_PRIORITY;
  abstract render: (
    link: string,
    extraInfo?: Record<string, string>,
  ) => React.ReactNode;
}

export interface MessageFormValue {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Messages: Array<MessageValue>;
}
export interface MessageValue {
  role: string;
  content: string;
  nickname: string;
}

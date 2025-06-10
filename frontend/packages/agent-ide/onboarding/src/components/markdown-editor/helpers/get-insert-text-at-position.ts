export const getInsertTextAtPosition = ({
  text,
  insertText,
  position,
}: {
  text: string;
  insertText: string;
  position: number;
}): string => `${text.slice(0, position)}${insertText}${text.slice(position)}`;

export const getMarkdownLink = ({
  text,
  link,
}: {
  text: string;
  link: string;
}) => `[${text}](${link})`;

export const getMarkdownImageLink = ({
  fileName,
  link,
}: {
  fileName: string;
  link: string;
}) => `![${fileName}](${link})`;

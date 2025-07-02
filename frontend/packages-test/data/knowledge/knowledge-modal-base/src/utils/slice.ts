import ImageFail from '../assets/image-fail.png';

export const transSliceContentOutput = (
  content: string,
  ignoreImg = false,
): string => {
  /**
   * 1. 处理img标签
   * 2. 删除多余的div/span/br标签
   */
  const imgPattern = /<img.*?(?:>|\/>)/gi;
  const divSPattern = /<div[^>]*>/g;
  const divEPattern = /<\/div>/g;
  const spanSPattern = /<span[^>]*>/g;
  const spanEPattern = /<\/span>/g;
  let newContent = content
    .replace(divSPattern, '\n')
    .replace(divEPattern, '')
    .replace(spanSPattern, '')
    .replace(spanEPattern, '')
    .replace(/<br>/g, '\n');
  if (!ignoreImg) {
    newContent = newContent.replaceAll(imgPattern, v => {
      const toeKeyPattern = /data-tos-key=[\'\"]?([^\'\"]*)[\'\"]?/i;
      const srcPattern = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
      const tosKeyMatches = v.match(toeKeyPattern);
      const srcMatches = v.match(srcPattern);
      if (tosKeyMatches?.[1]) {
        return `<img src="" data-tos-key="${tosKeyMatches?.[1]}" >`;
      }
      return `<img src="${srcMatches?.[1] || ''}" >`;
    });
  }
  return newContent;
};

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const LIMIT_SIZE = 20 * 1024 * 1024;
export const isValidSize = (size: number) => LIMIT_SIZE > size;

export const transSliceContentInput = (content: string): string => {
  const newContent = content.replaceAll('\n', '<br>');
  return newContent;
};

export const transSliceContentInputWithSave = (content: string) => {
  // 将 <br> 替换成 \n
  const contentWithNewLine = content.replace(/<br>/g, '\n');

  // 将 <span> 替换为空
  const finalContent = contentWithNewLine
    .replace(/<span>/g, '')
    .replace(/<\/span>/g, '');
  return finalContent;
};

export const imageOnLoad = (e: Event) => {
  if (e.target) {
    (e.target as HTMLImageElement).style.width = 'auto';
    (e.target as HTMLImageElement).style.height = 'auto';
    (e.target as HTMLImageElement).style.background = 'transparent';
  }
};

export const imageOnError = (e: Event) => {
  if (e.target) {
    (e.target as HTMLImageElement).src = ImageFail;
  }
};

export const setMobileBody = () => {
  const bodyStyle = document?.body?.style;
  const htmlStyle = document?.getElementsByTagName('html')?.[0]?.style;
  if (bodyStyle && htmlStyle) {
    bodyStyle.minHeight = '0';
    htmlStyle.minHeight = '0';
    bodyStyle.minWidth = '0';
    htmlStyle.minWidth = '0';
  }
};

export const setPCBody = () => {
  const bodyStyle = document?.body?.style;
  const htmlStyle = document?.getElementsByTagName('html')?.[0]?.style;
  if (bodyStyle && htmlStyle) {
    bodyStyle.minHeight = '600px';
    htmlStyle.minHeight = '600px';
    bodyStyle.minWidth = '1200px';
    htmlStyle.minWidth = '1200px';
  }
};

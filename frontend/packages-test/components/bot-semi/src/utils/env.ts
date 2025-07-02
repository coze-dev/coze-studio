export const isMobile = (): boolean => {
  const MOBILE_WIDTH_TH = 640;
  const width = document.documentElement.clientWidth;
  return width <= MOBILE_WIDTH_TH;
};

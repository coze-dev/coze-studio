const MIN_SCREEN_WIDTH = 640;

export const isMobile = (): boolean => {
  const width = document.documentElement.clientWidth;
  return width <= MIN_SCREEN_WIDTH;
};

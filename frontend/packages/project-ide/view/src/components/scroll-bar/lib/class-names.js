const cls = {
  main: 'ide-ps',
  rtl: 'ide-ps__rtl',
  element: {
    thumb: x => `ide-ps__thumb-${x}`,
    rail: x => `ide-ps__rail-${x}`,
    consuming: 'ide-ps__child--consume',
  },
  state: {
    focus: 'ide-ps--focus',
    clicking: 'ide-ps--clicking',
    active: x => `ide-ps--active-${x}`,
    scrolling: x => `ide-ps--scrolling-${x}`,
  },
};

export default cls;

/*
 * Helper methods
 */
const scrollingClassTimeout = { x: null, y: null };

export function addScrollingClass(i, x) {
  const classList = i.element.classList;
  const className = cls.state.scrolling(x);

  if (classList.contains(className)) {
    clearTimeout(scrollingClassTimeout[x]);
  } else {
    classList.add(className);
  }
}

export function removeScrollingClass(i, x) {
  scrollingClassTimeout[x] = setTimeout(
    () => i.isAlive && i.element.classList.remove(cls.state.scrolling(x)),
    i.settings.scrollingThreshold
  );
}

export function setScrollingClassInstantly(i, x) {
  addScrollingClass(i, x);
  removeScrollingClass(i, x);
}

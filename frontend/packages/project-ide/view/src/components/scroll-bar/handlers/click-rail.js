import updateGeometry from '../update-geometry';

const clickRail = e => {
  const { element } = e;

  e.event.bind(e.scrollbarYRail, 'mousedown', e => {
    const positionTop =
      e.pageY -
      window.pageYOffset -
      e.scrollbarYRail.getBoundingClientRect().top;
    const direction = positionTop > e.scrollbarYTop ? 1 : -1;

    e.element.scrollTop += direction * e.containerHeight;
    updateGeometry(i);

    e.stopPropagation();
  });

  e.event.bind(e.scrollbarY, 'mousedown', e => e.stopPropagation());

  e.event.bind(e.scrollbarX, 'mousedown', e => e.stopPropagation());
  e.event.bind(e.scrollbarXRail, 'mousedown', e => {
    const left =
      e.pageX -
      window.pageXOffset -
      e.scrollbarXRail.getBoundingClientRect().left;
    const direction = left > e.scrollbarXLeft ? 1 : -1;

    e.element.scrollLeft += direction * e.containerWidth;
    updateGeometry(i);

    e.stopPropagation();
  });
};
export default clickRail;

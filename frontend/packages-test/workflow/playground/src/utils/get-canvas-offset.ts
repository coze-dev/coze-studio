export function getCanvasOffset() {
  const canvasDOM = document.querySelector('.gedit-flow-background-layer');
  const canvasRect = canvasDOM?.getBoundingClientRect();
  return { x: canvasRect?.x ?? 0, y: canvasRect?.y ?? 0 };
}

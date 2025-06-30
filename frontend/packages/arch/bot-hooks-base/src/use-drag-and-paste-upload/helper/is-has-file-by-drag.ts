export const isHasFileByDrag = (e: HTMLElementEventMap['drag']) =>
  Boolean(e.dataTransfer?.types.includes('Files'));

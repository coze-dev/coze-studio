export const isHasFileByDrag = (e: HTMLElementEventMap['drag']) =>
  // 判断的依据直接看 dataTransfer.types 的类型解释就好了
  Boolean(e.dataTransfer?.types.includes('Files'));

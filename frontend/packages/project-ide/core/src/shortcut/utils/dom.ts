export const domEditable = (dom: HTMLElement) => {
  const editableContent = dom.closest('div[contentEditable=true]');
  if (editableContent) {
    return true;
  }
  if (dom.contentEditable === 'true') {
    return true;
  }
  if (dom.tagName === 'INPUT' || dom.tagName === 'TEXTAREA') {
    return true;
  }
  return false;
};

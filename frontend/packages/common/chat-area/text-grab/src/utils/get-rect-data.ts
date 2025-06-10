export const getRectData = ({ selection }: { selection: Selection }) => {
  if (!selection.rangeCount) {
    return;
  }

  const range = selection.getRangeAt(0);

  if (!range) {
    return;
  }

  const rangeRects = range.getClientRects();

  return {
    rangeRects,
  };
};

import { useInnerSideSheetStoreShallow } from './use-inner-side-sheet-store';

export const useSingletonInnerSideSheet = (sideSheetId: string) => {
  const { activeId, openSideSheet, closeSideSheet, forceUpdateActiveId } =
    useInnerSideSheetStoreShallow();

  const visible = activeId === sideSheetId;

  const handleOpen = async (id?: string) =>
    await openSideSheet(id || sideSheetId);

  const handleClose = async (id?: string) =>
    await closeSideSheet(id || sideSheetId);

  const forceClose = () => {
    forceUpdateActiveId();
  };

  return {
    visible,
    handleOpen,
    handleClose,
    forceClose,
  };
};

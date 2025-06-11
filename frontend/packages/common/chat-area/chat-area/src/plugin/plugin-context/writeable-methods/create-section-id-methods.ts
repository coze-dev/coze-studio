import { type SectionIdStore } from '../../../store/section-id';

export const createWriteableSectionIdMethods = (
  useSectionIdStore: SectionIdStore,
) => {
  const { setLatestSectionId, clear } = useSectionIdStore.getState();
  return {
    setLatestSectionId,
    clearSectionId: clear,
  };
};

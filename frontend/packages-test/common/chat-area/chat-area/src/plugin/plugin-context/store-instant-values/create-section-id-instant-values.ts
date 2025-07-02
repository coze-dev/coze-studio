import { type SectionIdStore } from '../../../store/section-id';

export const createSectionIdInstantValues =
  (useSectionIdStore: SectionIdStore) => () => {
    const { latestSectionId } = useSectionIdStore.getState();
    return {
      latestSectionId,
    };
  };

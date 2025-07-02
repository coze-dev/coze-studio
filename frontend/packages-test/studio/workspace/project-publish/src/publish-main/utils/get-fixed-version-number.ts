import { incrementVersionNumber } from './increment-version-number';

export const getFixedVersionNumber = ({
  lastPublishVersionNumber,
  draftVersionNumber,
  defaultVersionNumber,
}: {
  lastPublishVersionNumber: string | undefined;
  draftVersionNumber: string | undefined;
  defaultVersionNumber: string;
}): string => {
  if (lastPublishVersionNumber && !draftVersionNumber) {
    return incrementVersionNumber(lastPublishVersionNumber);
  }
  if (draftVersionNumber) {
    return draftVersionNumber;
  }
  return defaultVersionNumber;
};

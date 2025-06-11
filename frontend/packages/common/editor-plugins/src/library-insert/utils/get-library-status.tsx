import { type ILibraryList, type LibraryBlockInfo } from '../types';
import { findTargetLibrary, isLibraryNameOutDate } from './library-validate';
interface LibraryBlockTooltipProps {
  librarys: ILibraryList;
  libraryBlockInfo: LibraryBlockInfo | null;
  content: string;
}
export type LibraryStatus = 'disabled' | 'existing' | 'outdated';

export const getLibraryStatus = ({
  librarys,
  libraryBlockInfo,
  content,
}: LibraryBlockTooltipProps): {
  libraryStatus: LibraryStatus;
} => {
  let libraryStatus: LibraryStatus = 'disabled';

  if (!libraryBlockInfo) {
    return {
      libraryStatus: 'disabled',
    };
  }
  const targetLibrary = findTargetLibrary(librarys, libraryBlockInfo);

  if (!targetLibrary) {
    return {
      libraryStatus: 'disabled',
    };
  }

  const isOutdated = isLibraryNameOutDate(content, targetLibrary);

  if (isOutdated) {
    libraryStatus = 'outdated';
  } else {
    libraryStatus = 'existing';
  }

  return {
    libraryStatus,
  };
};

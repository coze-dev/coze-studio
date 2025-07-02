import classNames from 'classnames';

import { tokenMapToStr } from '../../utils/token-map-to-str';
import { type ResponsiveTokenMap } from '../../types';
import { type ScreenRange } from '../../constant';

interface ResponsiveBoxProps {
  contents: React.ReactNode[]; // array of content
  colReverse?: boolean; // direction is col or col-reverse
  rowReverse?: boolean; // direction is row or row-reverse
  gaps?: ResponsiveTokenMap<ScreenRange>;
}
export const ResponsiveBox = ({
  contents = [],
  colReverse = false,
  rowReverse = false,
  gaps,
}: ResponsiveBoxProps) => (
  <div
    className={classNames(
      'w-full flex overflow-hidden',
      colReverse
        ? 'flex-col-reverse sm:flex-col-reverse'
        : 'flex-col sm:flex-col',
      rowReverse
        ? 'md:flex-row-reverse lg:flex-row-reverse'
        : 'md:flex-row lg:flex-row',
      gaps && tokenMapToStr(gaps, 'gap'),
    )}
  >
    {contents}
  </div>
);

export const ResponsiveBox2 = ({
  contents = [],
  colReverse = false,
  rowReverse = false,
  gaps,
}: ResponsiveBoxProps) => (
  <div
    className={classNames(
      'w-full flex overflow-hidden',
      colReverse ? 'flex-col-reverse' : 'flex-col',
      rowReverse ? 'lg:flex-row-reverse' : 'lg:flex-row',
      gaps && tokenMapToStr(gaps, 'gap'),
    )}
  >
    {contents}
  </div>
);

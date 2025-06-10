import { type PropsWithChildren, useRef, useState } from 'react';

import { DEFAULT_PUBLISH_HEADER_HEIGHT } from '../../../utils/constants';
import { PublishContainerContext } from '../../../context/publish-container-context';

export const PublishContainer: React.FC<PropsWithChildren> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [publishHeaderHeight, setPublishHeaderHeight] = useState(
    DEFAULT_PUBLISH_HEADER_HEIGHT,
  );

  const getContainerRef = () => ref;

  return (
    <PublishContainerContext.Provider
      value={{ getContainerRef, publishHeaderHeight, setPublishHeaderHeight }}
    >
      <div
        ref={ref}
        className="flex-[1] w-full h-full overflow-x-hidden coz-bg-primary"
      >
        {children}
      </div>
    </PublishContainerContext.Provider>
  );
};

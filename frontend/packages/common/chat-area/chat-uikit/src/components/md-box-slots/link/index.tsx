/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { type FC, useEffect, useRef } from 'react';

import { isObject, isString, omit } from 'lodash-es';
import cs from 'classnames';
import { typeSafeJsonParse } from '@coze-common/chat-area-utils';
import {
  LinkType,
  type MdBoxLinkProps,
} from '@coze-arch/bot-md-box-adapter/lazy';

import { useOnboardingContext } from '../../../context/onboarding';
import { useUiKitMessageBoxContext } from '../../../context/message-box';
import { safeParseUrl } from './utils';

const isHttpLink = (link: string) => {
  const parsedLink = safeParseUrl(link);

  if (!parsedLink) {
    return false;
  }

  return parsedLink.protocol === 'http:' || parsedLink.protocol === 'https:';
};

const isCocoLink = (link: string) => {
  const parsedLink = safeParseUrl(link);

  if (!parsedLink) {
    return false;
  }

  return parsedLink.protocol === 'coco:';
};

/** Components replaced by linked elements */
export const CozeLink: FC<
  MdBoxLinkProps & {
    onLinkElementEnter?: (params: {
      element: HTMLElement;
      link: string;
    }) => void;
    onLinkElementLeave?: (params: {
      element: HTMLElement;
      link: string;
    }) => void;
  }
  // eslint-disable-next-line @coze-arch/max-line-per-function
> = ({
  className,
  style,
  href,
  children,
  onSendMessage,
  onLinkClick,
  onLinkRender,
  onOpenLink,
  type: _type,
  onLinkElementEnter: onLinkElementEnterFromProps,
  onLinkElementLeave: onLinkElementLeaveFromProps,
  ...restProps
}) => {
  const handleOpenLink = (url?: string) => {
    if (onOpenLink) {
      onOpenLink?.(url);
      return;
    }

    window.open(url);
  };
  const parsedUrl = href ? safeParseUrl(href) : null;

  const containerRef = useRef<HTMLAnchorElement | null>(null);

  const { eventCallbacks } = useUiKitMessageBoxContext();

  const { eventCallbacks: eventCallbacksFromOnboarding } =
    useOnboardingContext();
  const {
    onMdBoxLinkElementEnter: onLinkElementEnterFromEventCallback,
    onMdBoxLinkElementLeave: onLinkElementLeaveFromEventCallback,
  } = eventCallbacks ?? {};

  const {
    onMdBoxLinkElementEnter: onMdBoxLinkElementEnterFromOnboarding,
    onMdBoxLinkElementLeave: onMdBoxLinkElementLeaveFromOnboarding,
  } = eventCallbacksFromOnboarding ?? {};

  const onLinkElementEnter =
    onLinkElementEnterFromProps ??
    onLinkElementEnterFromEventCallback ??
    onMdBoxLinkElementEnterFromOnboarding;

  const onLinkElementLeave =
    onLinkElementLeaveFromProps ??
    onLinkElementLeaveFromEventCallback ??
    onMdBoxLinkElementLeaveFromOnboarding;

  const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    /* istanbul ignore if */
    if (!href || !parsedUrl) {
      event.preventDefault();
      return;
    }

    if (isCocoLink(href)) {
      event.preventDefault();
      const message = parsedUrl.searchParams.get('msg');
      const ext = parsedUrl.searchParams.get('ext');
      const extObj = ext
        ? typeSafeJsonParse(ext, error => {
            reportError(error);
          })
        : undefined;
      const wikiLink =
        isObject(extObj) &&
        's$wiki_link' in extObj &&
        isString(extObj?.s$wiki_link)
          ? extObj?.s$wiki_link
          : '';

      /* istanbul ignore if */
      if (wikiLink) {
        if (isHttpLink(wikiLink)) {
          onLinkClick?.(event, {
            url: href,
            parsedUrl,
            exts: { wiki_link: wikiLink, type: LinkType.wiki },
            openLink: handleOpenLink,
          });
        }

        return;
      }

      if (message) {
        onSendMessage?.(message);
        return;
      }

      onLinkClick?.(event, {
        url: href,
        parsedUrl,
        exts: { type: LinkType.coco },
        openLink: handleOpenLink,
      });
    }

    if (!isHttpLink(href)) {
      return;
    }

    /* istanbul ignore else */
    if (onLinkClick) {
      onLinkClick(event, {
        url: href,
        parsedUrl,
        exts: {
          type: LinkType.normal,
        },
        openLink: handleOpenLink,
      });
    } else {
      event.preventDefault();
      event.stopPropagation();
      window.open(href);
    }
  };

  useEffect(() => {
    if (href && parsedUrl) {
      onLinkRender?.({
        url: href,
        parsedUrl,
      });
    }
  }, [href]);

  const handleMouseEnter = () => {
    if (!containerRef.current) {
      return;
    }
    onLinkElementEnter?.({
      element: containerRef.current,
      link: href ?? '',
    });
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) {
      return;
    }
    onLinkElementLeave?.({
      element: containerRef.current,
      link: href ?? '',
    });
  };

  return (
    <a
      {...omit(restProps, 'href')}
      className={cs(['!coz-fg-hglt'], className)}
      style={style}
      onClick={onClick}
      href={parsedUrl ? href : undefined}
      target="_blank"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      {children}
    </a>
  );
};

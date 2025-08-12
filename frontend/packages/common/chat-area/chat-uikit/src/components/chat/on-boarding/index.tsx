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

import {
  type CSSProperties,
  useState,
  forwardRef,
  type FC,
  useContext,
} from 'react';

import classNames from 'classnames';
import { useUpdateEffect } from 'ahooks';
import { Avatar, Typography } from '@coze-arch/coze-design';
import {
  MdBoxLazy,
  type MdBoxLazyProps,
} from '@coze-arch/bot-md-box-adapter/lazy';
import {
  Layout,
  type IMessage,
  type IEventCallbacks,
} from '@coze-common/chat-uikit-shared';

import { CozeLink } from '../../md-box-slots/link';
import {
  type CozeImageProps,
  CozeImageWithPreview,
} from '../../md-box-slots/coze-image';
import { SuggestionItem } from '../../contents/suggestion-content/components/suggestion-item';
import { OnboardingContext } from '../../../context/onboarding';
import { NO_MESSAGE_ID_MARK } from '../../../constants/grab';
import defaultAvatar from '../../../assets/default-square-avatar.png';
import {
  typeSafeBotInfoNameVariants,
  type BotInfoVariantProps,
} from './variants';

import './index.less';

interface OnBoardingProps {
  avatar?: string;
  name?: string;
  prologue?: string;
  suggestionList?: IMessage[];
  /**
   * SuggestionList Whether to wrap display, default false
   */
  suggestionsWrap?: boolean;
  readonly?: boolean;
  suggestionListWithString?: string[];
  /**
   * suggestionListWithString whether to wrap, default false
   */
  suggestionsWithStringWrap?: boolean;
  onSuggestionClick?: (content: string) => void;
  className?: string;
  prologueClassName?: string;
  mdBoxProps?: Pick<MdBoxLazyProps, 'insertedElements' | 'slots'>;
  style?: CSSProperties;
  showBackground?: boolean;
  layout?: Layout;
  enableAutoSizeImage?: boolean;
  imageAutoSizeContainerWidth?: number;
  eventCallbacks?: IEventCallbacks;
  suggestionItemColor?: 'white' | 'grey';
}

interface BotInfoProps {
  wrapperClassName?: string;
  avatar: string | undefined;
  onError: () => void;
  name: string | undefined;
}

const BotInfo: React.FC<BotInfoProps & BotInfoVariantProps> = ({
  avatar,
  wrapperClassName,
  onError,
  name,
  showBackground,
}) => (
  <div className={wrapperClassName}>
    <Avatar
      className={classNames('h-[64px] w-[64px]', 'rounded-[16px]')}
      src={avatar}
      shape="square"
      onError={onError}
    ></Avatar>
    {name ? (
      <Typography.Text
        ellipsis
        className={typeSafeBotInfoNameVariants({
          showBackground: Boolean(showBackground),
        })}
      >
        {name}
      </Typography.Text>
    ) : null}
  </div>
);

export const OnBoarding = forwardRef<HTMLDivElement, OnBoardingProps>(
  (props, ref) => {
    const {
      avatar,
      name,
      prologue,
      suggestionList,
      readonly,
      suggestionListWithString,
      onSuggestionClick,
      className,
      prologueClassName,
      mdBoxProps,
      style,
      showBackground,
      layout,
      enableAutoSizeImage,
      imageAutoSizeContainerWidth,
      eventCallbacks,
      suggestionsWrap = false,
      suggestionsWithStringWrap = false,
      suggestionItemColor,
    } = props;
    const [botAvatar, setBotAvatar] = useState(avatar || defaultAvatar);
    const suggestions = suggestionList || suggestionListWithString;
    const isOnboardingEmpty = !prologue && !suggestions?.length;
    useUpdateEffect(() => {
      setBotAvatar(avatar || defaultAvatar);
    }, [avatar]);
    return (
      <OnboardingContext.Provider
        value={{
          imageAutoSizeContainerWidth,
          eventCallbacks,
        }}
      >
        <div
          ref={ref}
          className={classNames('chat-uikit-on-boarding', className, {
            'chat-uikit-on-boarding-pc': layout === Layout.PC,
          })}
          style={style}
        >
          <BotInfo
            wrapperClassName={classNames(
              'chat-uikit-on-boarding__bot',
              !isOnboardingEmpty &&
                'chat-uikit-on-boarding__bot__with__onboarding',
            )}
            avatar={botAvatar}
            name={name}
            showBackground={showBackground}
            onError={() => setBotAvatar(defaultAvatar)}
          />
          <div className={classNames('chat-uikit-on-boarding__prologue-sug')}>
            {prologue ? (
              <div
                className={classNames(
                  [
                    'py-12px',
                    'px-16px',
                    layout === Layout.MOBILE ? 'text-[16px]' : 'text-lg',
                    'leading-[20px]',
                    'rounded-normal',
                    'bg-[var(--coz-mg-primary)]',
                  ],
                  'chat-uikit-on-boarding__prologue',
                  prologueClassName,
                  {
                    '!coz-bg-image-bots !coz-stroke-image-bots': showBackground,
                  },
                )}
                data-grab-mark={NO_MESSAGE_ID_MARK}
              >
                <MdBoxLazy
                  markDown={prologue}
                  autoFixSyntax={{ autoFixEnding: false }}
                  slots={{
                    Image: enableAutoSizeImage
                      ? CozeImageWithSizeProps
                      : undefined,
                    Link: CozeLink,
                  }}
                  {...mdBoxProps}
                ></MdBoxLazy>
              </div>
            ) : null}
            {Boolean(suggestionList?.length) && (
              <div
                className={classNames(
                  'chat-uikit-on-boarding__suggestions',
                  'mt-8px',
                  {
                    'flex-wrap !flex-row gap-2': suggestionsWrap,
                  },
                )}
              >
                {suggestionList?.map((message, index) => (
                  <SuggestionItem
                    key={index}
                    className={classNames({
                      '!mb-0': suggestionsWrap,
                    })}
                    message={message}
                    readonly={readonly}
                    onSuggestionClick={({ text }) => onSuggestionClick?.(text)}
                    showBackground={showBackground}
                    color={suggestionItemColor}
                  ></SuggestionItem>
                ))}
              </div>
            )}
            {Boolean(suggestionListWithString?.length) && (
              <div
                className={classNames(
                  'chat-uikit-on-boarding__suggestions',
                  'mt-8px',
                  {
                    'flex-wrap !flex-row gap-2': suggestionsWithStringWrap,
                  },
                )}
              >
                {suggestionListWithString?.map((content, index) => (
                  <SuggestionItem
                    key={index}
                    className={classNames({
                      '!mb-0': suggestionsWithStringWrap,
                    })}
                    content={content}
                    readonly={readonly}
                    onSuggestionClick={({ text }) => onSuggestionClick?.(text)}
                    showBackground={showBackground}
                    color={suggestionItemColor}
                  ></SuggestionItem>
                ))}
              </div>
            )}
          </div>
        </div>
      </OnboardingContext.Provider>
    );
  },
);

const CozeImageWithSizeProps: FC<CozeImageProps> = props => {
  const { imageAutoSizeContainerWidth } = useContext(OnboardingContext);
  return (
    <CozeImageWithPreview
      {...props}
      imageAutoSizeContainerWidth={imageAutoSizeContainerWidth}
    />
  );
};

CozeImageWithSizeProps.displayName = 'CozeImageWithSizeProps';

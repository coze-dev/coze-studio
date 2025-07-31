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

import { useMemo, type FC, useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { nanoid } from 'nanoid';
import classNames from 'classnames';
import {
  CozeLink,
  CozeImage,
  MessageBox,
  NO_MESSAGE_ID_MARK,
} from '@coze-common/chat-uikit';
import { exhaustiveCheckSimple } from '@coze-common/chat-area-utils';
import { Checkbox } from '@coze-arch/bot-semi';
import { MdBoxLazy } from '@coze-arch/bot-md-box-adapter/lazy';

import { usePluginCustomComponents } from '../../plugin/hooks/use-plugin-custom-components';
import { useUIKitMessageImageAutoSizeConfig } from '../../hooks/uikit/use-ui-kit-message-image-auto-size-config';
import { useEventCallbacks } from '../../hooks/uikit/use-event-callbacks';
import { useShowBackGround } from '../../hooks/public/use-show-bgackground';
import { useSelectOnboarding } from '../../hooks/public/use-select-onboarding';
import { useChatAreaStoreSet } from '../../hooks/context/use-chat-area-context';
import { type PreferenceContextInterface } from '../../context/preference/types';
import { usePreference } from '../../context/preference';

import styles from './index.module.less';

interface IProps {
  onOnboardingIdChange: (id: string) => void;
}

const getOnboardingMessageBoxTheme = ({
  bizTheme,
}: {
  bizTheme: PreferenceContextInterface['theme'];
}) => {
  if (bizTheme === 'home') {
    return 'whiteness';
  }
  if (bizTheme === 'debug' || bizTheme === 'store') {
    return 'grey';
  }
  exhaustiveCheckSimple(bizTheme);
  return 'grey';
};

export const OnboardingMessage: FC<IProps> = props => {
  const { onOnboardingIdChange } = props;
  const id = useMemo(() => nanoid(), []);
  const { selectable, layout, enableSelectOnboarding, theme } = usePreference();
  const { imageAutoSizeContainerWidth, enableImageAutoSize } =
    useUIKitMessageImageAutoSizeConfig();

  const { useSenderInfoStore, useOnboardingStore, useSelectionStore } =
    useChatAreaStoreSet();

  const { name, avatar, prologue } = useOnboardingStore(
    useShallow(state => ({
      name: state.name,
      avatar: state.avatar,
      prologue: state.prologue,
    })),
  );

  const eventCallbacks = useEventCallbacks();

  const { selectedOnboardingId, addOnboardingId, removeOnboardingId } =
    useSelectionStore(
      useShallow(state => ({
        selectedOnboardingId: state.selectedOnboardingId,
        addOnboardingId: state.addOnboardingId,
        removeOnboardingId: state.removeOnboardingId,
      })),
    );

  useEffect(() => {
    onOnboardingIdChange(id);
    addOnboardingId(id);
  }, [id]);

  useEffect(() => () => removeOnboardingId(id), []);

  const selectOnboarding = useSelectOnboarding();

  const handleCheckboxChange = (e: { target: { checked?: boolean } }) => {
    selectOnboarding({
      selectedId: e.target?.checked ? id : null,
      onboarding: {
        prologue,
      },
    });
  };
  const CustomeUIKitMessageBox =
    usePluginCustomComponents('UIKitMessageBoxPlugin').at(0)?.Component ||
    MessageBox;

  const showBackground = useShowBackGround();

  if (!prologue) {
    return null;
  }

  return (
    <div className={classNames(styles.message)}>
      {selectable && enableSelectOnboarding ? (
        <div
          className={classNames(
            styles.checkbox,
            showBackground && styles['background-mode-checkbox'],
          )}
        >
          <Checkbox
            className="chat-package-message-group-wrap-checkbox"
            onChange={handleCheckboxChange}
            checked={selectedOnboardingId === id}
          ></Checkbox>
        </div>
      ) : null}

      <CustomeUIKitMessageBox
        messageType="receive"
        messageId={null}
        // Fixme no sender id here.
        senderInfo={{ url: avatar, nickname: name, id: '' }}
        showUserInfo={true}
        theme={getOnboardingMessageBoxTheme({
          bizTheme: theme,
        })}
        getBotInfo={useSenderInfoStore.getState().getBotInfo}
        layout={layout}
        showBackground={showBackground}
        enableImageAutoSize={enableImageAutoSize}
        imageAutoSizeContainerWidth={imageAutoSizeContainerWidth}
        eventCallbacks={eventCallbacks}
      >
        <div
          className={styles['onboarding-message-content']}
          data-grab-mark={NO_MESSAGE_ID_MARK}
        >
          <MdBoxLazy
            markDown={prologue}
            autoFixSyntax={{ autoFixEnding: false }}
            slots={{
              Image: enableImageAutoSize ? CozeImage : undefined,
              Link: CozeLink,
            }}
          ></MdBoxLazy>
        </div>
      </CustomeUIKitMessageBox>
    </div>
  );
};

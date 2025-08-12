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
  useEffect,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from 'react';

import { nanoid } from 'nanoid';
import classNames from 'classnames';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import { IconCozArrowDown } from '@coze-arch/coze-design/icons';
import { Button, Collapsible } from '@coze-arch/coze-design';
import { Popover } from '@coze-arch/bot-semi';
import { MdBoxLazy } from '@coze-arch/bot-md-box-adapter/lazy';
import { IconInfo } from '@coze-arch/bot-icons';
import { ModelStyle } from '@coze-arch/bot-api/developer_api';

import { PresetRadioGroup } from '../preset-radio-group';
import commonStyles from '../index.module.less';
import { useModelForm } from '../../../context/model-form-context';
import {
  type FormilyCoreType,
  type FormilyReactType,
} from '../../../context/formily-context/type';
import { useFormily } from '../../../context/formily-context';

import styles from './index.module.less';

export interface ModelFormGroupItemProps {
  title: ReactNode | undefined;
}

export const ModelFormGroupItem: React.FC<
  PropsWithChildren<ModelFormGroupItemProps>
> = ({ title, children }) => (
  <div className={styles.group}>
    <div className={classNames(styles['group-label'], styles.title)}>
      {title}
    </div>
    <div className={styles.content}>{children}</div>
  </div>
);

type DiversityGroupItemImplProps = ModelFormGroupItemProps & {
  disabled: boolean;
  formilyReact: FormilyReactType;
  formilyCore: FormilyCoreType;
};

const DiversityGroupItemImpl: React.FC<
  PropsWithChildren<DiversityGroupItemImplProps>
> = ({ formilyCore, formilyReact, title, children, disabled }) => {
  const form = formilyReact.useForm();
  const {
    isGenerationDiversityOpen,
    setGenerationDiversityOpen,
    hideDiversityCollapseButton,
  } = useModelForm();

  const [modelStyle, setModelStyle] = useState<ModelStyle>(
    form.values.model_style,
  );

  const toggleOpen = () => {
    setGenerationDiversityOpen(!isGenerationDiversityOpen);
  };

  const handleValuesChange = (changedValue: ModelStyle) => {
    form.setValues({ model_style: changedValue });
  };

  useEffect(() => {
    const effectId = nanoid();

    form.addEffects(effectId, () => {
      formilyCore.onFormValuesChange(localeForm => {
        setModelStyle(localeForm.values.model_style);
      });
    });

    return () => {
      form.removeEffects(effectId);
    };
  }, [form]);

  /**
   * Here is a distinction between initialization and subsequent operations
   * In the read-only state, customize is also stowed by default, otherwise it is expanded by default
   * Of course, read-only state cannot be modified model_style
   */
  useEffect(() => {
    if (disabled) {
      return;
    }

    if (modelStyle !== ModelStyle.Custom) {
      return;
    }
    setGenerationDiversityOpen(true);
  }, [modelStyle]);

  return (
    <div
      className={classNames(
        styles.group,
        !isGenerationDiversityOpen && styles['group-with-collapse'],
      )}
    >
      <div className={styles['generation-diversity-group']}>
        <div
          className={classNames(
            styles['group-label'],
            styles['diversity-label'],
          )}
        >
          <div>{title}</div>
          <Popover
            className={commonStyles.popover}
            showArrow
            arrowPointAtCenter
            content={
              <MdBoxLazy
                markDown={I18n.t('model_config_generate_explain')}
                autoFixSyntax={{ autoFixEnding: false }}
              />
            }
          >
            <IconInfo className={styles.icon} />
          </Popover>
        </div>

        <PresetRadioGroup
          className={styles['radio-group']}
          disabled={disabled}
          value={modelStyle}
          onChange={handleValuesChange}
        />
        {hideDiversityCollapseButton ? null : (
          <Button
            onClick={toggleOpen}
            iconPosition="right"
            icon={<IconCozArrowDown />}
            className={classNames(
              isGenerationDiversityOpen && styles.rotate,
              styles.advance,
            )}
            color="secondary"
          >
            {I18n.t('model_config_generate_advance')}
          </Button>
        )}
      </div>
      <Collapsible
        isOpen={isGenerationDiversityOpen}
        className={styles.collapse}
      >
        <div className={styles.content}>{children}</div>
      </Collapsible>
    </div>
  );
};

export const ModelFormGenerationDiversityGroupItem: React.FC<
  PropsWithChildren<ModelFormGroupItemProps>
> = props => {
  const {
    formilyModule: { formilyReact, formilyCore },
  } = useFormily();

  const isReadonly = useBotDetailIsReadonly();

  if (!formilyReact || !formilyCore) {
    return null;
  }

  return (
    <DiversityGroupItemImpl
      formilyCore={formilyCore}
      formilyReact={formilyReact}
      disabled={isReadonly}
      {...props}
    />
  );
};

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

import { useForm, observer } from '@coze-workflow/test-run/formily';
import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Popover, Switch, Typography } from '@coze-arch/coze-design';

import SugLayoutLimit from './sug_layout_limit.png';
import SugLayoutFull from './sug_layout_full.png';

import css from './display-all.module.less';

export const DisplayAllSwitch: React.FC = observer(() => {
  const form = useForm();
  const value = form.getValuesIn('display_all_suggestions') ?? false;

  const { disabled } = form;

  const handleChange = (v: boolean) => {
    form.setValuesIn('display_all_suggestions', v);
  };

  return (
    <div className={css['display-all']}>
      <Popover
        content={
          <div>
            <div className="coz-fg-plus text-base	font-medium">
              {I18n.t('opening_showall')}
            </div>
            <div className="coz-fg-secondary text-xs pb-3">
              {I18n.t('opening_showall_explain')}
            </div>
            <div className="coz-fg-secondary text-xs pb-[6px]">
              {I18n.t('opening_showall_explain_demo_on')}
            </div>
            <img height="112px" width="288px" src={SugLayoutLimit} />
            <div className="coz-fg-secondary text-xs pb-[6px]">
              {I18n.t('opening_showall_explain_demo_off')}
            </div>
            <img height="112px" width="288px" src={SugLayoutFull} />
          </div>
        }
      >
        <IconCozInfoCircle />
      </Popover>
      <Typography.Text size="small">
        {I18n.t('opening_showall')}
      </Typography.Text>
      <Switch
        size="mini"
        checked={value}
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
});

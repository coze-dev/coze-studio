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

import { I18n } from '@coze-arch/i18n';
import { Popover } from '@coze-arch/coze-design';

import previewCard from './preview-card.png';

export function MonetizeDescription({ isOn }: { isOn: boolean }) {
  return (
    <div className="coz-fg-primary">
      <span>
        {isOn ? I18n.t('monetization_on_des') : I18n.t('monetization_off_des')}
      </span>
      {isOn ? (
        <Popover
          content={
            <div className="p-[12px] coz-bg-max rounded-[10px]">
              <img width={320} src={previewCard} />
            </div>
          }
        >
          <span className="coz-fg-hglt cursor-pointer">
            {I18n.t('monetization_on_viewbill')}
          </span>
        </Popover>
      ) : null}
    </div>
  );
}

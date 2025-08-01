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
  useRef,
  useState,
  type FC,
  type PropsWithChildren,
} from 'react';

import classNames from 'classnames';
import { reporter } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { IconCozCross } from '@coze-arch/coze-design/icons';

import { testLowVersionBrowse } from '../../utils';
import { EventNames } from '../../constants';

import styles from './index.module.less';

type IProps = Record<string, unknown>;

interface BannerInfo {
  url: string;
  visible: boolean;
}

export const BrowserUpgradeWrap: FC<PropsWithChildren<IProps>> = props => {
  const { children } = props;

  const [bannerInfo, setBannerInfo] = useState<BannerInfo>({
    url: '',
    visible: false,
  });
  const [bannerHeight, setBannerHeight] = useState(0);

  const bannerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const result = testLowVersionBrowse();

    if (!result) {
      return;
    }

    const { downloadUrl } = result;

    reporter.event({
      eventName: EventNames.BrowserUpgradeTipsVisible,
    });

    setBannerInfo({ url: downloadUrl, visible: !!downloadUrl });
  }, []);

  useEffect(() => {
    if (!bannerRef.current) {
      setBannerHeight(0);
      return;
    }

    setBannerHeight(bannerRef.current.getBoundingClientRect().height ?? 0);
  }, [bannerInfo]);

  const handleClick = () => {
    if (!bannerInfo.url) {
      return;
    }

    reporter.event({
      eventName: EventNames.BrowserUpgradeClick,
    });

    window.open(bannerInfo.url);
  };

  const handleBannerClose = () => {
    setBannerInfo(prevState => ({ ...prevState, visible: false }));
  };

  return (
    <>
      {bannerInfo.visible ? (
        <div
          className={classNames(
            styles['banner-wrapper'],
            styles['flex-helper'],
            styles['flex-direction-row-helper'],
            styles['flex-items-center'],
          )}
          ref={bannerRef}
        >
          <div
            className={classNames(
              styles['banner-item'],
              styles['flex-1-helper'],
              styles['flex-items-center'],
              styles['flex-justify-center'],
            )}
          >
            <span>{I18n.t('browser_upgrade')}: </span>
            <span
              className={styles['banner-upgrade-button']}
              onClick={handleClick}
            >
              {I18n.t('browser_upgrade_button')}
            </span>
          </div>
          <div onClick={handleBannerClose}>
            <IconCozCross className={styles.close} />
          </div>
        </div>
      ) : null}
      <div
        style={{
          height: `calc(100% - ${bannerHeight}px)`,
          position: 'relative',
        }}
      >
        {children}
      </div>
    </>
  );
};

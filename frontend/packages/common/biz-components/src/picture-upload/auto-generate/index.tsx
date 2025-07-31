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

import { useEffect, useMemo, useRef, useState } from 'react';

import { isFunction } from 'lodash-es';
import classNames from 'classnames';
import axios, { type CancelTokenSource } from 'axios';
import { useHover } from 'ahooks';
import {
  REPORT_EVENTS as ReportEventNames,
  createReportEvent,
} from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozCheckMark,
  IconCozCrossCircle,
} from '@coze-arch/coze-design/icons';
import { Tooltip, Toast, Image, AIButton, Space } from '@coze-arch/coze-design';
import { loadImage } from '@coze-arch/bot-utils';
import { DeveloperApi } from '@coze-arch/bot-api';

import s from './index.module.less';

type UploadValue = { uid: string; url: string }[];
interface GenerateInfo {
  name: string;
  desc?: string;
}
interface AutoGenerateProps {
  onChange: (value?: UploadValue) => void;
  generateInfo?: GenerateInfo | (() => GenerateInfo);
  generateTooltip?: {
    generateBtnText?: string;
    contentNotLegalText?: string;
  };
  showAiAvatar: boolean;
  /**
   * How many candidates are allowed at most?
   * @default 5
   */
  maxCandidateCount?: number;
}

interface PictureItem {
  url: string;
  uid: string;
}

// Automatically generate avatar error codes
enum ErrorCode {
  OVER_QUOTA_PER_DAY = 700012034,
  CONTENT_NOT_LEGAL = 700012050,
}

const MAX_CANDIDATE_COUNT = 5;
const MAX_TOTAL_COUNT = 25;

// eslint-disable-next-line @coze-arch/max-line-per-function
export const AutoGenerate = (props: AutoGenerateProps) => {
  const {
    onChange,
    generateInfo,
    showAiAvatar,
    generateTooltip,
    maxCandidateCount = MAX_CANDIDATE_COUNT,
  } = props;
  const cancelTokenSource = useRef<CancelTokenSource>();
  const hoverCount = useRef(0);
  const loadingRef = useRef<HTMLDivElement>(null);
  const loadingHover = useHover(loadingRef);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [showGenerateBtn, setShowGenerateBtn] = useState(true);
  const [pictureList, setPictureList] = useState<PictureItem[]>([]);
  const [checkedId, setCheckedId] = useState(-1);

  const tooltipContent = useMemo(() => {
    if (totalCount >= MAX_TOTAL_COUNT && pictureList.length === 0) {
      return I18n.t('bot_edit_profile_pircture_autogen_quota_tooltip');
    }

    const defaultText = IS_OVERSEA
      ? I18n.t('bot_edit_profile_pircture_autogen_tooltip')
      : I18n.t('bot_edit_profile_pircture_autogen_tooltip_cn');
    return generateTooltip?.generateBtnText || defaultText;
  }, [totalCount, pictureList.length, generateTooltip?.generateBtnText]);

  const allowGenerate = useMemo(
    () =>
      totalCount < MAX_TOTAL_COUNT &&
      (isFunction(generateInfo) ? generateInfo?.().name : generateInfo?.name),
    [generateInfo, totalCount],
  );

  const cancelGenerate = () => {
    cancelTokenSource.current?.cancel('cancel generate picture');
  };

  const updateParentValue = (id: number, value: UploadValue) => {
    setCheckedId(id);
    onChange(value);
  };

  const getPicture = async () => {
    hoverCount.current = 1;
    setLoading(true);

    const newList = [
      ...pictureList,
      {
        url: '',
        uid: '',
      },
    ];
    setPictureList(newList);
    const reportEvent = createReportEvent({
      eventName: ReportEventNames.botGetAiGenerateAvatar,
    });
    try {
      cancelTokenSource.current = axios.CancelToken.source();
      const { name, desc } = isFunction(generateInfo)
        ? generateInfo()
        : generateInfo || {};
      const { data } = await DeveloperApi.GenerateIcon(
        {
          bot_name: name,
          description: desc,
        },
        {
          __disableErrorToast: true,
          cancelToken: cancelTokenSource.current.token,
        },
      );
      setTotalCount(Number(data?.count));
      await loadImage(String(data?.icon_url));
      setLoading(false);
      setPictureList(prevList => {
        prevList[prevList.length - 1] = {
          url: String(data?.icon_url),
          uid: String(data?.icon_uri),
        };
        return prevList;
      });
      updateParentValue(newList.length - 1, [
        {
          url: String(data?.icon_url),
          uid: String(data?.icon_uri),
        },
      ]);
      reportEvent.success();
    } catch (error) {
      onChange();
      setLoading(false);
      setPictureList(list => {
        list.pop();
        return list;
      });
      const codeNumber = Number((error as { code: number })?.code);
      if (codeNumber === ErrorCode.OVER_QUOTA_PER_DAY) {
        // Exceeding the maximum number of times a day
        setTotalCount(MAX_TOTAL_COUNT);
        Toast.error({
          content: I18n.t('bot_edit_profile_pircture_autogen_quota_tooltip'),
          showClose: false,
        });
        reportEvent.error({
          reason: 'The number of times in a day exceeded the upper limit',
          error: error instanceof Error ? error : void 0,
        });
      } else if (codeNumber === ErrorCode.CONTENT_NOT_LEGAL) {
        Toast.error({
          content:
            generateTooltip?.contentNotLegalText ||
            I18n.t('generate_bot_icon_content_filter'),
          showClose: false,
        });
        reportEvent.error({
          reason:
            "The bot's name or description contains inappropriate content",
          error: error instanceof Error ? error : void 0,
        });
      } else if (codeNumber > 0) {
        Toast.error({
          content: I18n.t('error'),
          showClose: false,
        });
        reportEvent.error({
          reason: 'Failed to generate profile picture',
          error: error instanceof Error ? error : void 0,
        });
      }
    }
  };

  useEffect(() => {
    // Get the total number of spawns for the day
    DeveloperApi.GetGenerateIconInfo()
      .then(({ data }) => {
        setTotalCount(Number(data?.current_day_count));
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    if (
      pictureList.length >= maxCandidateCount ||
      (totalCount >= MAX_TOTAL_COUNT && pictureList.length > 0)
    ) {
      setShowGenerateBtn(false);
    } else {
      setShowGenerateBtn(true);
    }
  }, [pictureList.length, totalCount]);

  useEffect(() => {
    if (loadingRef.current) {
      hoverCount.current++;
    }
  }, [loadingHover]);

  useEffect(() => {
    if (!showAiAvatar) {
      setCheckedId(-1);
      if (loading) {
        cancelGenerate();
      }
    }
  }, [showAiAvatar]);

  return (
    <div className={s['generate-list-wrap']}>
      <div className={s['hidden-element']} />
      <div className={s['split-line']} />
      <Space spacing={4}>
        {(pictureList || []).map((picture, idx) => (
          <div
            key={idx}
            className={classNames(s.avatar)}
            onClick={() => {
              if (picture.url) {
                updateParentValue(idx, [
                  { url: picture.url, uid: String(picture.uid) },
                ]);
              }
            }}
          >
            <div
              ref={loadingRef}
              className={classNames(s['loading-mask'], {
                [s.loading]: !picture.url,
                [s.finish]: picture.url,
                [s['loading-hover']]: loadingHover && !picture.url,
              })}
            >
              {/* Secondary hover display cancelled */}
              {hoverCount.current > 1 && loadingHover && !picture.url ? (
                <div
                  className={s.mask}
                  onClick={e => {
                    e.stopPropagation();
                    cancelGenerate();
                  }}
                >
                  <IconCozCrossCircle />
                </div>
              ) : null}

              {/* Select image mask */}
              {checkedId === idx && (
                <div className={s.mask}>
                  <IconCozCheckMark className="text-[16]" />
                </div>
              )}
            </div>
            <Image
              className={picture.url && s['avatar-img']}
              preview={false}
              src={picture.url}
            />
          </div>
        ))}
        {showGenerateBtn ? (
          <Tooltip position="topLeft" content={tooltipContent}>
            <AIButton
              onlyIcon
              color="aihglt"
              disabled={!allowGenerate}
              loading={loading}
              onClick={() => {
                if (allowGenerate) {
                  getPicture();
                }
              }}
            />
          </Tooltip>
        ) : null}
      </Space>
    </div>
  );
};

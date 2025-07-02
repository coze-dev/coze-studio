import React, { ReactElement } from 'react';

import classNames from 'classnames';
import { Empty } from '@douyinfe/semi-ui';
import {
  IllustrationNoContent,
  IllustrationNoContentDark,
  IllustrationNoResult,
  IllustrationNoResultDark,
} from '@douyinfe/semi-illustrations';

import { Button } from '../../components/ui-button';

import s from './index.module.less';

export interface EmptyProps {
  title?: string;
  icon?: ReactElement;
  iconDarkMode?: ReactElement;
  description?: string;
  btnText?: string;
  loading?: boolean;
  btnOnClick?: () => void;
}

export interface UIEmptyProps {
  className?: string;
  isNotFound?: boolean;
  empty?: EmptyProps;
  notFound?: EmptyProps;
}

enum EmptyButtonOpacity {
  Disable = 0.6,
  UnDisable = 1,
}

export function UIEmpty({
  className,
  isNotFound = false,
  empty,
  notFound,
}: UIEmptyProps) {
  return (
    <div className={classNames(s['ui-empty'], className)}>
      {isNotFound ? (
        <Empty
          title={notFound?.title}
          image={
            notFound?.icon ? (
              notFound.icon
            ) : (
              <IllustrationNoResult style={{ width: 150, height: '100%' }} />
            )
          }
          darkModeImage={
            notFound?.iconDarkMode ? (
              notFound.iconDarkMode
            ) : (
              <IllustrationNoResultDark
                style={{ width: 150, height: '100%' }}
              />
            )
          }
        ></Empty>
      ) : (
        <Empty
          title={empty?.title}
          description={empty?.description || ''}
          image={
            empty?.icon ? (
              empty.icon
            ) : (
              <IllustrationNoContent style={{ width: 150, height: '100%' }} />
            )
          }
          darkModeImage={
            empty?.iconDarkMode ? (
              empty.iconDarkMode
            ) : (
              <IllustrationNoContentDark
                style={{ width: 150, height: '100%' }}
              />
            )
          }
        >
          {!!empty?.btnText && (
            <Button
              theme="solid"
              onClick={empty?.btnOnClick}
              loading={empty?.loading}
              style={{
                opacity: empty?.loading
                  ? EmptyButtonOpacity.Disable
                  : EmptyButtonOpacity.UnDisable,
              }}
            >
              {empty.btnText}
            </Button>
          )}
        </Empty>
      )}
    </div>
  );
}

// 无图场景下的原生用法
UIEmpty.Semi = Empty;

export default UIEmpty;

import React, { useMemo, type ReactNode } from 'react';

import {
  IconCozCodeFill,
  IconCozPlayCircle,
  IconCozSideCollapse,
} from '@coze-arch/coze-design/icons';
import {
  Select,
  Tooltip,
  Button,
  IconButton,
  Typography,
} from '@coze-arch/coze-design';

const { Text } = Typography;

import { type EditorProps, type LanguageType } from '../../interface';

import style from './style.module.less';

import { I18n } from '@coze-arch/i18n';

const HELP_DOCUMENT_LINK = IS_OVERSEA
  ? '/docs/guides/code_node?_lang=en'
  : '/docs/guides/code_node';

interface Props extends EditorProps {
  children: ReactNode;
  onLanguageSelect?: (language: LanguageType) => void;
  language: LanguageType;
}

export const Layout = ({
  children,
  title,
  language,
  onClose,
  onTestRun,
  testRunIcon,
  onLanguageSelect,
  languageTemplates,
}: Props) => {
  const optionList = useMemo(
    () =>
      languageTemplates?.map(e => ({
        value: e.language,
        label: e.displayName,
      })),
    [languageTemplates],
  );

  return (
    <div className={style.container}>
      <div className={style.header}>
        <div className={style.title}>
          <div className={style['title-icon']}>
            <IconCozCodeFill />
          </div>
          <div className={style['title-content']}>{title}</div>

          <Tooltip
            content={
              <div>
                {I18n.t('code_node_more_info')}
                <Text link={{ href: HELP_DOCUMENT_LINK, target: '_blank' }}>
                  {I18n.t('code_node_help_doc')}
                </Text>
              </div>
            }
            theme={'dark'}
          >
            <Select
              onChange={value => onLanguageSelect?.(value as LanguageType)}
              value={language}
              renderSelectedItem={item => (
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--coz-fg-secondary)',
                  }}
                >
                  {I18n.t('code_node_language')} {item.label}
                </span>
              )}
              size={'small'}
              optionList={optionList}
            ></Select>
          </Tooltip>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            color={'highlight'}
            icon={
              testRunIcon ? (
                <span
                  style={{
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {testRunIcon}
                </span>
              ) : (
                <IconCozPlayCircle style={{ fontSize: 14 }} />
              )
            }
            size={'small'}
            onClick={onTestRun}
          >
            {I18n.t('code_node_test_code')}
          </Button>

          <IconButton
            onClick={onClose}
            color={'secondary'}
            size={'small'}
            icon={<IconCozSideCollapse style={{ fontSize: 18 }} />}
          />
        </div>
      </div>
      {children}
    </div>
  );
};

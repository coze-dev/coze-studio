import { useMemo, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Typography } from '@coze-arch/bot-semi';

import { generateStrAvoidEscape } from '../utils/generate-str-avoid-escape';

export const MAX_LENGTH = 10000;

export const LongStrValue: React.FC<{ str: string }> = ({ str }) => {
  const [more, setMore] = useState(false);

  const echoStr = useMemo(() => {
    const current = more ? str : str.slice(0, MAX_LENGTH);
    return generateStrAvoidEscape(current);
  }, [str, more]);

  return (
    <>
      {echoStr}
      {!more && (
        <Typography.Text link onClick={() => setMore(true)}>
          {I18n.t('see_more')}
        </Typography.Text>
      )}
    </>
  );
};

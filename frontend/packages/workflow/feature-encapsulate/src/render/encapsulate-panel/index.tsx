import { useEffect, useState, type FC } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { useService } from '@flowgram-adapter/free-layout-editor';

import { useSelectedNodes } from '../hooks/use-selected-nodes';
import { EncapsulateRenderService } from '../encapsulate-render-service';
import { EncapsulateButton } from '../encapsulate-button';
import { EncapsulateService } from '../../encapsulate';

import styles from './index.module.less';

export const EncapsulatePanel: FC = () => {
  const { selectedNodes } = useSelectedNodes();
  const { length } = selectedNodes || [];
  const [show, setShow] = useState(false);

  const encapsulateService = useService<EncapsulateService>(EncapsulateService);
  const encapsulateRenderService = useService<EncapsulateRenderService>(
    EncapsulateRenderService,
  );

  useEffect(() => {
    const display = encapsulateService.canEncapsulate() && length > 1;
    if (!display) {
      encapsulateRenderService.hideTooltip();
    }
    setShow(display);
  }, [length]);

  return (
    <div
      className={classNames(styles['encapsulate-panel'], {
        [styles['encapsulate-panel-show']]: show,
      })}
    >
      <div className={styles['encapsulate-panel-content']}>
        {I18n.t(
          'workflow_encapsulate_selecet',
          { length },
          `已选中 ${length} 个节点`,
        )}{' '}
        <EncapsulateButton />
      </div>
    </div>
  );
};

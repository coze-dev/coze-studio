import { useState } from 'react';

import { Divider } from '@coze/coze-design';

import { ZoomSelect } from './zoom-select';
import { MinimapSwitch } from './minimap-switch';
import { Minimap } from './minimap';
import { Interactive } from './interactive';

import s from './index.module.less';

export const Tools = () => {
  const [minimapVisible, setMinimapVisible] = useState(false);
  return (
    <div className={s.tools}>
      <Interactive />
      <MinimapSwitch
        minimapVisible={minimapVisible}
        setMinimapVisible={setMinimapVisible}
      />
      <Minimap visible={minimapVisible} />
      <Divider className={s.divider} layout="vertical" />
      <ZoomSelect />
    </div>
  );
};

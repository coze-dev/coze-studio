import React from 'react';

import styles from './styles.module.less';

export const ShortcutItem = ({
  item,
}: {
  item: {
    key: string;
    label: string;
    keybinding: string[][];
  };
}) => {
  const { key, label, keybinding } = item;

  return (
    <div className={styles['shortcut-item']} key={key}>
      <div className={styles.label}>{label}</div>
      <div className={styles.keybinding}>
        {keybinding.map(bindings =>
          bindings.map(binding => (
            <div key={binding} className={styles['keybinding-block']}>
              {binding}
            </div>
          )),
        )}
      </div>
    </div>
  );
};

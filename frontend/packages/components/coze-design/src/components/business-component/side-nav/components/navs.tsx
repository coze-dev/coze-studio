import React, { type FC } from 'react';

import { Title, type TitleProps } from './title';
import { Nav, type NavProps } from './nav';
import { Divider } from './divider';

export enum NavType {
  ITEM = 'item',
  DIVIDER = 'divider',
  TITLE = 'title',
}
export interface NavsProps {
  schema: {
    type: NavType;
    props?: (NavProps | TitleProps) & {
      text: string;
    };
  }[];
  onSelect?: (key: string) => void;
  selected?: string;
}
export const Navs: FC<NavsProps> = props => {
  const { schema, onSelect, selected } = props;
  return (
    <div className={['flex', 'flex-col', 'gap-[8px]'].join(' ')}>
      {schema.map((nav, i) => {
        if (nav.type === 'divider') {
          return <Divider key={`${i}`} />;
        } else if (nav.type === 'title') {
          // @ts-expect-error -- linter-disable-autofix
          return <Title key={nav.props.text} {...nav.props} />;
        } else {
          return (
            <Nav
              // @ts-expect-error -- linter-disable-autofix
              key={nav.props.text}
              {...(nav.props as NavProps)}
              // @ts-expect-error -- linter-disable-autofix
              selected={selected === nav.props.text}
              onClick={() => {
                // @ts-expect-error -- linter-disable-autofix
                onSelect(nav.props.text);
              }}
            />
          );
        }
      })}
    </div>
  );
};

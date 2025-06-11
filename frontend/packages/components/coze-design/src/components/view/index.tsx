import React, { type ReactNode } from 'react';

import { isString, isBoolean, isNumber } from 'lodash-es';
import { cva } from 'class-variance-authority';

interface Children {
  children: React.ReactNode;
}

interface ViewProps {
  prop: string;
  value: string | undefined;
  children: React.ReactNode;
  direction?: string;
  justify?: string;
}

interface EnhancedViewProps {
  prop?: string;
  value?: string;
  children: React.ReactNode;
}

export function Badge({ children }: Children) {
  return (
    <div className="flex items-center space-x-0">
      <span>=&quot;</span>
      <div className="rounded px-1 text-sm bg-yellow-1 text-yellow-7 border border-dashed border-red-2">
        {children}
      </div>
      <span>&quot;</span>
    </div>
  );
}

export function ViewGroup({
  children,
  direction = 'column',
}: {
  children: ReactNode;
  direction?: 'column' | 'row';
}) {
  const viewClasses = cva(['flex', 'justify-evenly'], {
    variants: {
      direction: {
        row: ['flex-row', 'space-x-5'],
        column: ['flex-col', 'space-y-5'],
      },
    },
  });

  return <div className={viewClasses({ direction })}>{children}</div>;
}

export function EnhancedView({
  prop = 'Default',
  value = '',
  ...props
}: EnhancedViewProps) {
  const child = React.Children.only(props.children) as React.ReactElement;

  if (!child) {
    return null;
  }

  const { children, ...rest } = child.props;

  return (
    <div className="flex flex-col border border-solid coz-stroke-primary divide-y divide-background-6 rounded-lg shadow-sm h-auto">
      <div className="flex space-x-2 items-center p-2.5 border-0 border-b border-solid coz-stroke-primary">
        <span>{prop}</span>
        {value ? <Badge>{value}</Badge> : null}
      </div>
      <div className="flex flex-wrap">
        <div className="flex flex-col min-w-[250px] border border-solid coz-stroke-primary divide-y divide-background-6 rounded m-2.5 text-sm ">
          <span className="font-medium p-1.5">Props</span>
          {Object.keys(rest).map(key => (
            <div className="flex items-center space-x-0 p-1.5" key={key}>
              <div className="text-gray-500">{key}</div>
              {(isNumber(rest[key]) || isString(rest[key])) && (
                <div className="text-gray-800">
                  <Badge>{rest[key]}</Badge>
                </div>
              )}
              {isBoolean(rest[key]) && (
                <div className="text-gray-800">
                  <Badge>{String(rest[key])}</Badge>
                </div>
              )}
            </div>
          ))}
          {!Object.keys(rest).length && (
            <span className="text-gray-700 p-1.5">No properties selected</span>
          )}
        </div>
        <div className="bg-grid relative flex-1 p-2.5">{props.children}</div>
      </div>
    </div>
  );
}

export function View({
  prop = '',
  value = '',
  direction = 'row',
  justify = 'evenly',
  children,
}: ViewProps) {
  const flexDirection = direction === 'column' ? 'column' : 'row';

  const justifyContent = justify === 'start' ? 'flex-start' : 'space-evenly';

  return (
    <div className="coz-view flex flex-col border border-solid coz-stroke-primary divide-y divide-background-6 rounded-lg shadow-sm h-auto">
      <div className="flex space-x-2 items-center p-2.5 text-foreground border-0 border-b border-solid coz-stroke-primary">
        {prop}
        {value ? <Badge>{value}</Badge> : null}
      </div>
      <div
        className="bg-grid flex flex-wrap items-start justify-center gap-x-2 gap-y-2 p-5"
        style={{ flexDirection, justifyContent }}
      >
        {children}
      </div>
    </div>
  );
}

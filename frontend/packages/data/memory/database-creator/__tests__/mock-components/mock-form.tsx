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

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

class EventEmitter {
  private listenerMap: Map<string, Array<(...args: any[]) => void>>;
  constructor() {
    this.listenerMap = new Map();
  }
  fire(key: string, ...rest: any[]) {
    const listeners = this.listenerMap.get(key);
    for (const listener of listeners) {
      listener(rest);
    }
  }
  on(key: string, listener: (...args: any[]) => void) {
    if (!this.listenerMap.has(key)) {
      this.listenerMap.set(key, []);
    }
    const listeners = this.listenerMap.get(key);
    listeners.push(listener);
  }
  off(key: string) {
    this.listenerMap.delete(key);
  }
}

const eventEmitter = new EventEmitter();

let initValue = {};

export const withField = (
  Comp: (props: { onChange: (v: any) => void }) => React.ReactElement,
  field: {
    valueKey: string;
  },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- linter-disable-autofix
  const onChange = useCallback(v => {
    eventEmitter.fire('change', field.valueKey, v);
  }, []);
  return (props: {
    field: string;
    label: {
      text: string;
    };
    validate: (v) => string | undefined;
  }) => {
    <>
      {props.label.text}
      <Comp
        onChange={v => {
          if (props.validate(v.target.value) !== undefined) {
            return;
          }
          onChange(v.target.value);
        }}
      />
    </>;
  };
};

export const MockForm = React.forwardRef(
  (
    props: {
      initValues: Record<string, any>;
      children: React.ReactElement;
      onValueChange: (values: any, changeV: any) => void;
    },
    ref,
  ) => {
    const valuesRef = useRef(props.initValues);
    useImperativeHandle(ref, () => ({
      formApi: {
        validate: (_fields: string[]) => true,
      },
    }));
    useEffect(() => {
      eventEmitter.on('change', (...args: any[]) => {
        // In fact, it is all false. Suppose the first argument of args is field and the second argument is a specific value.
        valuesRef.current[args[0]] = args[1];
        props.onValueChange(valuesRef.current, args[1]);
      });
      return () => {
        eventEmitter.off('change');
      };
    }, []);
    initValue = props.initValues;
    return <>{props.children}</>;
  },
);

(MockForm as any).TextArea = (props: { field: string; label: string }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- linter-disable-autofix
  const [value, setValue] = useState(initValue[props.field]);
  return (
    <>
      <div>{props.label}</div>
      <div>{initValue[props.field]}</div>
      <input
        value={value}
        onChange={v => {
          setValue(v.target.value);
          eventEmitter.fire('change', props.field, v.target.value);
        }}
      />
    </>
  );
};

(MockForm as any).Select = (props: {
  field: string;
  label: {
    text: string;
    extra: React.ReactElement;
  };
  optionList: Array<{
    label: React.ReactElement;
    value: number;
  }>;
}) => {
  const { label, optionList } = props;
  return (
    <>
      <div>{label.text}</div>
      {label.extra}
      {optionList.map(option => (
        <button
          onClick={() => {
            eventEmitter.fire('change', props.field, option.value);
          }}
        >
          {option.label}
        </button>
      ))}
    </>
  );
};

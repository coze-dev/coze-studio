import {
  createContext,
  type FC,
  type PropsWithChildren,
  useContext,
  useRef,
} from 'react';

interface FieldsRequireCenter {
  verifyFns: Set<() => void>;
  triggerAllVerify: () => void;
  registerVerifyFn: (fn: () => void) => () => void;
}

const FieldsRequireCenterContext = createContext<FieldsRequireCenter>({
  verifyFns: new Set(),
  triggerAllVerify: () => undefined,
  registerVerifyFn: () => () => undefined,
});

export const FieldsRequireCenterWrapper: FC<PropsWithChildren> = ({
  children,
}) => {
  const fns = useRef(new Set<() => void>());

  return (
    <FieldsRequireCenterContext.Provider
      value={{
        verifyFns: fns.current,
        triggerAllVerify: () => {
          fns.current.forEach(fn => fn());
        },
        registerVerifyFn: fn => {
          fns.current.add(fn);

          return () => {
            fns.current.delete(fn);
          };
        },
      }}
    >
      {children}
    </FieldsRequireCenterContext.Provider>
  );
};

FieldsRequireCenterWrapper.displayName = 'FieldsRequireCenterWrapper';

export const useRequireVerifyCenter = (): Omit<
  FieldsRequireCenter,
  'verifyFns'
> => useContext(FieldsRequireCenterContext);

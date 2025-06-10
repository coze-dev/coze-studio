import {
  type PropsWithChildren,
  createContext,
  useState,
  useEffect,
} from 'react';

import { type FormilyModule, type FormilyContextProps } from './type';

export const FormilyContext = createContext<FormilyContextProps>({
  formilyModule: { status: 'unInit', formilyReact: null, formilyCore: null },
  retryImportFormily: () => void 0,
});

export const FormilyProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [formilyModule, setFormilyModule] = useState<FormilyModule>({
    status: 'unInit',
    formilyCore: null,
    formilyReact: null,
  });

  const importFormily = async () => {
    setFormilyModule({
      formilyCore: null,
      formilyReact: null,
      status: 'loading',
    });
    try {
      const [formilyCore, formilyReact] = await Promise.all([
        import('@formily/core'),
        import('@formily/react'),
      ]);
      setFormilyModule({
        status: 'ready',
        formilyCore,
        formilyReact,
      });
    } catch (error) {
      setFormilyModule({
        status: 'error',
        formilyCore: null,
        formilyReact: null,
      });
      throw error;
    }
  };

  useEffect(() => {
    importFormily();
  }, []);

  return (
    <FormilyContext.Provider
      value={{
        formilyModule,
        retryImportFormily: importFormily,
      }}
    >
      {children}
    </FormilyContext.Provider>
  );
};

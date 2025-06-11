import { createRoot } from 'react-dom/client';

export const renderDom = <T extends {}>(
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Comp: React.ComponentType<T>,
  props: T,
) => {
  const dom = document.createElement('span');
  const root = createRoot(dom);
  root.render(<Comp {...props} />);

  return {
    dom,
    root,
    destroy() {
      root.unmount();
    },
  };
};

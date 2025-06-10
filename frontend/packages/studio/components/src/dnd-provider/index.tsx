import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider as Provider } from 'react-dnd';
import { type ReactNode, createContext, useContext } from 'react';
const DnDContext = createContext<{
  isInProvider: boolean;
}>({
  isInProvider: false,
});
export const DndProvider = ({ children }: { children: ReactNode }) => {
  const context = useContext(DnDContext);
  return (
    <DnDContext.Provider
      value={{
        isInProvider: true,
      }}
    >
      {context.isInProvider ? (
        children
      ) : (
        <Provider backend={HTML5Backend} context={window}>
          {children}
        </Provider>
      )}
    </DnDContext.Provider>
  );
};

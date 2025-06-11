import {
  createContext,
  useContext,
  forwardRef,
  type PropsWithChildren,
  useImperativeHandle,
} from 'react';

import { type AddNodeRef } from '@/typing';
import { useAddNode } from '@/hooks/use-add-node';

export type AddNodeModalContextType = Partial<
  Pick<
    ReturnType<typeof useAddNode>,
    'openImageflow' | 'openWorkflow' | 'openPlugin' | 'updateAddNodePosition'
  >
>;
export type AddNodeModalProviderRefType = AddNodeRef;

const AddNodeModalContext = createContext<AddNodeModalContextType>({});

export const useAddNodeModalContext = () => useContext(AddNodeModalContext);

export const AddNodeModalProvider = forwardRef<
  AddNodeModalProviderRefType,
  PropsWithChildren<{ readonly: boolean }>
>(({ readonly, children }, ref) => {
  const {
    handleAddNode,
    updateAddNodePosition,
    modals,
    openPlugin,
    openWorkflow,
    openImageflow,
  } = useAddNode();
  useImperativeHandle(
    ref,
    () => ({
      handleAddNode: (item, coord, isDrag) => {
        if (readonly) {
          return;
        }
        handleAddNode(item, coord, isDrag);
      },
    }),
    [readonly, handleAddNode],
  );
  return (
    <AddNodeModalContext.Provider
      value={{ openPlugin, openWorkflow, openImageflow, updateAddNodePosition }}
    >
      {children}
      {modals}
    </AddNodeModalContext.Provider>
  );
});

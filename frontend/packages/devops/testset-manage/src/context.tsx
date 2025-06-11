import { useRef, type PropsWithChildren, createContext } from 'react';

import { createTestsetManageStore, type TestsetManageState } from './store';

type TestsetManageStore = ReturnType<typeof createTestsetManageStore>;

export const TestsetManageContext = createContext<TestsetManageStore | null>(
  null,
);

/**
 * TestsetManageProvider
 * 在workflow场景下必传参
 * ```tsx
 * <TestsetManageProvider
 *   bizCtx={{
 *     // 写死，10000代表Coze
 *     connectorID: '10000',
 *     // space id
 *     bizSpaceID: spaceID,
 *     // user id
 *     connectorUID: userID,
 *   }}
 *   bizComponentSubject={{
 *     // workflow id
 *     componentID: globalState.workflowId,
 *     // 写死
 *     componentType: ComponentType.CozeWorkflow,
 *     parentComponentID: globalState.workflowId,
 *     parentComponentType: ComponentType.CozeWorkflow,
 *   }}
 *   // 可编辑
 *   editable={true}
 *   // 自定义表单渲染，传入标准表单即可
 *   // 下面的代表Object类型用`UIFormTextArea`渲染
 *   formRenders={{ [FormItemSchemaType.OBJECT]: UIFormTextArea }}
 * >
 *   <TestsetSideSheet visible={visible} onClose={() => setVisible(false)} />
 * </TestsetManageProvider>
 * ```
 */
export function TestsetManageProvider({
  children,
  ...props
}: PropsWithChildren<TestsetManageState>) {
  const storeRef = useRef<TestsetManageStore>();
  if (!storeRef.current) {
    storeRef.current = createTestsetManageStore(props);
  }

  return (
    <TestsetManageContext.Provider value={storeRef.current}>
      {children}
    </TestsetManageContext.Provider>
  );
}

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

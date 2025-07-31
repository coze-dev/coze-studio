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

import { useEffect, useRef } from 'react';

import { initEditorByPrologue } from '../method/init-editor';
import { type OnboardingEditorContext } from '../index';

export const useInitEditor = ({
  props,
  editorRef,
}: OnboardingEditorContext) => {
  const { initValues } = props;
  const { prologue } = initValues || {};
  const hasInit = useRef(false);
  useEffect(() => {
    if (hasInit.current) {
      return;
    }
    if (!prologue) {
      return;
    }
    if (!editorRef.current) {
      return;
    }
    hasInit.current = true;
    if (props.plainText) {
      editorRef.current.setText(prologue);
    } else {
      initEditorByPrologue({
        prologue,
        editorRef,
      });
    }
    // Scroll to top
    editorRef.current?.scrollModule?.scrollTo({
      top: 0,
    });
  }, [prologue, editorRef.current]);
};

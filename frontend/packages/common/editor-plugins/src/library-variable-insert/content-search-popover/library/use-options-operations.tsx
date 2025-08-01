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

import { type MutableRefObject } from 'react';

import styles from '../style.module.less';
import type { ILibraryItem, ILibraryList } from '../../../library-insert';

const SELECTED_OPTION_CLASSNAME =
  styles['library-suggestion-keyboard-selected'];

interface OptionsInfo {
  elements: Element[];
  selectedIndex: number;
  selectedElement?: Element;
}

const getOptionInfoFromDOM = (
  root: Element | null,
): OptionsInfo | undefined => {
  if (!root) {
    return;
  }

  const foundNodes = root.querySelectorAll(`.${styles['library-item']}`);

  if (foundNodes.length === 0) {
    return;
  }

  const optionElements = [...foundNodes];

  // Find the currently highlighted option
  const selectedIndex = optionElements.findIndex(element =>
    element.classList.contains(SELECTED_OPTION_CLASSNAME),
  );

  return {
    elements: optionElements,
    selectedIndex,
    selectedElement: optionElements[selectedIndex],
  };
};

const selectNodeByIndex = (elements: Element[], index: number) => {
  const newSelectedElement = elements[index];

  if (!newSelectedElement) {
    return;
  }

  // remove old selected class
  elements.forEach(element => {
    if (element.classList.contains(SELECTED_OPTION_CLASSNAME)) {
      element.classList.remove(SELECTED_OPTION_CLASSNAME);
    }
  });

  newSelectedElement.classList.add(SELECTED_OPTION_CLASSNAME);

  newSelectedElement.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
  });
};

interface Props {
  rootRef: MutableRefObject<HTMLDivElement | null>;
  libraries: ILibraryList;
  applyCallBack?: (item: ILibraryItem) => void;
}

export default function useOptionsOperations({
  rootRef,
  libraries,
  applyCallBack,
}: Props) {
  const prev = () => {
    const optionsInfo = getOptionInfoFromDOM(rootRef.current);

    if (!optionsInfo) {
      return;
    }

    const { elements, selectedIndex } = optionsInfo;

    if (elements.length === 1) {
      return;
    }

    const newIndex =
      selectedIndex - 1 < 0 ? elements.length - 1 : selectedIndex - 1;
    selectNodeByIndex(elements, newIndex);
  };
  const next = () => {
    const optionsInfo = getOptionInfoFromDOM(rootRef.current);
    if (!optionsInfo) {
      return;
    }

    const { elements, selectedIndex } = optionsInfo;

    const newIndex =
      selectedIndex + 1 >= elements.length ? 0 : selectedIndex + 1;
    selectNodeByIndex(elements, newIndex);
  };

  const apply = () => {
    const optionsInfo = getOptionInfoFromDOM(rootRef.current);
    if (!optionsInfo) {
      return;
    }

    const selectedLibrary = libraries.reduce<ILibraryItem[]>(
      (previousValue, currentValue) => [
        ...previousValue,
        ...(currentValue?.items || []),
      ],
      [],
    )[optionsInfo.selectedIndex];

    if (!selectedLibrary) {
      return;
    }

    applyCallBack?.(selectedLibrary);
  };

  return {
    prev,
    next,
    apply,
  };
}

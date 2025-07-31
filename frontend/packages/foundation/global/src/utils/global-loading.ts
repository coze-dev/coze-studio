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

export function removeGlobalLoading() {
  const spin = document.querySelector('#global-spin-wrapper');
  // Hide loading directly for browsers that do not support MutationObserver to avoid affecting the display of normal pages
  if (!window.MutationObserver && spin) {
    (spin as HTMLElement).style.display = 'none';
    return;
  }
  const targetNode = document.querySelector('#root');
  const observerOptions = {
    childList: true, // Observe the changes of the target sub-node and see if any are added or deleted
    attributes: true, // Observe attribute changes
    subtree: true, // Observe the descendant nodes, the default is false
  };

  const observer = new MutationObserver(function callback(mutationList) {
    // Cancel loading if there is any change in the root node and cancel the observation
    mutationList.forEach(mutation => {
      if (spin) {
        (spin as HTMLElement).style.display = 'none';
      }
      observer.disconnect();
    });
  });
  observer.observe(targetNode as Element, observerOptions);
}

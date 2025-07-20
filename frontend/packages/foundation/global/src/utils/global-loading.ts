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
  // 对于不支持MutationObserver的浏览器直接隐藏 loading，避免影响正常页面的展示
  if (!window.MutationObserver && spin) {
    (spin as HTMLElement).style.display = 'none';
    return;
  }
  const targetNode = document.querySelector('#root');
  const observerOptions = {
    childList: true, // 观察目标子节点的变化，是否有添加或者删除
    attributes: true, // 观察属性变动
    subtree: true, // 观察后代节点，默认为 false
  };

  const observer = new MutationObserver(function callback(mutationList) {
    // root 节点有任何变化就取消 loading，并取消观测
    mutationList.forEach(mutation => {
      if (spin) {
        (spin as HTMLElement).style.display = 'none';
      }
      observer.disconnect();
    });
  });
  observer.observe(targetNode as Element, observerOptions);
}

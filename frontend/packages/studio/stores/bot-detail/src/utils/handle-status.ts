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

import { type Branch, type Committer } from '@coze-arch/bot-api/developer_api';

import { useCollaborationStore } from '../store/collaboration';

interface HeaderStatusType {
  branch?: Branch;
  same_with_online?: boolean;
  committer?: Committer;
  commit_version?: string;
}

export function updateHeaderStatus(props: HeaderStatusType) {
  const { setCollaborationByImmer } = useCollaborationStore.getState();
  setCollaborationByImmer(store => {
    store.sameWithOnline = props.same_with_online ?? false;
    if (props.committer) {
      store.commit_time = props.committer.commit_time ?? '';
      store.committer_name = props.committer.name ?? '';
    }
    if (props.commit_version) {
      store.commit_version = props.commit_version;
      store.baseVersion = props.commit_version;
    }
    if (props.branch) {
      store.branch = props.branch;
    }
  });
}

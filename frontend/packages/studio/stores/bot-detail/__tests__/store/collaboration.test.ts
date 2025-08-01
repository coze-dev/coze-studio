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

import { expect } from 'vitest';
import { Branch } from '@coze-arch/idl/developer_api';

import { useBotDetailStoreSet } from '../../src/store/index';
import { useCollaborationStore } from '../../src/store/collaboration';

describe('useCollaborationStore', () => {
  beforeEach(() => {
    useBotDetailStoreSet.clear();
  });

  it('should set collaboration status correctly using setCollaboration', () => {
    const newState = { inCollaboration: true };
    useCollaborationStore.getState().setCollaboration(newState);

    const state = useCollaborationStore.getState();
    expect(state.inCollaboration).toBe(true);
  });

  it('should update state correctly using setCollaborationByImmer', () => {
    useCollaborationStore.getState().setCollaborationByImmer(draft => {
      draft.committer_name = 'Jane Doe';
      draft.sameWithOnline = false;
    });

    const state = useCollaborationStore.getState();
    expect(state.committer_name).toBe('Jane Doe');
    expect(state.sameWithOnline).toBe(false);
  });

  it('initialize', () => {
    const mockData = {
      bot_info: {},
      collaborator_status: {
        commitable: true,
        operateable: true,
        manageable: true,
      },
      in_collaboration: true,
      commit_version: 'v1.0.0',
      same_with_online: true,
      committer_name: 'John Doe',
      branch: Branch.Base,
      commit_time: '2021-01-01T00:00:00Z',
    };

    useCollaborationStore.getState().initStore(mockData);

    const state = useCollaborationStore.getState();
    expect(state).toMatchObject({
      collaboratorStatus: {
        commitable: true,
        operateable: true,
        manageable: true,
      },
      inCollaboration: true,
      sameWithOnline: true,
      baseVersion: 'v1.0.0',
      branch: Branch.Base,
      commit_time: '2021-01-01T00:00:00Z',
      committer_name: 'John Doe',
      commit_version: 'v1.0.0',
    });
  });

  it('should clear the collaboration store to initial state', () => {
    useCollaborationStore.getState().clear();

    const state = useCollaborationStore.getState();
    expect(state.inCollaboration).toBe(false);
    expect(state.committer_name).toEqual('');
    expect(state.commit_version).toEqual('');
  });
  it('getBaseVersion', () => {
    const overall1 = {
      inCollaboration: true,
      baseVersion: 'fake version',
    };

    useCollaborationStore.getState().setCollaboration(overall1);

    expect(useCollaborationStore.getState().getBaseVersion()).toEqual(
      overall1.baseVersion,
    );

    useCollaborationStore.getState().clear();

    const overall2 = {
      inCollaboration: false,
      baseVersion: 'fake version',
    };

    useCollaborationStore.getState().setCollaboration(overall2);

    expect(useCollaborationStore.getState().getBaseVersion()).toBeUndefined();
  });
});

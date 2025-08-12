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

import { type Mock } from 'vitest';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { SpaceType } from '@coze-arch/bot-api/developer_api';
import { PlaygroundApi } from '@coze-arch/bot-api';

import { getBotDetailIsReadonly } from '../../src/utils/get-read-only';
import { useCollaborationStore } from '../../src/store/collaboration';
import { collaborateQuota } from '../../src/store/collaborate-quota';
import { useBotInfoStore } from '../../src/store/bot-info';

vi.mock('@coze-arch/bot-api', () => ({
  PlaygroundApi: {
    GetBotCollaborationQuota: vi.fn(),
  },
}));

vi.mock('../../src/utils/get-read-only', () => ({
  getBotDetailIsReadonly: vi.fn(),
}));

vi.mock('../../src/store/bot-info', () => ({
  useBotInfoStore: {
    getState: vi.fn(),
  },
}));

vi.mock('@coze-arch/bot-studio-store', () => ({
  useSpaceStore: {
    getState: vi.fn(() => ({
      space: {
        space_type: SpaceType.Personal,
      },
    })),
  },
}));

vi.mock('@coze-arch/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('collaborateQuota', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it('should not proceed if isReadOnly is true', async () => {
    (getBotDetailIsReadonly as Mock).mockReturnValueOnce(true);
    await collaborateQuota();
    expect(useCollaborationStore.getState().inCollaboration).toBe(false);
  });
  it('should not proceed if space_type is Personal', async () => {
    (getBotDetailIsReadonly as Mock).mockReturnValueOnce(false);
    (useSpaceStore.getState as Mock).mockReturnValue({
      space: { space_type: SpaceType.Personal },
    });
    await collaborateQuota();
    expect(useCollaborationStore.getState().inCollaboration).toBe(false);
  });
  it('should fetch collaboration quota and set collaboration state', async () => {
    (getBotDetailIsReadonly as Mock).mockReturnValueOnce(false);
    (useSpaceStore.getState as Mock).mockReturnValue({
      space: { space_type: SpaceType.Team },
    });
    (useBotInfoStore.getState as Mock).mockReturnValue({
      botId: 'test-bot-id',
    });
    const mockQuota = {
      open_collaborators_enable: true,
      can_upgrade: true,
      max_collaboration_bot_count: 5,
      max_collaborators_count: 10,
      current_collaboration_bot_count: 2,
    };
    (PlaygroundApi.GetBotCollaborationQuota as Mock).mockResolvedValue({
      data: mockQuota,
    });
    await collaborateQuota();
    expect(useCollaborationStore.getState().maxCollaborationBotCount).toBe(
      mockQuota.max_collaboration_bot_count,
    );
    expect(useCollaborationStore.getState().maxCollaboratorsCount).toBe(
      mockQuota.max_collaborators_count,
    );
  });
  it('should handle errors correctly', async () => {
    (getBotDetailIsReadonly as Mock).mockReturnValueOnce(true);
    (useSpaceStore.getState as Mock).mockReturnValue({
      space: { space_type: SpaceType.Personal },
    });
    (useBotInfoStore.getState as Mock).mockReturnValue({
      botId: 'test-bot-id',
    });
    useCollaborationStore.getState().setCollaboration({
      inCollaboration: false,
    });
    const mockError = new Error('Test error');
    (PlaygroundApi.GetBotCollaborationQuota as Mock).mockRejectedValue(
      mockError,
    );
    await collaborateQuota();
    expect(useCollaborationStore.getState().inCollaboration).toBe(false);
  });
  it('should handle errors correctly', async () => {
    (getBotDetailIsReadonly as Mock).mockReturnValueOnce(false);
    (useSpaceStore.getState as Mock).mockReturnValue({
      space: { space_type: SpaceType.Team },
    });
    (useBotInfoStore.getState as Mock).mockReturnValue({
      botId: 'test-bot-id',
    });
    useCollaborationStore.getState().setCollaboration({
      inCollaboration: true,
    });
    const mockQuota = {
      open_collaborators_enable: false,
      can_upgrade: false,
    };
    (PlaygroundApi.GetBotCollaborationQuota as Mock).mockResolvedValue({
      data: mockQuota,
    });
    await collaborateQuota();
  });
});

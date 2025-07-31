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

import { z } from 'zod';
import { produce } from 'immer';
import { typeSafeJSONParse } from '@coze-arch/bot-utils';

const publishAnchorDataSchema = z.object({
  projectId: z.string(),
  connectorIdBeforeRedirect: z.string(),
});

const publishAnchorSchema = z.record(publishAnchorDataSchema);

type PublishAnchorData = z.infer<typeof publishAnchorDataSchema>;

type PublishAnchorType = z.infer<typeof publishAnchorSchema>;

class PublishAnchorService {
  private PUBLISH_ANCHOR_KEY = 'coz_project_publish_anchor';
  anchorValues: PublishAnchorType = {};

  private load = () => {
    try {
      const stringifyLocalData = localStorage.getItem(this.PUBLISH_ANCHOR_KEY);
      const localData = typeSafeJSONParse(stringifyLocalData);
      const validData = publishAnchorSchema.parse(localData);
      // Using zod to type-check localData
      this.anchorValues = validData;
    } catch {
      this.anchorValues = {};
    }
  };

  private save = () => {
    localStorage.setItem(
      this.PUBLISH_ANCHOR_KEY,
      JSON.stringify(this.anchorValues),
    );
  };

  setAnchor: (params: {
    userId: string;
    projectId: string;
    connectorId: string;
  }) => void = ({ userId, projectId, connectorId }) => {
    this.anchorValues = produce(this.anchorValues, draft => {
      draft[userId] = {
        projectId,
        connectorIdBeforeRedirect: connectorId,
      };
    });
    this.save();
  };
  getAnchor: (params: {
    userId: string;
    projectId: string;
  }) => PublishAnchorData | undefined = ({ userId, projectId }) => {
    const userData = this.anchorValues[userId];
    if (userData?.projectId === projectId) {
      return userData;
    }
  };

  removeAnchor: (params: { userId: string; projectId: string }) => void = ({
    userId,
    projectId,
  }) => {
    const hasAnchor = Boolean(this.getAnchor({ userId, projectId }));
    if (!hasAnchor) {
      return;
    }
    delete this.anchorValues[userId];
    this.save();
  };

  clearAll = () => {
    localStorage.removeItem(this.PUBLISH_ANCHOR_KEY);
    this.anchorValues = {};
  };

  constructor() {
    this.load();
  }
}

export const publishAnchorService = new PublishAnchorService();

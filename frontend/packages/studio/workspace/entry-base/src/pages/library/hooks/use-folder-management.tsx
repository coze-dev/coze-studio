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

import { useState, useCallback, useEffect } from 'react';

import { plugin_api } from '@coze-studio/api-schema';

export interface FolderInfo {
  id: string;
  space_id: string;
  parent_id?: string;
  name: string;
  description: string;
  creator_id: string;
  created_at: number;
  updated_at: number;
}

export interface UseFolderManagementProps {
  spaceId: string;
  onSuccess?: () => void;
}

export interface UseFolderManagementReturn {
  folders: FolderInfo[];
  loading: boolean;
  createFolder: (name: string, description?: string) => Promise<void>;
  moveResourcesToFolder: (
    folderId: string,
    resourceIds: string[],
    resourceType: number,
  ) => Promise<void>;
  refreshFolders: () => Promise<void>;
}

export const useFolderManagement = ({
  spaceId,
  onSuccess,
}: UseFolderManagementProps): UseFolderManagementReturn => {
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshFolders = useCallback(async () => {
    if (!spaceId) {
      return;
    }

    setLoading(true);
    try {
      const response = await plugin_api.get_folder_list({
        space_id: spaceId,
      });

      if (response.code === 0) {
        setFolders(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    } finally {
      setLoading(false);
    }
  }, [spaceId]);

  const createFolder = useCallback(
    async (name: string, description = '') => {
      if (!spaceId) {
        return;
      }

      try {
        const response = await plugin_api.create_folder({
          space_id: spaceId,
          name,
          description,
        });

        if (response.code === 0) {
          await refreshFolders();
          onSuccess?.();
        }
      } catch (error) {
        console.error('Failed to create folder:', error);
        throw error;
      }
    },
    [spaceId, refreshFolders, onSuccess],
  );

  const moveResourcesToFolder = useCallback(
    async (folderId: string, resourceIds: string[], resourceType: number) => {
      if (!spaceId) {
        return;
      }

      try {
        const response = await plugin_api.move_resources_to_folder({
          space_id: spaceId,
          folder_id: folderId,
          resource_ids: resourceIds,
          resource_type: resourceType,
        });

        if (response.code === 0) {
          onSuccess?.();
        }
      } catch (error) {
        console.error('Failed to move resources to folder:', error);
        throw error;
      }
    },
    [spaceId, onSuccess],
  );

  useEffect(() => {
    refreshFolders();
  }, [refreshFolders]);

  return {
    folders,
    loading,
    createFolder,
    moveResourcesToFolder,
    refreshFolders,
  };
};

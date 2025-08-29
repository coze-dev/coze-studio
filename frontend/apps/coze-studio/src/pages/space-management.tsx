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

import React, { useEffect, useState } from 'react';
import { space_management } from '@coze-studio/api-schema';

// 空间类型枚举
enum SpaceType {
  Personal = 1,
  Team = 2,
}

// 空间状态枚举
enum SpaceStatus {
  Active = 1,
  Inactive = 2,
  Archived = 3,
}

// 成员角色枚举
enum MemberRoleType {
  Owner = 1,
  Admin = 2,
  Member = 3,
}

interface SpaceInfo {
  space_id: number;
  name: string;
  description?: string;
  icon_url?: string;
  space_type: SpaceType;
  status: SpaceStatus;
  owner_id: number;
  creator_id: number;
  created_at: number;
  updated_at?: number;
  member_count?: number;
  current_user_role?: MemberRoleType;
}

interface SpaceMemberInfo {
  user_id: number;
  username: string;
  nickname?: string;
  avatar_url?: string;
  role: MemberRoleType;
  joined_at: number;
  last_active_at?: number;
}

const SpaceManagementPage: React.FC = () => {
  const [spaceList, setSpaceList] = useState<SpaceInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSpace, setCurrentSpace] = useState<SpaceInfo | null>(null);
  const [members, setMembers] = useState<SpaceMemberInfo[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  // 创建空间表单
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceDescription, setNewSpaceDescription] = useState('');
  const [newSpaceType, setNewSpaceType] = useState<SpaceType>(
    SpaceType.Personal,
  );

  // 获取空间列表
  const fetchSpaceList = async () => {
    try {
      setLoading(true);
      const response = await space_management.GetSpaceList({
        page: 1,
        page_size: 20,
      });

      if (response.code === 200) {
        setSpaceList(response.data || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch space list:', error);
      // 处理API客户端的特殊错误处理
      if (error.code === '200' || error.code === 200) {
        const responseData = error.response?.data;
        if (responseData && responseData.data) {
          setSpaceList(responseData.data);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // 创建新空间
  const createSpace = async () => {
    if (!newSpaceName.trim()) return;

    try {
      const response = await space_management.CreateSpace({
        name: newSpaceName,
        description: newSpaceDescription || undefined,
        space_type: newSpaceType,
      });

      if (response.code === 200) {
        setNewSpaceName('');
        setNewSpaceDescription('');
        setNewSpaceType(SpaceType.Personal);
        setShowCreateModal(false);
        await fetchSpaceList();
      }
    } catch (error: any) {
      console.error('Failed to create space:', error);
      if (error.code === '200' || error.code === 200) {
        setNewSpaceName('');
        setNewSpaceDescription('');
        setShowCreateModal(false);
        await fetchSpaceList();
      }
    }
  };

  // 获取空间成员
  const fetchSpaceMembers = async (spaceId: number) => {
    try {
      const response = await space_management.GetSpaceMembers({
        space_id: spaceId,
        page: 1,
        page_size: 100,
      });

      if (response.code === 200) {
        setMembers(response.data || []);
      }
    } catch (error: any) {
      if (error.code === '200' || error.code === 200) {
        const responseData = error.response?.data;
        if (responseData && responseData.data) {
          setMembers(responseData.data);
        }
      }
    }
  };

  // 删除空间
  const deleteSpace = async (spaceId: number) => {
    if (!confirm('确定要删除这个空间吗？此操作不可恢复。')) return;

    try {
      const response = await space_management.DeleteSpace({
        space_id: spaceId,
      });

      if (response.code === 200) {
        await fetchSpaceList();
      }
    } catch (error: any) {
      console.error('Failed to delete space:', error);
      if (error.code === '200' || error.code === 200) {
        await fetchSpaceList();
      }
    }
  };

  // 获取空间类型显示文本
  const getSpaceTypeText = (type: SpaceType) => {
    switch (type) {
      case SpaceType.Personal:
        return '个人空间';
      case SpaceType.Team:
        return '团队空间';
      default:
        return '未知';
    }
  };

  // 获取空间状态显示文本
  const getSpaceStatusText = (status: SpaceStatus) => {
    switch (status) {
      case SpaceStatus.Active:
        return '活跃';
      case SpaceStatus.Inactive:
        return '不活跃';
      case SpaceStatus.Archived:
        return '已归档';
      default:
        return '未知';
    }
  };

  // 获取角色显示文本
  const getRoleText = (role: MemberRoleType) => {
    switch (role) {
      case MemberRoleType.Owner:
        return '拥有者';
      case MemberRoleType.Admin:
        return '管理员';
      case MemberRoleType.Member:
        return '成员';
      default:
        return '未知';
    }
  };

  useEffect(() => {
    fetchSpaceList();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <a
          href="/space"
          className="text-blue-500 hover:text-blue-700 underline"
        >
          ← 返回工作空间
        </a>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">空间管理</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          创建新空间
        </button>
      </div>

      {/* 创建空间模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">创建新空间</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  空间名称
                </label>
                <input
                  type="text"
                  value={newSpaceName}
                  onChange={e => setNewSpaceName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入空间名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  描述（可选）
                </label>
                <textarea
                  value={newSpaceDescription}
                  onChange={e => setNewSpaceDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入空间描述"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  空间类型
                </label>
                <select
                  value={newSpaceType}
                  onChange={e =>
                    setNewSpaceType(Number(e.target.value) as SpaceType)
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={SpaceType.Personal}>个人空间</option>
                  <option value={SpaceType.Team}>团队空间</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={createSpace}
                disabled={!newSpaceName.trim()}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                创建
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 成员列表模态框 */}
      {showMemberModal && currentSpace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {currentSpace.name} - 成员管理
              </h2>
              <button
                onClick={() => setShowMemberModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {members.length === 0 ? (
                <div className="text-center text-gray-500 py-8">暂无成员</div>
              ) : (
                members.map(member => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt=""
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <span className="text-gray-600 font-semibold">
                            {member.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {member.nickname || member.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{member.username}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                        {getRoleText(member.role)}
                      </span>
                      <span className="text-sm text-gray-500">
                        加入于{' '}
                        {new Date(member.joined_at * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 空间列表 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">空间列表</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center">加载中...</div>
        ) : spaceList.length === 0 ? (
          <div className="p-6 text-center text-gray-500">暂无空间</div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              {spaceList.map(space => (
                <div
                  key={space.space_id}
                  className="border border-gray-200 rounded-md p-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{space.name}</h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                          {getSpaceTypeText(space.space_type)}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            space.status === SpaceStatus.Active
                              ? 'bg-green-100 text-green-800'
                              : space.status === SpaceStatus.Inactive
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {getSpaceStatusText(space.status)}
                        </span>
                        {space.current_user_role && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {getRoleText(space.current_user_role)}
                          </span>
                        )}
                      </div>

                      {space.description && (
                        <p className="text-gray-600 mb-2">
                          {space.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>ID: {space.space_id}</span>
                        <span>
                          创建时间:{' '}
                          {new Date(
                            space.created_at * 1000,
                          ).toLocaleDateString()}
                        </span>
                        {space.member_count && (
                          <span>成员数: {space.member_count}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setCurrentSpace(space);
                          fetchSpaceMembers(space.space_id);
                          setShowMemberModal(true);
                        }}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                      >
                        管理成员
                      </button>
                      <button
                        onClick={() => deleteSpace(space.space_id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                        disabled={
                          space.current_user_role !== MemberRoleType.Owner
                        }
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpaceManagementPage;

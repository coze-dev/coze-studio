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

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layout,
  Table,
  Button,
  Modal,
  Input,
  Select,
  Space,
  Tag,
  Avatar,
  Typography,
  Search,
  Popconfirm,
  Tabs,
  TabPane,
  Toast,
} from '@coze-arch/coze-design';
import { IconCozPlus, IconCozPeople, IconSearch } from '@coze-arch/coze-design/icons';
import { I18n } from '@coze-arch/i18n';
import classNames from 'classnames';

// 类型定义 - 匹配后端实际返回的数据结构
interface SpaceMember {
  user_id: string;
  username: string;
  nickname?: string;
  avatar_url?: string;
  role: number; // 1: Owner, 2: Admin, 3: Member
  joined_at: number;
  last_active_at?: number;
}

// 角色类型映射
const ROLE_TYPES = {
  1: { name: '所有者', color: 'bg-red-100 text-red-800' },
  2: { name: '管理员', color: 'bg-blue-100 text-blue-800' },
  3: { name: '成员', color: 'bg-gray-100 text-gray-800' }
};

// 搜索用户结果的类型定义
interface SearchUser {
  user_id: string;
  name: string;
  unique_name: string;
  email?: string;
  avatar_url?: string;
  created_at: number;
}

// 用户搜索弹窗组件
const AddMemberModal: React.FC<{
  isOpen: boolean;
  spaceId: string;
  onClose: () => void;
  onMemberAdded: () => void;
}> = ({ isOpen, spaceId, onClose, onMemberAdded }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [selectedRole, setSelectedRole] = useState(3); // 默认成员角色
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);

  // 搜索用户
  const searchUsers = useCallback(
    async (keyword: string) => {
      if (!keyword.trim()) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const response = await fetch(
          `/api/space/search-users?keyword=${encodeURIComponent(keyword)}&exclude_space_id=${spaceId}&limit=10`,
          {
            headers: {
              Accept: 'application/json, text/plain, */*',
              'Content-Type': 'application/json',
              'Agw-Js-Conv': 'str',
              'x-requested-with': 'XMLHttpRequest',
            },
          },
        );

        const data = await response.json();
        if (data.code === 0) {
          setSearchResults(data.data || []);
        } else {
          console.error('搜索用户失败:', data.msg);
          setSearchResults([]);
        }
      } catch (error: any) {
        console.error('搜索用户失败:', error);
        // 处理特殊的成功响应被当作错误的情况
        if (error.code === '200' || error.code === 200) {
          const responseData = error.response?.data;
          if (responseData && responseData.data) {
            setSearchResults(responseData.data);
          }
        } else {
          setSearchResults([]);
        }
      } finally {
        setSearching(false);
      }
    },
    [spaceId],
  );

  // 添加成员
  const addMember = async () => {
    if (!selectedUser) return;

    setAdding(true);
    try {
      const response = await fetch(`/api/space/${spaceId}/members`, {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Agw-Js-Conv': 'str',
          'x-requested-with': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          user_ids: [selectedUser.user_id],
          role: selectedRole,
        }),
      });

      const data = await response.json();
      if (data.code === 0) {
        onMemberAdded();
        handleClose();
      } else {
        console.error('添加成员失败:', data.msg);
      }
    } catch (error: any) {
      console.error('添加成员失败:', error);
      if (error.code === '200' || error.code === 200) {
        onMemberAdded();
        handleClose();
      } else {
        console.error('添加成员失败');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleClose = () => {
    setSearchKeyword('');
    setSearchResults([]);
    setSelectedUser(null);
    setSelectedRole(3);
    onClose();
  };

  // 延迟搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchKeyword);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchKeyword, searchUsers]);

  return (
    <Modal
      visible={isOpen}
      title="添加成员"
      onCancel={handleClose}
      width={500}
      footer={null}
    >
      <div className="space-y-4">
        {/* 搜索框 */}
        <div>
          <Input
            placeholder="搜索用户名或邮箱"
            value={searchKeyword}
            onChange={value => setSearchKeyword(value)}
          />
        </div>

        {/* 搜索结果 */}
        <div className="max-h-60 overflow-y-auto">
          {searching && (
            <div className="text-center py-4 text-gray-500">搜索中...</div>
          )}
          {!searching && searchResults.length === 0 && searchKeyword && (
            <div className="text-center py-4 text-gray-500">未找到用户</div>
          )}
          {!searching &&
            searchResults.map(user => (
              <div
                key={user.user_id}
                onClick={() => setSelectedUser(user)}
                className={`p-3 rounded-md cursor-pointer mb-2 ${
                  selectedUser?.user_id === user.user_id
                    ? 'bg-blue-100 border border-blue-300'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar size="small">
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* 角色选择 */}
        {selectedUser && (
          <div>
            <Typography.Text strong className="block mb-2">
              选择角色
            </Typography.Text>
            <Select
              value={selectedRole}
              onChange={v => setSelectedRole(v as number)}
              optionList={[
                { label: '成员', value: 3 },
                { label: '管理员', value: 2 },
              ]}
              style={{ width: '100%' }}
            />
          </div>
        )}

        {/* 底部按钮 */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button onClick={handleClose}>取消</Button>
          <Button
            type="primary"
            onClick={addMember}
            disabled={!selectedUser || adding}
            loading={adding}
          >
            添加成员
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// 转让空间模态组件
const TransferSpaceModal: React.FC<{
  isOpen: boolean;
  spaceId: string;
  members: SpaceMember[];
  onClose: () => void;
  onTransferred: () => void;
}> = ({ isOpen, spaceId, members, onClose, onTransferred }) => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [transferring, setTransferring] = useState(false);

  // 可选择的成员（排除当前用户）
  const availableMembers = members.filter(member => member.role !== 1);

  const handleTransfer = async () => {
    if (!selectedUser) return;

    setTransferring(true);
    try {
      const response = await fetch(`/api/space/${spaceId}/transfer`, {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Agw-Js-Conv': 'str',
          'x-requested-with': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          new_owner_id: selectedUser,
        }),
      });

      const data = await response.json();
      if (data.code === 0) {
        onTransferred();
        handleClose();
      } else {
        console.error('转让空间失败:', data.msg);
      }
    } catch (error: any) {
      console.error('转让空间失败:', error);
      if (error.code === '200' || error.code === 200) {
        onTransferred();
        handleClose();
      }
    } finally {
      setTransferring(false);
    }
  };

  const handleClose = () => {
    setSelectedUser('');
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      title="转让空间"
      onCancel={handleClose}
      width={480}
      footer={null}
    >
      <div className="space-y-4">
        <div className="text-gray-600">
          转让后，您将成为管理员，新的所有者将获得空间的完全控制权。
        </div>

        <div>
          <Typography.Text strong className="block mb-2">
            选择新的所有者
          </Typography.Text>
          <Select
            value={selectedUser}
            onChange={value => setSelectedUser(value as string)}
            placeholder="请选择一个成员"
            optionList={availableMembers.map(member => ({
              label: `${member.nickname || member.username} - ${ROLE_TYPES[member.role as keyof typeof ROLE_TYPES]?.name}`,
              value: member.user_id,
            }))}
            style={{ width: '100%' }}
          />
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button onClick={handleClose}>取消</Button>
          <Button
            type="primary"
            onClick={handleTransfer}
            disabled={!selectedUser || transferring}
            loading={transferring}
            theme="solid"
          >
            确认转让
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// 空间信息编辑组件
const SpaceInfoEditor: React.FC<{
  spaceId: string;
  onSpaceUpdated: () => void;
}> = ({ spaceId, onSpaceUpdated }) => {
  const [spaceInfo, setSpaceInfo] = useState<{
    name: string;
    description: string;
    iconUrl: string;
  }>({
    name: '',
    description: '',
    iconUrl: '',
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    name: string;
    description: string;
  }>({
    name: '',
    description: '',
  });

  // 获取空间详情
  const fetchSpaceInfo = async () => {
    try {
      const response = await fetch(`/api/space/${spaceId}`, {
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Agw-Js-Conv': 'str',
          'x-requested-with': 'XMLHttpRequest',
        },
      });

      const data = await response.json();
      if (data.code === 0 && data.data) {
        const info = {
          name: data.data.name || '',
          description: data.data.description || '',
          iconUrl: data.data.icon_url || '',
        };
        setSpaceInfo(info);
        setEditFormData({
          name: info.name,
          description: info.description,
        });
      }
    } catch (error: any) {
      console.error('获取空间信息失败:', error);
      if (error.code === '200' || error.code === 200) {
        const responseData = error.response?.data;
        if (responseData && responseData.data) {
          const info = {
            name: responseData.data.name || '',
            description: responseData.data.description || '',
            iconUrl: responseData.data.icon_url || '',
          };
          setSpaceInfo(info);
          setEditFormData({
            name: info.name,
            description: info.description,
          });
        }
      }
    }
  };

  // 保存空间信息
  const handleSave = async () => {
    if (!editFormData.name.trim()) {
      Toast.error('空间名称不能为空');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/space/${spaceId}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Agw-Js-Conv': 'str',
          'x-requested-with': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          name: editFormData.name,
          description: editFormData.description,
          // 暂时不更新 icon_url，避免数据库字段长度限制问题
        }),
      });

      const data = await response.json();
      if (data.code === 0) {
        setIsModalVisible(false);
        // 重新获取空间信息
        await fetchSpaceInfo();
        onSpaceUpdated();
        Toast.success('空间信息更新成功');
      } else {
        console.error('更新空间信息失败:', data.msg);
        Toast.error(data.msg || '更新失败');
      }
    } catch (error: any) {
      console.error('更新空间信息失败:', error);
      if (error.code === '200' || error.code === 200) {
        setIsModalVisible(false);
        // 重新获取空间信息
        await fetchSpaceInfo();
        onSpaceUpdated();
        Toast.success('空间信息更新成功');
      } else {
        Toast.error('更新空间信息失败');
      }
    } finally {
      setSaving(false);
    }
  };

  // 打开编辑弹框
  const handleEditClick = () => {
    setEditFormData({
      name: spaceInfo.name,
      description: spaceInfo.description,
    });
    setIsModalVisible(true);
  };

  // 关闭弹框
  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditFormData({
      name: spaceInfo.name,
      description: spaceInfo.description,
    });
  };

  useEffect(() => {
    if (spaceId) {
      fetchSpaceInfo();
    }
  }, [spaceId]);

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                空间信息
              </h3>
              <p className="text-sm text-gray-500 mb-0">修改空间的基本信息</p>
            </div>
            <div className="ml-6 flex-shrink-0">
              <button
                onClick={handleEditClick}
                className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                编辑
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 编辑弹框 */}
      <Modal
        title="编辑空间信息"
        visible={isModalVisible}
        onOk={handleSave}
        onCancel={handleModalClose}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              空间名称 <span className="text-red-500">*</span>
            </label>
            <Input
              value={editFormData.name}
              onChange={value =>
                setEditFormData({ ...editFormData, name: value })
              }
              placeholder="请输入空间名称"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              空间描述
            </label>
            <Input
              value={editFormData.description}
              onChange={value =>
                setEditFormData({ ...editFormData, description: value })
              }
              placeholder="请输入空间描述（可选）"
              maxLength={200}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

// 删除空间模态组件
const DeleteSpaceModal: React.FC<{
  isOpen: boolean;
  spaceId: string;
  onClose: () => void;
  onDeleted: () => void;
}> = ({ isOpen, spaceId, onClose, onDeleted }) => {
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== '删除空间') return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/space/${spaceId}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Agw-Js-Conv': 'str',
          'x-requested-with': 'XMLHttpRequest',
        },
      });

      const data = await response.json();
      if (data.code === 0) {
        onDeleted();
        handleClose();
      } else {
        console.error('删除空间失败:', data.msg);
      }
    } catch (error: any) {
      console.error('删除空间失败:', error);
      if (error.code === '200' || error.code === 200) {
        onDeleted();
        handleClose();
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      title="删除空间"
      onCancel={handleClose}
      width={480}
      footer={null}
    >
      <div className="space-y-4">
        <div className="text-red-600">
          <div className="font-semibold mb-2">⚠️ 警告</div>
          <div>
            删除空间将永久删除所有相关数据，包括成员、应用和工作流，此操作不可恢复。
          </div>
        </div>

        <div>
          <Typography.Text strong className="block mb-2">
            请输入 "删除空间" 来确认
          </Typography.Text>
          <Input
            value={confirmText}
            onChange={value => setConfirmText(value)}
            placeholder="删除空间"
          />
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button onClick={handleClose}>取消</Button>
          <Button
            type="primary"
            onClick={handleDelete}
            disabled={confirmText !== '删除空间' || deleting}
            loading={deleting}
            theme="solid"
            style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
          >
            确认删除
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// 主组件
const Page: React.FC = () => {
  const { space_id } = useParams<{ space_id: string }>();
  const navigate = useNavigate();
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<number>(0); // 0: 全部, 1: 所有者, 2: 管理员, 3: 成员
  const [activeTab, setActiveTab] = useState('members'); // 'members' 或 'settings'
  const [userPermissions, setUserPermissions] = useState({
    canInvite: false,
    canManage: false,
    roleType: 3,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // 检查用户权限
  const checkPermissions = useCallback(async () => {
    if (!space_id) return;

    try {
      const response = await fetch(`/api/space/${space_id}/permission`, {
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Agw-Js-Conv': 'str',
          'x-requested-with': 'XMLHttpRequest',
        },
      });

      const data = await response.json();
      if (data.code === 0) {
        setUserPermissions({
          canInvite: data.data.can_invite,
          canManage: data.data.can_manage,
          roleType: data.data.role_type,
        });
      }
    } catch (error) {
      console.error('检查权限失败:', error);
    }
  }, [space_id]);

  // 处理转让成功
  const handleTransferSuccess = useCallback(() => {
    // 转让成功后重新获取成员列表和权限
    checkPermissions();
    fetchMembers(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

  // 处理删除成功
  const handleDeleteSuccess = useCallback(() => {
    // 删除成功后跳转回空间列表或首页
    navigate('/');
  }, [navigate]);

  // 获取成员列表
  const fetchMembers = useCallback(
    async (page = 1, pageSize = 20) => {
      if (!space_id) return;

      setLoading(true);
      try {
        const response = await fetch(
          `/api/space/${space_id}/members?page=${page}&page_size=${pageSize}`,
          {
            headers: {
              Accept: 'application/json, text/plain, */*',
              'Content-Type': 'application/json',
              'Agw-Js-Conv': 'str',
              'x-requested-with': 'XMLHttpRequest',
            },
          },
        );

        const data = await response.json();
        if (data.code === 0) {
          // 按角色排序：Owner(1) > Admin(2) > Member(3)
          const sortedMembers = (data.data || []).sort(
            (a: SpaceMember, b: SpaceMember) => a.role - b.role,
          );
          setMembers(sortedMembers);

          // 更新分页信息
          setPagination(prev => ({
            ...prev,
            current: page,
            total: data.total || sortedMembers.length,
          }));
        } else {
          console.error('获取成员列表失败:', data.msg);
        }
      } catch (error: any) {
        console.error('获取成员列表失败:', error);
        // 处理特殊的成功响应被当作错误的情况
        if (error.code === '200' || error.code === 200) {
          const responseData = error.response?.data;
          if (responseData && responseData.data) {
            const sortedMembers = responseData.data.sort(
              (a: SpaceMember, b: SpaceMember) => a.role - b.role,
            );
            setMembers(sortedMembers);
            setPagination(prev => ({
              ...prev,
              current: page,
              total: responseData.total || sortedMembers.length,
            }));
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [space_id],
  );

  // 移除成员
  const removeMember = async (userId: string, userName: string) => {
    if (!space_id) return;

    try {
      const response = await fetch(`/api/space/${space_id}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Agw-Js-Conv': 'str',
          'x-requested-with': 'XMLHttpRequest',
        },
      });

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        if (data.code === 0) {
          fetchMembers(pagination.current, pagination.pageSize); // 重新加载列表
        } else {
          console.error(`移除成员失败: ${data.msg}`);
        }
      } catch (error) {
        console.error('API返回格式错误:', text);
        if (response.ok) {
          fetchMembers(pagination.current, pagination.pageSize); // 如果HTTP状态是成功的，仍然刷新列表
        }
      }
    } catch (error: any) {
      console.error('移除成员失败:', error);
      if (error.code === '200' || error.code === 200) {
        fetchMembers(pagination.current, pagination.pageSize); // 重新加载列表
      }
    }
  };

  // 更新成员角色
  const updateMemberRole = async (
    userId: string,
    currentRole: number,
    userName: string,
  ) => {
    const newRole = currentRole === 2 ? 3 : 2; // 在管理员和成员间切换

    if (!space_id) return;

    try {
      const response = await fetch(`/api/space/${space_id}/members/${userId}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Agw-Js-Conv': 'str',
          'x-requested-with': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          role: newRole,
        }),
      });

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        if (data.code === 0) {
          fetchMembers(pagination.current, pagination.pageSize); // 重新加载列表
        } else {
          console.error(`更新角色失败: ${data.msg}`);
        }
      } catch (error) {
        console.error('API返回格式错误:', text);
        if (response.ok) {
          fetchMembers(pagination.current, pagination.pageSize); // 如果HTTP状态是成功的，仍然刷新列表
        }
      }
    } catch (error: any) {
      console.error('更新角色失败:', error);
      if (error.code === '200' || error.code === 200) {
        fetchMembers(pagination.current, pagination.pageSize); // 重新加载列表
      }
    }
  };

  // 过滤后的成员列表
  const filteredMembers = useMemo(() => {
    let filtered = members;

    // 角色过滤
    if (roleFilter > 0) {
      filtered = filtered.filter(member => member.role === roleFilter);
    }

    // 搜索过滤
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        member =>
          (member.nickname || member.username)
            .toLowerCase()
            .includes(keyword) ||
          member.username.toLowerCase().includes(keyword),
      );
    }

    return filtered;
  }, [members, roleFilter, searchKeyword]);

  // Table列配置
  const columns = useMemo(
    () => [
      {
        title: '成员',
        dataIndex: 'user_info',
        key: 'user_info',
        render: (_: any, record: SpaceMember) => (
          <div className="flex items-center space-x-3">
            <Avatar size="small" src={record.avatar_url}>
              {(record.nickname || record.username).charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <div className="font-medium text-gray-900">
                {record.nickname || record.username}
              </div>
              <div className="text-sm text-gray-500">@{record.username}</div>
            </div>
          </div>
        ),
      },
      {
        title: '角色',
        dataIndex: 'role',
        key: 'role',
        width: 120,
        render: (role: number) => (
          <Tag color={role === 1 ? 'red' : role === 2 ? 'blue' : 'grey'}>
            {ROLE_TYPES[role as keyof typeof ROLE_TYPES]?.name || '未知角色'}
          </Tag>
        ),
      },
      {
        title: '加入时间',
        dataIndex: 'joined_at',
        key: 'joined_at',
        width: 120,
        render: (joinedAt: number) => (
          <span className="text-sm text-gray-500">
            {new Date(joinedAt * 1000).toLocaleDateString()}
          </span>
        ),
      },
      {
        title: '操作',
        key: 'actions',
        width: 160,
        render: (_: any, record: SpaceMember) => (
          <Space>
            {userPermissions.canManage && record.role !== 1 && (
              <>
                <Popconfirm
                  title={`确定要将 "${record.nickname || record.username}" 的角色更改为 "${record.role === 2 ? '成员' : '管理员'}" 吗？`}
                  onConfirm={e => {
                    e?.stopPropagation();
                    updateMemberRole(
                      record.user_id,
                      record.role,
                      record.nickname || record.username,
                    );
                  }}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button
                    size="small"
                    theme="borderless"
                    onClick={e => e.stopPropagation()}
                  >
                    {record.role === 2 ? '设为成员' : '设为管理员'}
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title={`确定要移除成员 "${record.nickname || record.username}" 吗？`}
                  onConfirm={e => {
                    e?.stopPropagation();
                    removeMember(
                      record.user_id,
                      record.nickname || record.username,
                    );
                  }}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button
                    size="small"
                    theme="borderless"
                    onClick={e => e.stopPropagation()}
                  >
                    移除
                  </Button>
                </Popconfirm>
              </>
            )}
          </Space>
        ),
      },
    ],
    [userPermissions, updateMemberRole, removeMember],
  );

  // 角色过滤选项
  const roleFilterOptions = [
    { label: '全部角色', value: 0 },
    { label: '所有者', value: 1 },
    { label: '管理员', value: 2 },
    { label: '成员', value: 3 },
  ];

  useEffect(() => {
    if (space_id) {
      checkPermissions();
      fetchMembers(1, 20);
    }
  }, [space_id, checkPermissions]);

  if (!space_id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">无效的空间ID</div>
      </div>
    );
  }

  return (
    <Layout title="猎鹰">
      <Layout.Header className="pb-0">
        <div className="w-full">
          {/* 页面标题 */}
          <div className="font-[500] text-[20px] mb-[16px]">空间管理</div>

          {/* Tab导航 - 完整分割线设计 */}
          <div className="relative mb-4">
            {/* 完整的灰色分割线 */}
            <div className="w-full h-px bg-gray-200 absolute bottom-0"></div>

            <div className="flex">
              <button
                onClick={() => {
                  console.log('Clicking members tab');
                  setActiveTab('members');
                }}
                className={`relative pb-3 mr-8 text-sm font-medium transition-colors bg-transparent border-0 outline-none cursor-pointer ${
                  activeTab === 'members'
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0 0 12px 0',
                  margin: '0 32px 0 0',
                  outline: 'none',
                  boxShadow: 'none',
                }}
              >
                成员管理
                {activeTab === 'members' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 z-10"></div>
                )}
              </button>
              <button
                onClick={() => {
                  console.log('Clicking settings tab');
                  setActiveTab('settings');
                }}
                className={`relative pb-3 text-sm font-medium transition-colors bg-transparent border-0 outline-none cursor-pointer ${
                  activeTab === 'settings'
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0 0 12px 0',
                  margin: 0,
                  outline: 'none',
                  boxShadow: 'none',
                }}
              >
                空间设置
                {activeTab === 'settings' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 z-10"></div>
                )}
              </button>
            </div>
          </div>
        </div>
      </Layout.Header>

      <Layout.Content>
        <div className="h-full flex flex-col">
          {activeTab === 'members' ? (
            <>
              {/* 成员管理内容 */}
              <div className="mb-4 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Select
                      showClear={false}
                      value={roleFilter}
                      optionList={roleFilterOptions}
                      onChange={v => setRoleFilter(v as number)}
                      style={{ minWidth: 128 }}
                      placeholder="选择角色"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Search
                      showClear={true}
                      width={200}
                      loading={loading}
                      placeholder="搜索成员..."
                      value={searchKeyword}
                      onSearch={v => setSearchKeyword(v as string)}
                    />
                    {userPermissions.canInvite && (
                      <Button
                        theme="solid"
                        type="primary"
                        icon={<IconCozPlus />}
                        onClick={() => setShowAddModal(true)}
                      >
                        添加成员
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Table容器 - 设置固定高度和滚动 */}
              <div className="flex-1 min-h-0">
                <Table
                  tableProps={{
                    loading: loading,
                    dataSource: filteredMembers,
                    columns: columns,
                    rowKey: 'user_id',
                    scroll: { y: 'calc(100vh - 320px)' },
                    pagination: {
                      pageSize: pagination.pageSize,
                      total: pagination.total,
                    },
                    empty: (
                      <div className="text-center py-8">
                        <div className="text-gray-500">
                          {members.length === 0 ? '暂无成员' : '没有找到匹配的成员'}
                        </div>
                      </div>
                    ),
                  }}
                />
              </div>
            </>
          ) : (
            <>
              {/* 空间设置内容 */}
              <div className="space-y-4 max-w-2xl">
              {/* 空间信息编辑 */}
              <SpaceInfoEditor
                spaceId={space_id}
                onSpaceUpdated={() => {
                  // 可选：空间更新后的回调
                  console.log('空间信息已更新');
                }}
              />

              {/* 转让空间 */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        转让空间
                      </h3>
                      <p className="text-sm text-gray-500 mb-0">
                        将空间所有权转让给其他成员
                      </p>
                      {userPermissions.roleType !== 1 && (
                        <p className="text-xs text-gray-400 mt-2">
                          只有空间所有者可以转让空间
                        </p>
                      )}
                    </div>
                    <div className="ml-6 flex-shrink-0">
                      <button
                        onClick={() => setShowTransferModal(true)}
                        disabled={userPermissions.roleType !== 1}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          userPermissions.roleType === 1
                            ? 'bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        转让空间
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 删除空间 */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        删除空间
                      </h3>
                      <p className="text-sm text-gray-500 mb-0">
                        空间删除后所有资产无法找回，请慎重操作
                      </p>
                      {userPermissions.roleType !== 1 && (
                        <p className="text-xs text-gray-400 mt-2">
                          只有空间所有者可以删除空间
                        </p>
                      )}
                    </div>
                    <div className="ml-6 flex-shrink-0">
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        disabled={userPermissions.roleType !== 1}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          userPermissions.roleType === 1
                            ? 'bg-white hover:bg-red-50 text-red-600 border border-red-300 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                            : 'bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed'
                        }`}
                      >
                        删除空间
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        </div>
      </Layout.Content>

      {/* 添加成员弹窗 */}
      <AddMemberModal
        isOpen={showAddModal}
        spaceId={space_id}
        onClose={() => setShowAddModal(false)}
        onMemberAdded={() =>
          fetchMembers(pagination.current, pagination.pageSize)
        }
      />

      {/* 转让空间弹窗 */}
      <TransferSpaceModal
        isOpen={showTransferModal}
        spaceId={space_id}
        members={members}
        onClose={() => setShowTransferModal(false)}
        onTransferred={handleTransferSuccess}
      />

      {/* 删除空间弹窗 */}
      <DeleteSpaceModal
        isOpen={showDeleteModal}
        spaceId={space_id}
        onClose={() => setShowDeleteModal(false)}
        onDeleted={handleDeleteSuccess}
      />
    </Layout>
  );
};

export default Page;

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
import { useParams } from 'react-router-dom';
import {
  Layout,
  Table,
  Button,
  Modal,
  Select,
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

        if (response.ok) {
          const result = await response.json();
          if (result.code === 200 || result.code === '200') {
            setSearchResults(result.data || []);
          } else {
            Toast.error(`搜索失败: ${result.msg || '未知错误'}`);
            setSearchResults([]);
          }
        } else {
          Toast.error('搜索用户失败');
        }
      } catch (error) {
        console.error('搜索用户错误:', error);
        Toast.error('搜索用户失败');
      } finally {
        setSearching(false);
      }
    },
    [spaceId],
  );

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchKeyword);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchKeyword, searchUsers]);

  // 添加成员
  const handleAddMember = async () => {
    if (!selectedUser) {
      Toast.warning('请先选择要添加的成员');
      return;
    }

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

      const result = await response.json();
      if (response.ok && (result.code === 200 || result.code === '200')) {
        Toast.success('成员添加成功');
        onMemberAdded();
        handleClose();
      } else {
        Toast.error(`添加失败: ${result.msg || '未知错误'}`);
      }
    } catch (error) {
      console.error('添加成员错误:', error);
      Toast.error('添加成员失败');
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

  return (
    <Modal
      title="添加成员"
      visible={isOpen}
      onCancel={handleClose}
      onOk={handleAddMember}
      okText="添加"
      cancelText="取消"
      confirmLoading={adding}
      width={600}
    >
      <div className="space-y-4">
        <div>
          <Typography.Text className="mb-2 block">搜索用户</Typography.Text>
          <Search
            placeholder="输入用户名或邮箱搜索"
            value={searchKeyword}
            onChange={(value) => setSearchKeyword(value)}
            loading={searching}
          />
        </div>

        {searchResults.length > 0 && (
          <div className="max-h-[200px] overflow-y-auto border rounded-lg">
            {searchResults.map((user) => (
              <div
                key={user.user_id}
                className={classNames(
                  'flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0',
                  {
                    'bg-blue-50': selectedUser?.user_id === user.user_id,
                  },
                )}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center gap-3">
                  <Avatar src={user.avatar_url} size="small">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">@{user.unique_name}</div>
                  </div>
                </div>
                {selectedUser?.user_id === user.user_id && (
                  <Tag color="blue">已选择</Tag>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedUser && (
          <div>
            <Typography.Text className="mb-2 block">分配角色</Typography.Text>
            <Select
              value={selectedRole}
              onChange={(value) => setSelectedRole(value)}
              style={{ width: '100%' }}
            >
              <Select.Option value={2}>管理员</Select.Option>
              <Select.Option value={3}>成员</Select.Option>
            </Select>
          </div>
        )}
      </div>
    </Modal>
  );
};

const MembersPage: React.FC = () => {
  const { space_id } = useParams<{ space_id: string }>();
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<SpaceMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserRole, setCurrentUserRole] = useState<number>(3);
  const [refreshKey, setRefreshKey] = useState(0);

  // 获取成员列表
  const fetchMembers = useCallback(async () => {
    if (!space_id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/space/${space_id}/members`, {
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Agw-Js-Conv': 'str',
          'x-requested-with': 'XMLHttpRequest',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.code === 200 || result.code === '200') {
          const membersList = result.data || [];
          setMembers(membersList);
          setFilteredMembers(membersList);

          // 获取当前用户信息
          const userResponse = await fetch('/api/user/info', {
            headers: {
              Accept: 'application/json, text/plain, */*',
              'Content-Type': 'application/json',
              'Agw-Js-Conv': 'str',
              'x-requested-with': 'XMLHttpRequest',
            },
          });

          if (userResponse.ok) {
            const userResult = await userResponse.json();
            if (userResult.code === 200 || userResult.code === '200') {
              const userId = userResult.data?.user_id;
              setCurrentUserId(userId);
              
              // 找到当前用户在空间中的角色
              const currentMember = membersList.find((m: SpaceMember) => m.user_id === userId);
              if (currentMember) {
                setCurrentUserRole(currentMember.role);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('获取成员列表失败:', error);
      Toast.error('获取成员列表失败');
    } finally {
      setLoading(false);
    }
  }, [space_id]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers, refreshKey]);

  // 搜索过滤
  useEffect(() => {
    if (!searchKeyword) {
      setFilteredMembers(members);
    } else {
      const keyword = searchKeyword.toLowerCase();
      const filtered = members.filter(
        (member) =>
          member.username?.toLowerCase().includes(keyword) ||
          member.nickname?.toLowerCase().includes(keyword),
      );
      setFilteredMembers(filtered);
    }
  }, [searchKeyword, members]);

  // 角色过滤
  useEffect(() => {
    if (selectedRole === null) {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter((member) => member.role === selectedRole);
      setFilteredMembers(filtered);
    }
  }, [selectedRole, members]);

  // 更新成员角色
  const handleUpdateRole = async (userId: string, newRole: number) => {
    try {
      const response = await fetch(`/api/space/${space_id}/members/${userId}/role`, {
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

      const result = await response.json();
      if (response.ok && (result.code === 200 || result.code === '200')) {
        Toast.success('角色更新成功');
        setRefreshKey((prev) => prev + 1);
      } else {
        Toast.error(`更新失败: ${result.msg || '未知错误'}`);
      }
    } catch (error) {
      console.error('更新角色失败:', error);
      Toast.error('更新角色失败');
    }
  };

  // 移除成员
  const handleRemoveMember = async (userId: string) => {
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

      const result = await response.json();
      if (response.ok && (result.code === 200 || result.code === '200')) {
        Toast.success('成员已移除');
        setRefreshKey((prev) => prev + 1);
      } else {
        Toast.error(`移除失败: ${result.msg || '未知错误'}`);
      }
    } catch (error) {
      console.error('移除成员失败:', error);
      Toast.error('移除成员失败');
    }
  };

  const columns = useMemo(
    () => [
      {
        title: '成员',
        dataIndex: 'username',
        key: 'username',
        render: (text: string, record: SpaceMember) => (
          <div className="flex items-center gap-3">
            <Avatar src={record.avatar_url} size="small">
              {(record.nickname || record.username)?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <div>
              <div className="font-medium">{record.nickname || record.username}</div>
              <div className="text-sm text-gray-500">@{record.username}</div>
            </div>
          </div>
        ),
      },
      {
        title: '角色',
        dataIndex: 'role',
        key: 'role',
        width: 150,
        render: (role: number, record: SpaceMember) => {
          const roleInfo = ROLE_TYPES[role as keyof typeof ROLE_TYPES];
          const canEdit = currentUserRole <= 2 && record.user_id !== currentUserId && role !== 1;

          if (!canEdit) {
            return (
              <Tag className={roleInfo?.color}>
                {roleInfo?.name || '未知角色'}
              </Tag>
            );
          }

          return (
            <Select
              value={role}
              onChange={(value) => handleUpdateRole(record.user_id, value)}
              size="small"
              style={{ width: 120 }}
            >
              <Select.Option value={2}>管理员</Select.Option>
              <Select.Option value={3}>成员</Select.Option>
            </Select>
          );
        },
      },
      {
        title: '加入时间',
        dataIndex: 'joined_at',
        key: 'joined_at',
        width: 180,
        render: (timestamp: number) => {
          if (!timestamp) return '-';
          return new Date(timestamp * 1000).toLocaleString('zh-CN');
        },
      },
      {
        title: '最后活跃',
        dataIndex: 'last_active_at',
        key: 'last_active_at',
        width: 180,
        render: (timestamp: number) => {
          if (!timestamp) return '暂无活动';
          return new Date(timestamp * 1000).toLocaleString('zh-CN');
        },
      },
      {
        title: '操作',
        key: 'action',
        width: 100,
        render: (_text: unknown, record: SpaceMember) => {
          // 不能移除自己和所有者
          if (record.user_id === currentUserId || record.role === 1) {
            return null;
          }

          // 只有管理员和所有者可以移除成员
          if (currentUserRole > 2) {
            return null;
          }

          return (
            <Popconfirm
              title="确定要移除该成员吗？"
              onConfirm={() => handleRemoveMember(record.user_id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="text" danger size="small">
                移除
              </Button>
            </Popconfirm>
          );
        },
      },
    ],
    [currentUserId, currentUserRole, space_id],
  );

  // 统计信息
  const stats = useMemo(() => {
    const owners = members.filter((m) => m.role === 1).length;
    const admins = members.filter((m) => m.role === 2).length;
    const normalMembers = members.filter((m) => m.role === 3).length;
    return {
      total: members.length,
      owners,
      admins,
      members: normalMembers,
    };
  }, [members]);

  return (
    <Layout className="h-full">
      <Layout.Header className="pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IconCozPeople className="text-2xl" />
            <Typography.Title heading={3}>成员管理</Typography.Title>
          </div>
          {currentUserRole <= 2 && (
            <Button
              type="primary"
              icon={<IconCozPlus />}
              onClick={() => setIsAddModalOpen(true)}
            >
              添加成员
            </Button>
          )}
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-gray-500 text-sm mb-1">总成员</div>
            <div className="text-2xl font-semibold">{stats.total}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-gray-500 text-sm mb-1">所有者</div>
            <div className="text-2xl font-semibold text-red-600">{stats.owners}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-gray-500 text-sm mb-1">管理员</div>
            <div className="text-2xl font-semibold text-blue-600">{stats.admins}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-gray-500 text-sm mb-1">普通成员</div>
            <div className="text-2xl font-semibold text-gray-600">{stats.members}</div>
          </div>
        </div>

        {/* 搜索和过滤 */}
        <div className="flex items-center justify-between mb-4">
          <Search
            placeholder="搜索成员名称"
            value={searchKeyword}
            onChange={(value) => setSearchKeyword(value)}
            style={{ width: 300 }}
            prefix={<IconSearch />}
          />
          <Tabs
            activeKey={selectedRole?.toString() || 'all'}
            onChange={(key) => setSelectedRole(key === 'all' ? null : parseInt(key))}
          >
            <TabPane tab={`全部 (${stats.total})`} key="all" />
            <TabPane tab={`所有者 (${stats.owners})`} key="1" />
            <TabPane tab={`管理员 (${stats.admins})`} key="2" />
            <TabPane tab={`成员 (${stats.members})`} key="3" />
          </Tabs>
        </div>
      </Layout.Header>

      <Layout.Content>
        <Table
          columns={columns}
          dataSource={filteredMembers}
          loading={loading}
          rowKey="user_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Layout.Content>

      <AddMemberModal
        isOpen={isAddModalOpen}
        spaceId={space_id!}
        onClose={() => setIsAddModalOpen(false)}
        onMemberAdded={() => setRefreshKey((prev) => prev + 1)}
      />
    </Layout>
  );
};

export default MembersPage;
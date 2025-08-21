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
  Popconfirm
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
  const searchUsers = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/space/search-users?keyword=${encodeURIComponent(keyword)}&exclude_space_id=${spaceId}&limit=10`, {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Agw-Js-Conv': 'str',
          'x-requested-with': 'XMLHttpRequest'
        }
      });

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
  }, [spaceId]);

  // 添加成员
  const addMember = async () => {
    if (!selectedUser) return;

    setAdding(true);
    try {
      const response = await fetch(`/api/space/${spaceId}/members`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Agw-Js-Conv': 'str',
          'x-requested-with': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          user_ids: [selectedUser.user_id],
          role: selectedRole
        })
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
            onChange={(value) => setSearchKeyword(value)}
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
          {!searching && searchResults.map((user) => (
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
              onChange={(v) => setSelectedRole(v as number)}
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
          <Button onClick={handleClose}>
            取消
          </Button>
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

// 主组件
const SpaceMembersPage: React.FC = () => {
  const { space_id } = useParams<{ space_id: string }>();
  const navigate = useNavigate();
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<number>(0); // 0: 全部, 1: 所有者, 2: 管理员, 3: 成员
  const [userPermissions, setUserPermissions] = useState({
    canInvite: false,
    canManage: false,
    roleType: 3
  });

  // 检查用户权限
  const checkPermissions = useCallback(async () => {
    if (!space_id) return;

    try {
      const response = await fetch(`/api/space/${space_id}/permission`, {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Agw-Js-Conv': 'str',
          'x-requested-with': 'XMLHttpRequest'
        }
      });

      const data = await response.json();
      if (data.code === 0) {
        setUserPermissions({
          canInvite: data.data.can_invite,
          canManage: data.data.can_manage,
          roleType: data.data.role_type
        });
      }
    } catch (error) {
      console.error('检查权限失败:', error);
    }
  }, [space_id]);

  // 获取成员列表
  const fetchMembers = useCallback(async () => {
    if (!space_id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/space/${space_id}/members?page=1&page_size=100`, {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Agw-Js-Conv': 'str',
          'x-requested-with': 'XMLHttpRequest'
        }
      });

      const data = await response.json();
      if (data.code === 0) {
        setMembers(data.data || []);
      } else {
        console.error('获取成员列表失败:', data.msg);
      }
    } catch (error: any) {
      console.error('获取成员列表失败:', error);
      // 处理特殊的成功响应被当作错误的情况
      if (error.code === '200' || error.code === 200) {
        const responseData = error.response?.data;
        if (responseData && responseData.data) {
          setMembers(responseData.data);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [space_id]);

  // 移除成员
  const removeMember = async (userId: string, userName: string) => {
    if (!space_id) return;

    try {
      const response = await fetch(`/api/space/${space_id}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Agw-Js-Conv': 'str',
          'x-requested-with': 'XMLHttpRequest'
        }
      });

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        if (data.code === 0) {
          fetchMembers(); // 重新加载列表
        } else {
          console.error(`移除成员失败: ${data.msg}`);
        }
      } catch (error) {
        console.error('API返回格式错误:', text);
        if (response.ok) {
          fetchMembers(); // 如果HTTP状态是成功的，仍然刷新列表
        }
      }
    } catch (error: any) {
      console.error('移除成员失败:', error);
      if (error.code === '200' || error.code === 200) {
        fetchMembers(); // 重新加载列表
      }
    }
  };

  // 更新成员角色
  const updateMemberRole = async (userId: string, currentRole: number, userName: string) => {
    const newRole = currentRole === 2 ? 3 : 2; // 在管理员和成员间切换
    
    if (!space_id) return;

    try {
      const response = await fetch(`/api/space/${space_id}/members/${userId}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Agw-Js-Conv': 'str',
          'x-requested-with': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          role: newRole
        })
      });

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        if (data.code === 0) {
          fetchMembers(); // 重新加载列表
        } else {
          console.error(`更新角色失败: ${data.msg}`);
        }
      } catch (error) {
        console.error('API返回格式错误:', text);
        if (response.ok) {
          fetchMembers(); // 如果HTTP状态是成功的，仍然刷新列表
        }
      }
    } catch (error: any) {
      console.error('更新角色失败:', error);
      if (error.code === '200' || error.code === 200) {
        fetchMembers(); // 重新加载列表
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
      filtered = filtered.filter(member => 
        (member.nickname || member.username).toLowerCase().includes(keyword) ||
        member.username.toLowerCase().includes(keyword)
      );
    }
    
    return filtered;
  }, [members, roleFilter, searchKeyword]);

  // Table列配置
  const columns = useMemo(() => [
    {
      title: '成员',
      dataIndex: 'user_info',
      key: 'user_info',
      render: (_: any, record: SpaceMember) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            size="small"
            src={record.avatar_url}
          >
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
        <Tag color={
          role === 1 ? 'red' : 
          role === 2 ? 'blue' : 'default'
        }>
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
                onConfirm={(e) => {
                  e?.stopPropagation();
                  updateMemberRole(
                    record.user_id, 
                    record.role, 
                    record.nickname || record.username
                  );
                }}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  size="small"
                  theme="borderless"
                  onClick={(e) => e.stopPropagation()}
                >
                  {record.role === 2 ? '设为成员' : '设为管理员'}
                </Button>
              </Popconfirm>
              <Popconfirm
                title={`确定要移除成员 "${record.nickname || record.username}" 吗？`}
                onConfirm={(e) => {
                  e?.stopPropagation();
                  removeMember(
                    record.user_id, 
                    record.nickname || record.username
                  );
                }}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  size="small"
                  theme="borderless"
                  onClick={(e) => e.stopPropagation()}
                >
                  移除
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    }
  ], [userPermissions, updateMemberRole, removeMember]);

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
      fetchMembers();
    }
  }, [space_id, checkPermissions, fetchMembers]);

  if (!space_id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">无效的空间ID</div>
      </div>
    );
  }

  return (
    <Layout>
      <Layout.Header className="pb-0">
        <div className="w-full">
          {/* 页面标题和操作 */}
          <div className="flex items-center justify-between mb-[16px]">
            <div className="font-[500] text-[20px]">
              成员管理
            </div>
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
          
          {/* 过滤控件 */}
          <div className="flex items-center justify-between">
            <Space>
              <Select
                showClear={false}
                value={roleFilter}
                optionList={roleFilterOptions}
                onChange={(v) => setRoleFilter(v as number)}
                style={{ minWidth: 128 }}
                placeholder="选择角色"
              />
            </Space>
            <Search
              showClear={true}
              width={200}
              loading={loading}
              placeholder="搜索成员..."
              value={searchKeyword}
              onSearch={(v) => setSearchKeyword(v)}
            />
          </div>
        </div>
      </Layout.Header>
      
      <Layout.Content>
        <Table
          tableProps={{
            loading: loading,
            dataSource: filteredMembers,
            columns: columns,
            rowKey: "user_id",
            pagination: false,
            empty: (
              <div className="text-center py-8">
                <div className="text-gray-500">
                  {members.length === 0 ? '暂无成员' : '没有找到匹配的成员'}
                </div>
              </div>
            )
          }}
        />
      </Layout.Content>

      {/* 添加成员弹窗 */}
      <AddMemberModal
        isOpen={showAddModal}
        spaceId={space_id}
        onClose={() => setShowAddModal(false)}
        onMemberAdded={fetchMembers}
      />
    </Layout>
  );
};

export default SpaceMembersPage;
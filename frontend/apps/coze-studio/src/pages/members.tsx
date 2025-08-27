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
  Toast,
  Spin,
} from '@coze-arch/coze-design';
import { IconCozPlus, IconCozPeople } from '@coze-arch/coze-design/icons';

// 类型定义
interface SpaceMember {
  user_id: string;
  user_name: string;
  name?: string;
  icon_url?: string;
  space_role_type: number;
  join_date?: string;
}

interface SpacePermission {
  space_role_type: number;
  can_manage_members: boolean;
}

interface MembersResponse {
  code: number;
  msg: string;
  data: SpaceMember[];  // 直接是数组
  total: number;
  page: number;
  page_size: number;
}

// 角色类型映射 - 根据实际API返回调整
const ROLE_TYPES: Record<number, { name: string; color: string }> = {
  1: { name: '所有者', color: 'red' },    // Owner
  2: { name: '管理员', color: 'orange' }, // Admin  
  3: { name: '成员', color: 'default' }   // Member
};

const MembersPage: React.FC = () => {
  const { space_id } = useParams<{ space_id: string }>();
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [currentUserRole, setCurrentUserRole] = useState<number>(3);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<number>(3);

  // 获取空间权限
  const fetchPermission = useCallback(async () => {
    if (!space_id) return;
    
    try {
      const response = await fetch(`/api/space/${space_id}/permission`, {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Agw-Js-Conv': 'str',
          'x-requested-with': 'XMLHttpRequest',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Permission API response:', result); // 调试用
        if (result.code === 0 && result.data) {
          setCurrentUserRole(result.data.space_role_type || 3);
        }
      }
    } catch (error) {
      console.error('获取权限失败:', error);
    }
  }, [space_id]);

  // 获取成员列表
  const fetchMembers = useCallback(async () => {
    if (!space_id) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/space/${space_id}/members?page=${currentPage}&page_size=${pageSize}`,
        {
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Agw-Js-Conv': 'str',
            'x-requested-with': 'XMLHttpRequest',
          },
        }
      );

      if (response.ok) {
        const result: MembersResponse = await response.json();
        console.log('Members API response:', result); // 调试用
        console.log('Members list:', result.data); // 查看成员列表
        console.log('First member:', result.data?.[0]); // 查看第一个成员的结构
        console.log('Total:', result.total); // 查看总数
        
        if (result.code === 0 && result.data) {
          const membersList = result.data || [];
          console.log('Setting members:', membersList);
          setMembers(membersList);
          setTotal(result.total || 0);
          // 从权限接口获取当前用户角色，不从这里获取
        } else {
          console.error('API返回错误:', result);
          Toast.error(`获取成员列表失败: ${result.msg || '未知错误'}`);
        }
      } else {
        Toast.error('获取成员列表失败');
      }
    } catch (error) {
      console.error('获取成员列表失败:', error);
      Toast.error('获取成员列表失败');
    } finally {
      setLoading(false);
    }
  }, [space_id, currentPage, pageSize]);

  useEffect(() => {
    fetchPermission();
  }, [fetchPermission]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // 添加成员
  const handleAddMember = async () => {
    if (!selectedUserId) {
      Toast.warning('请输入要添加的用户ID');
      return;
    }

    setAddMemberLoading(true);
    try {
      const response = await fetch(`/api/space/${space_id}/members/add`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Agw-Js-Conv': 'str',
          'x-requested-with': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          member_info_list: [{
            user_id: selectedUserId,
            space_role_type: selectedRole,
          }],
        }),
      });

      const result = await response.json();
      if (response.ok && result.code === 0) {
        Toast.success('成员添加成功');
        setIsAddModalOpen(false);
        setSelectedUserId('');
        setSelectedRole(3);
        fetchMembers();
      } else {
        Toast.error(`添加失败: ${result.msg || '未知错误'}`);
      }
    } catch (error) {
      console.error('添加成员错误:', error);
      Toast.error('添加成员失败');
    } finally {
      setAddMemberLoading(false);
    }
  };

  // 更新成员角色
  const handleUpdateRole = useCallback(async (userId: string, newRole: number) => {
    try {
      const response = await fetch(`/api/space/${space_id}/members/update`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Agw-Js-Conv': 'str',
          'x-requested-with': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          user_id: userId,
          space_role_type: newRole,
        }),
      });

      const result = await response.json();
      if (response.ok && result.code === 0) {
        Toast.success('角色更新成功');
        fetchMembers();
      } else {
        Toast.error(`更新失败: ${result.msg || '未知错误'}`);
      }
    } catch (error) {
      console.error('更新角色失败:', error);
      Toast.error('更新角色失败');
    }
  }, [space_id, fetchMembers]);

  // 移除成员
  const handleRemoveMember = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/space/${space_id}/members/remove`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Agw-Js-Conv': 'str',
          'x-requested-with': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          remove_user_id: userId,
        }),
      });

      const result = await response.json();
      if (response.ok && result.code === 0) {
        Toast.success('成员已移除');
        fetchMembers();
      } else {
        Toast.error(`移除失败: ${result.msg || '未知错误'}`);
      }
    } catch (error) {
      console.error('移除成员失败:', error);
      Toast.error('移除成员失败');
    }
  }, [space_id, fetchMembers]);

  const columns = useMemo(
    () => [
      {
        title: '成员',
        key: 'user',
        render: (record: SpaceMember) => (
          <div className="flex items-center gap-3">
            <Avatar 
              src={record.icon_url} 
              size="small"
              style={{ backgroundColor: '#1890ff' }}
            >
              {!record.icon_url && ((record.name || record.user_name)?.[0]?.toUpperCase() || 'U')}
            </Avatar>
            <div>
              <div className="font-medium">{record.name || record.user_name}</div>
              {record.user_name && (
                <div className="text-sm text-gray-500">@{record.user_name}</div>
              )}
            </div>
          </div>
        ),
      },
      {
        title: '角色',
        dataIndex: 'space_role_type',
        key: 'space_role_type',
        width: 150,
        align: 'center' as const,
        render: (role: number, record: SpaceMember) => {
          const roleInfo = ROLE_TYPES[role] || { name: `角色${role}`, color: 'default' };
          const isOwner = role === 1;
          const canEdit = currentUserRole === 1 && !isOwner; // 只有Owner可以编辑，且不能编辑Owner

          if (!canEdit) {
            return (
              <Tag color={roleInfo.color}>
                {roleInfo.name}
              </Tag>
            );
          }

          return (
            <Select
              value={role}
              onChange={(value) => handleUpdateRole(record.user_id, value)}
              size="small"
              style={{ width: 100 }}
            >
              <Select.Option value={2}>管理员</Select.Option>
              <Select.Option value={3}>成员</Select.Option>
            </Select>
          );
        },
      },
      {
        title: '加入时间',
        dataIndex: 'join_date',
        key: 'join_date',
        width: 180,
        align: 'center' as const,
        render: (date: string) => {
          if (!date) return '-';
          return date;
        },
      },
      {
        title: '操作',
        key: 'action',
        width: 100,
        align: 'center' as const,
        render: (_text: any, record: SpaceMember) => {
          // 只有Owner可以移除成员，且不能移除Owner
          if (currentUserRole !== 1 || record.space_role_type === 1) {
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
    [currentUserRole, handleUpdateRole, handleRemoveMember]
  );

  // 过滤成员
  const filteredMembers = useMemo(() => {
    console.log('Current members in state:', members);
    console.log('Members count:', members.length);
    
    if (!searchKeyword) return members;
    
    const keyword = searchKeyword.toLowerCase();
    return members.filter(
      (member) =>
        member.user_name?.toLowerCase().includes(keyword) ||
        member.name?.toLowerCase().includes(keyword)
    );
  }, [members, searchKeyword]);

  return (
    <Layout className="h-full bg-white">
      <Layout.Header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IconCozPeople className="text-2xl" />
            <Typography.Title heading={3}>成员管理</Typography.Title>
          </div>
          {currentUserRole === 1 && ( // 只有Owner可以添加成员
            <Button
              type="primary"
              icon={<IconCozPlus />}
              onClick={() => setIsAddModalOpen(true)}
            >
              添加成员
            </Button>
          )}
        </div>

        <div className="mb-4">
          <Search
            placeholder="搜索成员名称"
            value={searchKeyword}
            onChange={(value) => setSearchKeyword(value)}
            style={{ width: 300 }}
          />
        </div>
      </Layout.Header>

      <Layout.Content className="px-6 py-4">
        <div>Debug: 成员数量 = {filteredMembers.length}</div>
        <div>Debug: Loading = {loading ? 'true' : 'false'}</div>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredMembers}
            rowKey="user_id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size || 20);
              },
            }}
          />
        </Spin>
      </Layout.Content>

      <Modal
        title="添加成员"
        visible={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          setSelectedUserId('');
          setSelectedRole(3);
        }}
        onOk={handleAddMember}
        okText="添加"
        cancelText="取消"
        confirmLoading={addMemberLoading}
      >
        <div className="space-y-4">
          <div>
            <Typography.Text className="mb-2 block">用户ID</Typography.Text>
            <input
              type="text"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              placeholder="请输入要添加的用户ID"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
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
        </div>
      </Modal>
    </Layout>
  );
};

export default MembersPage;
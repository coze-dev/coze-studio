/* eslint-disable max-lines-per-function */
/* eslint-disable @coze-arch/max-line-per-function */
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

import { type FC, useState, useEffect, useCallback } from 'react';

import { SpaceApiV2 } from '@coze-arch/bot-space-api';
import { I18n } from '@coze-arch/i18n';
import {
  Table,
  Button,
  Modal,
  Search,
  Space,
  Select,
  Tag,
  Toast,
  Avatar,
  Tooltip,
  type ColumnProps,
  Typography,
} from '@coze-arch/coze-design';
import { IconCozPlus, IconCozPeople } from '@coze-arch/coze-design/icons';
import { formatDate } from '@coze-arch/bot-utils';
import { userStoreService } from '@coze-studio/user-store';
import { type MemberInfo, SpaceRoleType } from '@coze-arch/idl/playground_api';

import s from './members-management.module.less';

const { Text } = Typography;

interface MembersManagementProps {
  spaceId: string;
}

export const MembersManagement: FC<MembersManagementProps> = ({ spaceId }) => {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchWord, setSearchWord] = useState('');
  const [roleFilter, setRoleFilter] = useState<SpaceRoleType>(0);
  const [addMemberVisible, setAddMemberVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchMemberLoading, setSearchMemberLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<MemberInfo[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<SpaceRoleType>(
    SpaceRoleType.Member,
  );

  const currentUserId = userStoreService.useUserInfo()?.user_id_str;
  const pageSize = 10;

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await SpaceApiV2.SpaceMemberDetailV2({
        search_word: searchWord,
        space_role_type: roleFilter,
        page,
        size: pageSize,
      });

      if (resp.code === 0 && resp.data) {
        setMembers(resp.data.member_info_list || []);
        setTotal(resp.data.total || 0);
        setCurrentUserRole(resp.data.space_role_type || SpaceRoleType.Member);
      } else {
        Toast.error(resp.msg || I18n.t('failed_to_fetch_members'));
      }
    } catch (error) {
      Toast.error(I18n.t('failed_to_fetch_members'));
    } finally {
      setLoading(false);
    }
  }, [spaceId, page, searchWord, roleFilter]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleSearchMembers = async (value: string) => {
    if (!value) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchMemberLoading(true);
      const resp = await SpaceApiV2.SearchMemberV2({
        search_list: [value],
      });

      if (resp.code === 0) {
        // Don't filter, just set all results
        setSearchResults(resp.member_info_list || []);
        console.log('Search results:', resp.member_info_list);
      } else {
        Toast.error(resp.msg || I18n.t('failed_to_search_members'));
      }
    } catch (error) {
      Toast.error(I18n.t('failed_to_search_members'));
    } finally {
      setSearchMemberLoading(false);
    }
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) {
      Toast.warning(I18n.t('please_select_members_to_add'));
      return;
    }

    try {
      const memberInfoList = selectedMembers.map(userId => {
        const member = searchResults.find(m => m.user_id === userId);
        return {
          user_id: userId,
          space_role_type: SpaceRoleType.Member,
          icon_url: member?.icon_url || '',
          name: member?.name || '',
          join_date: '',
          user_name: member?.user_name || '',
        };
      });

      const resp = await SpaceApiV2.AddBotSpaceMemberV2({
        member_info_list: memberInfoList,
      });

      if (resp.code === 0) {
        Toast.success(I18n.t('members_added_successfully'));
        setAddMemberVisible(false);
        setSelectedMembers([]);
        setSearchResults([]);
        fetchMembers();
      } else {
        Toast.error(resp.msg || I18n.t('failed_to_add_members'));
      }
    } catch (error) {
      Toast.error(I18n.t('failed_to_add_members'));
    }
  };

  const handleRemoveMember = async (userId: string) => {
    Modal.confirm({
      title: I18n.t('member_remove_confirm_title'),
      content: I18n.t('member_remove_confirm_content'),
      okText: I18n.t('Confirm'),
      cancelText: I18n.t('Cancel'),
      okType: 'danger',
      onOk: async () => {
        try {
          const resp = await SpaceApiV2.RemoveSpaceMemberV2({
            remove_user_id: userId,
          });

          if (resp.code === 0) {
            Toast.success(I18n.t('member_removed_successfully'));
            fetchMembers();
          } else {
            Toast.error(resp.msg || I18n.t('failed_to_remove_member'));
          }
        } catch (error) {
          Toast.error(I18n.t('failed_to_remove_member'));
        }
      },
    });
  };

  const handleUpdateRole = async (userId: string, role: SpaceRoleType) => {
    try {
      const resp = await SpaceApiV2.UpdateSpaceMemberV2({
        user_id: userId,
        space_role_type: role,
      });

      if (resp.code === 0) {
        Toast.success(I18n.t('role_updated_successfully'));
        fetchMembers();
      } else {
        Toast.error(resp.msg || I18n.t('failed_to_update_role'));
      }
    } catch (error) {
      Toast.error(I18n.t('failed_to_update_role'));
    }
  };

  const getRoleTag = (role: SpaceRoleType) => {
    switch (role) {
      case SpaceRoleType.Owner:
        return <Tag color="red">{I18n.t('member_role_owner')}</Tag>;
      case SpaceRoleType.Admin:
        return <Tag color="orange">{I18n.t('member_role_admin')}</Tag>;
      case SpaceRoleType.Member:
        return <Tag>{I18n.t('member_role_member')}</Tag>;
      default:
        return <Tag>{I18n.t('member_role_member')}</Tag>;
    }
  };

  const columns: ColumnProps<MemberInfo>[] = [
    {
      title: I18n.t('member_column_user'),
      dataIndex: 'name',
      width: 300,
      render: (_text, record) => (
        <Space>
          <Avatar
            src={record.icon_url}
            size="small"
            style={{ backgroundColor: '#1890ff' }}
          >
            {!record.icon_url && <IconCozPeople />}
          </Avatar>
          <div>
            <div>{record.name}</div>
            <Text type="tertiary" size="small">
              {record.user_name}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: I18n.t('member_column_role'),
      dataIndex: 'space_role_type',
      width: 120,
      align: 'center',
      render: (role: SpaceRoleType) => getRoleTag(role || SpaceRoleType.Member),
    },
    {
      title: I18n.t('member_column_join_date'),
      dataIndex: 'join_date',
      width: 150,
      align: 'center',
      render: (date: string) => date || '-',
    },
  ];

  // Add actions column if current user is owner
  if (currentUserRole === SpaceRoleType.Owner) {
    columns.push({
      title: I18n.t('member_column_actions'),
      width: 200,
      align: 'center',
      render: (_text, record) => {
        const isCurrentUser = record.user_id === currentUserId;
        const isOwner = record.space_role_type === SpaceRoleType.Owner;

        if (isCurrentUser || isOwner) {
          return null;
        }

        return (
          <Space>
            <Select
              size="small"
              value={record.space_role_type}
              style={{ width: 100 }}
              onChange={value => handleUpdateRole(record.user_id || '', value)}
            >
              <Select.Option value={SpaceRoleType.Admin}>
                {I18n.t('member_role_admin')}
              </Select.Option>
              <Select.Option value={SpaceRoleType.Member}>
                {I18n.t('member_role_member')}
              </Select.Option>
            </Select>
            <Button
              size="small"
              type="danger"
              theme="borderless"
              onClick={() => handleRemoveMember(record.user_id || '')}
            >
              {I18n.t('member_action_remove')}
            </Button>
          </Space>
        );
      },
    });
  }

  return (
    <div className={s['members-container']}>
      <div className={s['members-header']}>
        <div className={s['header-row']}>
          <h1 className={s['page-title']}>
            {I18n.t('navigation_workspace_members')}
          </h1>
          {currentUserRole === SpaceRoleType.Owner && (
            <Button
              theme="solid"
              type="primary"
              icon={<IconCozPlus />}
              onClick={() => setAddMemberVisible(true)}
            >
              {I18n.t('member_action_add')}
            </Button>
          )}
        </div>
        <div className={s['filter-row']}>
          <Search
            placeholder={I18n.t('member_search_placeholder')}
            style={{ width: 300 }}
            value={searchWord}
            onChange={setSearchWord}
            onSearch={() => {
              setPage(1);
              fetchMembers();
            }}
          />
          <Select
            style={{ width: 150 }}
            value={roleFilter}
            onChange={value => {
              setRoleFilter(value);
              setPage(1);
            }}
          >
            <Select.Option value={0}>
              {I18n.t('member_filter_all')}
            </Select.Option>
            <Select.Option value={SpaceRoleType.Owner}>
              {I18n.t('member_role_owner')}
            </Select.Option>
            <Select.Option value={SpaceRoleType.Admin}>
              {I18n.t('member_role_admin')}
            </Select.Option>
            <Select.Option value={SpaceRoleType.Member}>
              {I18n.t('member_role_member')}
            </Select.Option>
          </Select>
        </div>
      </div>

      <div className={s['members-content']}>
        <Table
          offsetY={150}
          tableProps={{
            loading,
            columns,
            dataSource: members,
            rowKey: 'user_id',
            pagination: {
              current: page,
              pageSize,
              total,
              onChange: current => setPage(current),
              showTotal: total => `${total} members`,
            },
          }}
          empty={
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              {I18n.t('members_no_found')}
            </div>
          }
        />
      </div>

      <Modal
        title={I18n.t('member_add_modal_title')}
        visible={addMemberVisible}
        onCancel={() => {
          setAddMemberVisible(false);
          setSelectedMembers([]);
          setSearchResults([]);
          setSearchValue('');
        }}
        onOk={handleAddMembers}
        okText={I18n.t('member_action_add')}
        cancelText={I18n.t('Cancel')}
        width={600}
        okButtonProps={{
          disabled: selectedMembers.length === 0,
        }}
      >
        <div className={s['add-member-modal']}>
          <Search
            placeholder={I18n.t('member_add_search_placeholder')}
            style={{ marginBottom: 16 }}
            value={searchValue}
            onChange={setSearchValue}
            onSearch={handleSearchMembers}
            loading={searchMemberLoading}
          />
          {searchMemberLoading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="tertiary">{I18n.t('Loading')}</Text>
            </div>
          )}
          {!searchMemberLoading &&
            searchResults.length === 0 &&
            searchValue && (
              <div
                style={{ textAlign: 'center', padding: '40px', color: '#999' }}
              >
                <Text type="tertiary">{I18n.t('No results found')}</Text>
              </div>
            )}
          {searchResults.length > 0 && (
            <div
              style={{
                maxHeight: 400,
                overflow: 'auto',
                border: '1px solid #f0f0f0',
                borderRadius: 4,
              }}
            >
              {searchResults.map((member, index) => {
                const existingUserIds = members.map(m => m.user_id);
                const isExisting = existingUserIds.includes(member.user_id);

                return (
                  <div
                    key={member.user_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderBottom:
                        index === searchResults.length - 1
                          ? 'none'
                          : '1px solid #f0f0f0',
                      cursor: isExisting ? 'not-allowed' : 'pointer',
                      opacity: isExisting ? 0.6 : 1,
                    }}
                    onClick={() => {
                      if (!isExisting) {
                        if (selectedMembers.includes(member.user_id || '')) {
                          setSelectedMembers(
                            selectedMembers.filter(id => id !== member.user_id),
                          );
                        } else {
                          setSelectedMembers([
                            ...selectedMembers,
                            member.user_id || '',
                          ]);
                        }
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      disabled={isExisting}
                      checked={selectedMembers.includes(member.user_id || '')}
                      onChange={() => {}}
                      onClick={e => e.stopPropagation()}
                      style={{ marginRight: 12 }}
                    />
                    <Avatar
                      src={member.icon_url}
                      size="small"
                      style={{ backgroundColor: '#1890ff', marginRight: 12 }}
                    >
                      {!member.icon_url && <IconCozPeople />}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                      <div>{member.name}</div>
                      <Text type="tertiary" size="small">
                        {member.user_name}
                      </Text>
                    </div>
                    {isExisting && (
                      <Tag color="green">{I18n.t('Already added')}</Tag>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

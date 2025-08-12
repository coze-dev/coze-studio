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

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useSpaceStore } from '@coze-foundation/space-store';
// import { PlaygroundApi } from '@coze-arch/bot-api';
import { CreateSpaceModal } from './create-space-modal';

interface SpaceInfo {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  space_type: number;
  role_type: number;
}

interface SpaceListData {
  bot_space_list: SpaceInfo[];
  recently_used_space_list: SpaceInfo[];
  has_personal_space: boolean;
  total: number;
}

interface SpaceSelectorProps {
  className?: string;
  onCreateSpace?: () => void;
}

export const SpaceSelector: React.FC<SpaceSelectorProps> = ({ 
  className,
  onCreateSpace 
}) => {
  const navigate = useNavigate();
  const currentSpace = useSpaceStore(state => state.space);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [spaceList, setSpaceList] = useState<SpaceListData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // 获取空间列表
  const fetchSpaceList = async () => {
    try {
      setLoading(true);
      
      // 直接调用实际的API接口
      const response = await fetch('/api/playground_api/space/list', {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Agw-Js-Conv': 'str',
          'x-requested-with': 'XMLHttpRequest'
        },
        body: JSON.stringify({})
      });
      
      const result = await response.json();
      
      if (result.code === 0 && result.data) {
        setSpaceList(result.data);
      }
    } catch (error) {
      console.error('获取空间列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化获取空间列表
  useEffect(() => {
    fetchSpaceList();
  }, []);

  // 处理空间切换
  const handleSpaceSelect = (space: SpaceInfo) => {
    console.log('切换到空间:', space);
    setDropdownOpen(false);
    // 跳转到对应空间的develop页面
    navigate(`/space/${space.id}/develop`);
  };

  // 处理创建空间
  const handleCreateSpace = () => {
    setDropdownOpen(false);
    if (onCreateSpace) {
      onCreateSpace();
    } else {
      setShowCreateModal(true);
    }
  };

  // 创建空间成功后的处理
  const handleCreateSuccess = (newSpace: any) => {
    console.log('新空间创建成功:', newSpace);
    // 刷新空间列表
    fetchSpaceList();
    // TODO: 切换到新创建的空间
  };

  // 切换下拉菜单
  const toggleDropdown = () => {
    if (!dropdownOpen) {
      // 计算下拉框位置
      if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
      if (!spaceList) {
        fetchSpaceList();
      }
    }
    setDropdownOpen(!dropdownOpen);
  };

  // 渲染空间项
  const renderSpaceItem = (space: SpaceInfo, showRole = false, isCurrentSpace = false) => {
    const roleText = space.role_type === 0 ? '所有者' : '成员';
    // 判断是否为当前选中的空间
    const isSelected = currentSpace?.name === space.name;
    
    return (
      <div 
        key={space.id}
        onClick={() => handleSpaceSelect(space)}
        className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* 选中状态对钩图标 */}
          <div className="w-[16px] h-[16px] shrink-0 flex items-center justify-center">
            {isSelected ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-600">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <div className="w-[16px] h-[16px]"></div>
            )}
          </div>
          
          {/* 空间图标 */}
          <div className="w-[24px] h-[24px] bg-orange-500 rounded-full shrink-0 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          
          {/* 空间名称 */}
          <div className="flex-1 min-w-0">
            <div className="text-[14px] text-gray-900 truncate">{space.name}</div>
          </div>
        </div>
        
        {/* 角色标识 */}
        {showRole && (
          <div className="text-[12px] text-gray-500 shrink-0">
            {roleText}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`relative w-full ${className || ''}`}>
      {/* 主按钮 */}
      <div 
        ref={dropdownRef}
        onClick={toggleDropdown}
        className="h-[48px] px-[8px] w-full hover:bg-gray-50 rounded-[8px] flex items-center gap-2 cursor-pointer"
      >
        <div className="w-[24px] h-[24px] bg-blue-500 rounded-[6px] shrink-0 flex items-center justify-center text-white text-[12px] font-bold">
          {currentSpace?.name?.charAt(0)?.toUpperCase() || 'S'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-[500] truncate">
            {currentSpace?.name || '未选择空间'}
          </div>
        </div>
        <span className={`text-[12px] text-gray-400 transition-transform ${
          dropdownOpen ? 'rotate-180' : 'rotate-0'
        }`}>▼</span>
      </div>


      {/* 创建空间弹框 */}
      <CreateSpaceModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* 使用Portal渲染下拉菜单到body，避免z-index问题 */}
      {dropdownOpen && createPortal(
        <>
          {/* 点击外部关闭下拉菜单 */}
          <div 
            className="fixed inset-0 z-[99989]" 
            onClick={() => setDropdownOpen(false)}
          />
          
          {/* 下拉菜单 */}
          <div 
            className="absolute z-[99990] w-[300px]"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
          >
            <div className="bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden flex flex-col max-h-[480px]">
              {/* 搜索框 */}
              <div className="p-4 border-b border-gray-100 shrink-0">
                <input 
                  type="text" 
                  placeholder="搜索工作空间" 
                  className="w-full px-3 py-2 bg-gray-50 border-0 rounded-md text-[14px] placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* 空间列表 - 可滚动区域 */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-400 text-[14px]">加载中...</div>
                ) : spaceList ? (
                  <>
                    {/* 最近使用 */}
                    {spaceList.recently_used_space_list && spaceList.recently_used_space_list.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-[12px] font-medium text-gray-600 bg-gray-50">
                          最近
                        </div>
                        <div className="">
                          {spaceList.recently_used_space_list.slice(0, 4).map(space => 
                            renderSpaceItem(space, true)
                          )}
                        </div>
                      </div>
                    )}

                    {/* 个人空间 */}
                    <div>
                      <div className="px-4 py-2 text-[12px] font-medium text-gray-600 bg-gray-50 flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-blue-600">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                        个人空间
                      </div>
                      <div className="">
                        {spaceList.bot_space_list
                          .filter(space => space.space_type === 1)
                          .map(space => renderSpaceItem(space, true))
                        }
                      </div>
                    </div>

                    {/* 团队空间 (如果有) */}
                    {spaceList.bot_space_list.filter(space => space.space_type !== 1).length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-[12px] font-medium text-gray-600 bg-gray-50 flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                          </svg>
                          团队空间
                        </div>
                        <div className="">
                          {spaceList.bot_space_list
                            .filter(space => space.space_type !== 1)
                            .map(space => renderSpaceItem(space, true))
                          }
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-400 text-[14px]">加载失败，请重试</div>
                )}
              </div>

              {/* 创建新工作空间按钮 - 固定在底部 */}
              <div className="border-t border-gray-100 shrink-0 bg-transparent">
                <button 
                  onClick={handleCreateSpace}
                  className="w-full text-left px-4 py-3 text-[14px] text-blue-600 font-medium flex items-center gap-2 bg-transparent"
                >
                  <span className="text-[16px] font-light">+</span>
                  创建新工作空间
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};
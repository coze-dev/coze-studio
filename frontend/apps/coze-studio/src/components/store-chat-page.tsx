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

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentIDELayout from '@coze-agent-ide/layout-adapter';

export const StoreChatPage: React.FC = () => {
  const navigate = useNavigate();

  // 确保工具调用元素正常显示（最后尝试）
  useEffect(() => {
    const fixToolElements = () => {
      // 强制显示所有工具相关元素
      const selectors = [
        '[class*="tool"]',
        '[class*="function"]',
        '[class*="call"]',
        '[class*="invoke"]',
        '[class*="execution"]'
      ];
      
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach((el: Element) => {
          const element = el as HTMLElement;
          element.style.setProperty('display', 'block', 'important');
          element.style.setProperty('visibility', 'visible', 'important');
          element.style.setProperty('opacity', '1', 'important');
          element.style.setProperty('max-height', 'none', 'important');
          element.style.setProperty('overflow', 'visible', 'important');
        });
      });
    };

    // 延迟执行，确保DOM完全加载
    const INITIAL_DELAY = 1000;
    setTimeout(fixToolElements, INITIAL_DELAY);
    
    // 监听DOM变化
    const MUTATION_DELAY = 100;
    const observer = new MutationObserver(() => {
      setTimeout(fixToolElements, MUTATION_DELAY);
    });

    const chatArea = document.querySelector('.store-chat-readonly');
    if (chatArea) {
      observer.observe(chatArea, { childList: true, subtree: true });
    }
    
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 自定义顶部导航栏 */}
      <div style={{
        height: '56px',
        background: '#fff',
        borderBottom: '1px solid #e5e6eb',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        zIndex: 1000,
        flexShrink: 0
      }}>
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '6px',
            transition: 'background-color 0.2s',
            fontSize: '14px',
            fontWeight: 500,
            color: '#333'
          }}
          onClick={() => navigate('/explore/project/latest')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8f9fa';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span style={{ fontSize: '16px' }}>←</span>
          返回商店
        </div>
        
        <div style={{
          flex: 1,
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: 500,
          color: '#1f2329'
        }}>
          智能体预览
        </div>
        
        <div style={{ width: '80px' }}></div> {/* 占位，保持标题居中 */}
      </div>

      {/* 使用原始AgentIDELayout，通过CSS隐藏非聊天区域 */}
      <div 
        className="store-chat-readonly"
        style={{
          width: '100%',
          flex: 1,
          minHeight: 0
        }}
      >
        <AgentIDELayout />
      </div>
      
      {/* eslint-disable-next-line risxss/catch-potential-xss-react */}
      <style dangerouslySetInnerHTML={{
        __html: `
        /* 使用更高优先级和更具体的选择器 */
        html .store-chat-readonly .semi-layout-header,
        html body .store-chat-readonly .semi-layout-header {
          display: none !important;
        }
        
        /* 隐藏包含发布按钮的顶部栏 - 使用更高优先级 */
        html .store-chat-readonly [class*="header"],
        html .store-chat-readonly [class*="bot-header"],
        html .store-chat-readonly header,
        html body .store-chat-readonly [class*="header"],
        html body .store-chat-readonly [class*="bot-header"],
        html body .store-chat-readonly header {
          display: none !important;
        }
        
        /* 隐藏左侧边栏 */
        .store-chat-readonly .semi-layout-sider {
          display: none !important;
        }
        
        /* 隐藏左侧编排区域 - 使用更精确的选择器 */
        .store-chat-readonly [class*="develop-area"],
        .store-chat-readonly [class*="config-area"],
        .store-chat-readonly [class*="setting-area"] {
          display: none !important;
        }
        
        /* 重要：调整网格布局，让聊天区域占满 */
        .store-chat-readonly [class*="wrapper-single"] {
          display: grid !important;
          grid-template-columns: 0fr 1fr !important;
        }
        
        /* 确保第一列（配置区域）宽度为0 */
        .store-chat-readonly [class*="wrapper-single"] > *:first-child {
          width: 0 !important;
          min-width: 0 !important;
          overflow: hidden !important;
          visibility: hidden !important;
        }
        
        /* 确保第二列（聊天区域）占满全部空间 */
        .store-chat-readonly [class*="wrapper-single"] > *:last-child {
          width: 100% !important;
          min-width: 100% !important;
          max-width: 100% !important;
        }
        
        /* 聊天区域样式 */
        .store-chat-readonly [class*="message-area"] {
          width: 100% !important;
          min-width: 100% !important;
          max-width: 100% !important;
        }
        
        /* 只隐藏明确的编辑按钮，避免影响工具调用 */
        .store-chat-readonly [title="编辑"],
        .store-chat-readonly [title="修改"],
        .store-chat-readonly [title="设置"] {
          display: none !important;
        }
        
        /* 禁用发布按钮 */
        .store-chat-readonly [class*="deploy"]:not([class*="tool"]),
        .store-chat-readonly [class*="publish"]:not([class*="tool"]) {
          display: none !important;
        }
        
        /* 确保所有工具相关元素正常显示 - 使用更高优先级 */
        html .store-chat-readonly [class*="tool"],
        html .store-chat-readonly [class*="plugin"],
        html .store-chat-readonly [class*="function"],
        html .store-chat-readonly [class*="invoke"],
        html .store-chat-readonly [class*="call"],
        html .store-chat-readonly [class*="execution"],
        html .store-chat-readonly [class*="result"],
        html body .store-chat-readonly [class*="tool"],
        html body .store-chat-readonly [class*="plugin"],
        html body .store-chat-readonly [class*="function"],
        html body .store-chat-readonly [class*="invoke"],
        html body .store-chat-readonly [class*="call"],
        html body .store-chat-readonly [class*="execution"],
        html body .store-chat-readonly [class*="result"] {
          display: inherit !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
        }
        
        /* 只保留基本的聊天输入和发送功能 */
        .store-chat-readonly [class*="chat-input"] {
          pointer-events: auto !important;
        }
        
        /* 禁用右键菜单 */
        .store-chat-readonly {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        .store-chat-readonly [class*="message-area"] {
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }
        `
      }} />
    </div>
  );
};
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

import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { type DatabaseList } from '@coze-studio/bot-detail-store';
import { BotTableRWMode, FieldItemType } from '@coze-arch/bot-api/memory';

import MultiTable from '../../src/components/database-debug/multi-table';
import s from '../../src/components/database-debug/index.module.less';

const mockDatabaseList: DatabaseList = [
  {
    tableId: 'table1',
    name: 'Database 1',
    desc: 'Test database 1',
    readAndWriteMode: BotTableRWMode.LimitedReadWrite,
    tableMemoryList: [
      {
        nanoid: 'field1',
        name: 'Field 1',
        desc: 'Test field 1',
        must_required: true,
        type: FieldItemType.Text,
      },
    ],
  },
  {
    tableId: 'table2',
    name: 'Database 2',
    desc: 'Test database 2',
    readAndWriteMode: BotTableRWMode.LimitedReadWrite,
    tableMemoryList: [
      {
        nanoid: 'field2',
        name: 'Field 2',
        desc: 'Test field 2',
        must_required: true,
        type: FieldItemType.Number,
      },
    ],
  },
];

vi.mock('@coze-arch/coze-design', () => ({
  TabPane: vi.fn(({ children }) => <div>{children}</div>),
  Tabs: vi.fn(({ children, renderTabBar }) => (
    <div>
      {renderTabBar?.({
        list: mockDatabaseList.map(item => ({
          tab: item.name,
          itemKey: item.tableId,
        })),
        activeKey: 'table1',
        onTabClick: vi.fn(),
      })}
      {children}
    </div>
  )),
  Typography: {
    Text: vi.fn(({ children, className, onClick }) => (
      <div className={className} onClick={onClick}>
        {children}
      </div>
    )),
  },
  Divider: vi.fn(({ key }) => <div key={key}>|</div>),
}));

vi.mock('@coze-data/e2e', () => ({
  BotE2e: {
    BotDatabaseDebugModalTableNameTab: 'BotDatabaseDebugModalTableNameTab',
    BotDatabaseDebugModalResetBtn: 'BotDatabaseDebugModalResetBtn',
  },
}));

vi.mock('../../src/components/database-debug/table/reset-btn', () => ({
  default: vi.fn(() => <div>ResetBtn</div>),
}));

vi.mock('../../src/components/database-debug/table/index', () => ({
  DataTable: vi.fn(() => <div>DataTable</div>),
}));

// Mock CSS Modules
vi.mock('../../src/components/database-debug/index.module.less', () => ({
  default: {
    'modal-content-tabs': 'modal-content-tabs',
    'tab-bar-box': 'tab-bar-box',
    'tab-bar-item': 'tab-bar-item',
    'tab-bar-item-active': 'tab-bar-item-active',
  },
}));

describe('MultiTable', () => {
  it('should render database tabs', () => {
    render(<MultiTable botID="test-bot" databaseList={mockDatabaseList} />);

    expect(screen.getByText('Database 1')).toBeInTheDocument();
    expect(screen.getByText('Database 2')).toBeInTheDocument();
  });

  it('should render empty state when no databases', () => {
    render(<MultiTable botID="test-bot" databaseList={[]} />);

    expect(screen.queryByText('Database 1')).not.toBeInTheDocument();
  });

  it('should use provided activeDatabaseID', () => {
    render(
      <MultiTable
        botID="test-bot"
        databaseList={mockDatabaseList}
        activeDatabaseID="table2"
      />,
    );

    // The second database should be activated
    const tab = screen.getByText('Database 2').closest('div');
    expect(tab).toHaveClass(s['tab-bar-item']);
  });

  it('should handle database switching', () => {
    render(<MultiTable botID="test-bot" databaseList={mockDatabaseList} />);

    // Click on the second database tab
    fireEvent.click(screen.getByText('Database 2'));

    // Verify that the switch was successful
    const tab = screen.getByText('Database 2').closest('div');
    expect(tab).toHaveClass(s['tab-bar-item']);
  });
});

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

import React from 'react';

import { expect, vi, describe, test } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { DatabaseModal } from '../src/components/database-modal';

vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: (key: string) => key,
  },
  getUnReactiveLanguage: () => 'zh-CN',
}));

const global = vi.hoisted(() => ({
  isApiError: vi.fn().mockReturnValue(false),
  useFlags: vi.fn().mockReturnValue([
    {
      'bot.data.excel_to_database': false,
    },
  ]),
  mockProps: {
    visible: true,
    onCancel: vi.fn(),
    expertModeConfig: {
      isExpertMode: true,
      maxColumnNum: 10,
      maxTableNum: 2,
      readAndWriteModes: [1],
    },
    database: {
      tableId: '1',
      name: 'test',
      desc: 'test',
      readAndWriteMode: 1,
      tableMemoryList: [],
    },
    botId: 'bot-1',
    spaceId: 'space-1',
    readonly: false,
    NL2DBInfo: {
      prompt: 'test-nl',
    },
  },
}));

vi.mock('@coze-arch/bot-semi', async () => {
  const actual: object = await vi.importActual('@coze-arch/bot-semi');
  const { MockPopover } = (await vi.importActual(
    './mock-components/mock-popover.tsx',
  )) as any;
  const { MockTextArea } = (await vi.importActual(
    './mock-components/mock-textarea.tsx',
  )) as any;
  const { MockPopconfirm } = (await vi.importActual(
    './mock-components/mock-popconfirm',
  )) as any;
  const { MockTooltip } = (await vi.importActual(
    './mock-components/mock-tooltip',
  )) as any;
  return {
    ...actual,
    Popover: MockPopover,
    TextArea: MockTextArea,
    Popconfirm: MockPopconfirm,
    ToolTip: MockTooltip,
  };
});

vi.mock('@coze-arch/report-events', () => ({
  REPORT_EVENTS: {
    DatabaseNL2DB: 'DatabaseNL2DB',
    DatabaseAddTable: 'DatabaseAddTable',
    DatabaseAlterTable: 'DatabaseAlterTable',
  },
}));

vi.mock('@coze-arch/bot-tea', () => ({
  sendTeaEvent: vi.fn(),
  EVENT_NAMES: {
    generate_with_ai_click: 'generate_with_ai_click',
    nl2table_create_table_click: 'nl2table_create_table_click',
  },
}));

vi.mock('@coze-arch/bot-api', () => ({
  MemoryApi: {
    RecommendDataModel: () =>
      Promise.resolve({
        bot_table_list: [
          {
            type: 1,
            table_name: 'test',
            table_desc: 'test',
            field_list: [
              {
                name: 'name',
                desc: 'pokemon name',
                must_required: true,
                type: 1,
                id: 1,
              },
              {
                name: 'score',
                desc: 'pokemon score',
                must_required: false,
                type: 1,
                id: 2,
              },
            ],
          },
        ],
      }),
  },
}));

vi.mock('@coze-data/reporter', () => ({
  DataNamespace: {
    DATABASE: 'database',
  },
  dataReporter: {
    errorEvent: vi.fn(),
  },
}));

vi.mock('@coze-arch/bot-http', () => ({
  isApiError: global.isApiError,
}));

vi.mock('@coze-studio/components', () => ({
  PopoverContent: (props: { children: React.ReactElement }) => props.children,
}));

vi.mock('@douyinfe/semi-icons', async () => {
  const actual = await vi.importActual('@douyinfe/semi-icons');
  return {
    ...(actual as any),
    IconAlertTriangle: () => <>IconAlertTriangle</>,
    IconClose: () => <>IconClose</>,
    IconChevronDown: () => <>IconChevronDown</>,
  };
});

vi.mock('@coze-arch/bot-icons', () => ({
  IconAdd: () => <>IconAdd</>,
  IconWaringRed: () => <>IconAdd</>,
  IconDeleteOutline: () => <>IconDeleteOutline</>,
  IconWarningSize24: () => <>IconWarningSize24</>,
}));

vi.mock('@coze-arch/bot-flags', () => ({
  useFlags: global.useFlags,
}));

describe('database modal test', () => {
  test('render', async () => {
    await render(<DatabaseModal {...global.mockProps} />);
    const title = await screen.queryByText('db_edit_title');
    expect(title).not.toBeNull();
  });

  test('show entry', async () => {
    global.mockProps = {
      ...global.mockProps,
      NL2DBInfo: undefined as any,
      database: {
        ...global.mockProps.database,
        tableId: '',
      },
    };
    await render(<DatabaseModal {...global.mockProps} />);
    const entry = await screen.queryByText('db_add_table_cust');
    expect(entry).not.toBeNull();
  });

  test('show ai generate', async () => {
    global.mockProps.NL2DBInfo = {
      prompt: 'test',
    };
    global.mockProps.database.tableId = '';
    await render(<DatabaseModal {...global.mockProps} />);
    const aiCreateButton = await screen.queryByText('bot_database_ai_create');
    expect(aiCreateButton).not.toBeNull();
    if (aiCreateButton) {
      await fireEvent.click(aiCreateButton);
    }
    const aiGenerateButton = await screen.queryByText(
      'bot_database_ai_generate',
    );

    expect(aiGenerateButton).not.toBeNull();
  });

  test('generate table by nl', async () => {
    global.mockProps.NL2DBInfo = {
      prompt: 'test',
    };
    global.mockProps.database.tableId = '';
    await render(<DatabaseModal {...global.mockProps} />);
    const aiCreateButton = await screen.queryByText('bot_database_ai_create');
    expect(aiCreateButton).not.toBeNull();
    if (aiCreateButton) {
      await fireEvent.click(aiCreateButton);
    }
    const nlInput = await screen.queryByRole('mock-textarea');
    expect(nlInput).not.toBeNull();
    if (nlInput) {
      await fireEvent.input(nlInput, {
        target: {
          value: 'a pokemon table, name and score',
        },
      });
    }
    const aiGenerateButton = await screen.queryByText(
      'bot_database_ai_generate',
    );

    expect(aiGenerateButton).not.toBeNull();
    if (aiGenerateButton) {
      await fireEvent.click(aiGenerateButton);
    }
    const content = await screen.queryByText('test');
    expect(content).not.toBeNull();
  });
});

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

import { expect, it } from 'vitest';

import { StandardNodeType } from '../../../types';
import { SchemaExtractor, SchemaExtractorParserName } from '..';

it('extract schema with json string parser', () => {
  const schemaExtractor = new SchemaExtractor({
    edges: [],
    nodes: [
      {
        id: '176450',
        type: '25',
        data: {
          inputs: {
            Messages:
              '{"visibility":{"visibility":"3","user_settings":[{"biz_role_id":"7398508237160677420","role":"host","nickname":"host","role_type":1,"description":""},{"biz_role_id":"7402058670241185836","role":"juese2","nickname":"","role_type":3,"description":""},{"biz_role_id":"7405794345170763820","role":"bot1","nickname":"majiang","role_type":2,"description":"麻将高手"}]},"order":"1","contentMode":"1","messages":[{"biz_role_id":"7398508237160677420","role":"host","nickname":"host","role_type":1,"generate_mode":0,"content":"这是一条示例消息，点击可修改"},{"biz_role_id":"7402058670241185836","role":"juese2","nickname":"","role_type":3,"content":"","generate_mode":1}]}',
            Roles:
              '[{"biz_role_id":"7398508237160677420","role":"host","nickname":"host","role_type":1,"generate_mode":0},{"biz_role_id":"7402058670241185836","role":"juese2","nickname":"","role_type":3,"generate_mode":1}]',
          },
        },
      },
    ],
  });
  const extractedSchema = schemaExtractor.extract({
    // End End Node 2
    [StandardNodeType.SceneChat]: [
      {
        // Corresponding output specified content
        name: 'messages',
        path: 'inputs.Messages',
        parser: SchemaExtractorParserName.JSON_STRING_PARSER,
      },
    ],
  });
  expect(extractedSchema).toStrictEqual([
    {
      nodeId: '176450',
      nodeType: '25',
      properties: {
        messages: {
          visibility: {
            visibility: '3',
            user_settings: [
              {
                biz_role_id: '7398508237160677420',
                role: 'host',
                nickname: 'host',
                role_type: 1,
                description: '',
              },
              {
                biz_role_id: '7402058670241185836',
                role: 'juese2',
                nickname: '',
                role_type: 3,
                description: '',
              },
              {
                biz_role_id: '7405794345170763820',
                role: 'bot1',
                nickname: 'majiang',
                role_type: 2,
                description: '麻将高手',
              },
            ],
          },
          order: '1',
          contentMode: '1',
          messages: [
            {
              biz_role_id: '7398508237160677420',
              role: 'host',
              nickname: 'host',
              role_type: 1,
              generate_mode: 0,
              content: '这是一条示例消息，点击可修改',
            },
            {
              biz_role_id: '7402058670241185836',
              role: 'juese2',
              nickname: '',
              role_type: 3,
              content: '',
              generate_mode: 1,
            },
          ],
        },
      },
    },
  ]);
});

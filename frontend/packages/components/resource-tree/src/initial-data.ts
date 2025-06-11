import { type FlowDocumentJSON } from '@flowgram-adapter/fixed-layout-editor';
// only for test
export const initialData: FlowDocumentJSON = {
  nodes: [
    // 开始节点
    {
      id: 'start_0',
      type: 'split',
      data: {
        title: 'Start',
        content: 'start content',
      },
      blocks: [
        {
          id: 'noop',
          type: 'block',
          blocks: [
            // 分支节点
            {
              id: 'condition_0',
              type: 'split',
              data: {
                title: 'Condition',
              },
              blocks: [
                {
                  id: 'block_1',
                  type: 'block',
                  blocks: [
                    {
                      id: 'block_4',
                      type: 'split',
                      blocks: [
                        {
                          id: 'block_5',
                          type: 'block',
                          blocks: [
                            {
                              id: 'custom_1',
                              type: 'custom',
                              meta: {
                                isNodeEnd: true,
                              },
                            },
                            {
                              id: 'custom_2',
                              type: 'custom',
                              meta: {
                                isNodeEnd: true,
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'block_2',
                  type: 'block',
                  meta: {
                    isNodeEnd: true,
                  },
                  blocks: [
                    {
                      id: 'custom_3',
                      type: 'custom',
                      meta: {
                        isNodeEnd: true,
                      },
                    },
                  ],
                },
                {
                  id: 'block_3',
                  type: 'block',
                  meta: {
                    isNodeEnd: true,
                  },
                  blocks: [
                    {
                      id: 'custom_4',
                      type: 'custom',
                      meta: {
                        isNodeEnd: true,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

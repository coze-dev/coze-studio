import { convertInputs } from './convert-inputs';

describe('convert-inputs', () => {
  it('select variable without name', () => {
    expect(
      convertInputs([
        {
          name: 'output',
          input: undefined,
        } as any,
      ]),
    ).toEqual([
      {
        name: 'output',
        keyPath: [],
      },
    ]);
  });

  it('select variable', () => {
    expect(
      convertInputs([
        {
          name: 'output',
          input: {
            type: 'ref',
            content: {
              keyPath: ['196209', 'output'],
            },
            rawMeta: {
              type: 1,
            },
          },
        } as any,
      ]),
    ).toEqual([
      {
        name: 'output',
        keyPath: ['196209', 'output'],
      },
    ]);
  });

  it('select variable child', () => {
    expect(
      convertInputs([
        {
          name: 'output',
          input: {
            type: 'ref',
            content: {
              keyPath: ['100001', 'obj', 'a'],
            },
            rawMeta: {
              type: 1,
            },
          },
        },
      ] as any),
    ).toEqual([
      {
        name: 'output',
        keyPath: ['100001', 'obj', 'a'],
      },
    ]);
  });
});

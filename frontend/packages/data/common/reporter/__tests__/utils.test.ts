import { expect, describe, test, vi } from 'vitest';

import { reporterFun } from '../src/reporter/utils';
import { DataNamespace } from '../src/constants';

const global = vi.hoisted(() => ({
  reporter: {
    errorEvent: vi.fn(),
    event: vi.fn(),
  },
}));

vi.mock('@coze-arch/logger', () => ({
  reporter: global.reporter,
}));

describe('reporter utils test', () => {
  test('reporterFun test errorEvent', () => {
    reporterFun({
      event: {
        error: {
          name: 'test',
          message: 'test',
        },
        meta: {
          spaceId: '2333',
        },
        eventName: 'test',
        level: 'error',
      },
      meta: {
        documentId: '7347658103988715564',
        knowledgeId: '7327619796571734060',
        spaceId: '7313840473481936940',
      },
      type: 'error',
      namespace: DataNamespace.KNOWLEDGE,
    });
    expect(global.reporter.errorEvent).toHaveBeenCalledWith({
      error: {
        message: 'test',
        name: 'test',
      },
      eventName: 'test',
      level: 'error',
      meta: {
        documentId: '7347658103988715564',
        knowledgeId: '7327619796571734060',
        spaceId: '2333',
      },
      namespace: 'knowledge',
    });
    expect(global.reporter.event).not.toBeCalled();
  });

  test('reporterFun test event', () => {
    reporterFun({
      event: {
        eventName: 'test',
      },
      meta: {
        documentId: '7347658103988715564',
        knowledgeId: '7327619796571734060',
        spaceId: '7313840473481936940',
      },
      type: 'custom',
      namespace: DataNamespace.KNOWLEDGE,
    });
    expect(global.reporter.event).toHaveBeenCalledWith({
      eventName: 'test',
      meta: {
        documentId: '7347658103988715564',
        knowledgeId: '7327619796571734060',
        spaceId: '7313840473481936940',
      },
      namespace: 'knowledge',
    });
  });
});

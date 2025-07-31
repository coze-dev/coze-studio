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

import { type TraceDuration } from '../src/reporter/duration-tracer';
import { Reporter, reporter as rawReporter } from '../src/reporter';

vi.mock('../src/logger', () => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  function Logger(config: Record<string, unknown>) {
    return {
      ctx: config.meta,
      namespace: config.namespace,
      scope: config.scope,
      addClient: vi.fn(),
      info: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
      error: vi.fn(),
      persist: {
        info: vi.fn(),
        success: vi.fn(),
        warning: vi.fn(),
        error: vi.fn(),
        addClient: vi.fn(),
      },
    };
  }
  return {
    Logger,
  };
});
vi.mock('../src/slardar', () => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  function SlardarReportClient() {
    return null;
  }

  return {
    SlardarReportClient,
  };
});

// A constant interval just to test the tracer is valid
const CONSTANT_INTERVAL = 100;
vi.stubGlobal('performance', {
  mark: vi.fn(),
  measure: () => ({
    duration: CONSTANT_INTERVAL,
  }),
});

describe('reporter', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('With on slardar instance', () => {
    const reporter = new Reporter({});
    reporter.init(null);
    // @ts-expect-error private member
    expect(reporter.initialized).equal(false);
  });

  test('Should not call the logger function if `init` is not called, also the messages will be inserted into `pendingQueue`', () => {
    const reporter = new Reporter({});
    // @ts-expect-error private member
    const logger = reporter.logger.persist;
    reporter.success({ message: 'success' });
    expect(logger.success).not.toHaveBeenCalled();
    reporter.info({ message: 'info' });
    expect(logger.info).not.toHaveBeenCalled();
    reporter.warning({ message: 'warning' });
    expect(logger.warning).not.toHaveBeenCalled();
    reporter.error({ message: 'error', error: new Error() });
    expect(logger.error).not.toHaveBeenCalled();
    reporter.event({ eventName: 'e1' });
    expect(logger.info).not.toHaveBeenCalled();
    reporter.successEvent({ eventName: 's1' });
    expect(logger.success).not.toHaveBeenCalled();
    reporter.errorEvent({ eventName: 'e2', error: new Error() });
    expect(logger.error).not.toHaveBeenCalled();

    // @ts-expect-error private member
    expect(reporter.pendingQueue.length).equal(7);
  });

  test('Should call logger function if init is called, also the `pendingQueue` should be empty', () => {
    const reporter = new Reporter({});
    reporter.init({} as any);
    // @ts-expect-error private member
    const logger = reporter.logger.persist;
    reporter.success({ message: 'success' });
    expect(logger.success).toHaveBeenCalled();
    reporter.info({ message: 'info' });
    expect(logger.info).toHaveBeenCalled();
    reporter.warning({ message: 'warning' });
    expect(logger.warning).toHaveBeenCalled();
    reporter.error({ message: 'error', error: new Error() });
    expect(logger.error).toHaveBeenCalled();
    reporter.event({ eventName: 'e1' });
    expect(logger.info).toHaveBeenCalled();
    reporter.successEvent({ eventName: 's1' });
    expect(logger.success).toHaveBeenCalled();
    reporter.errorEvent({ eventName: 'e2', error: new Error() });
    expect(logger.error).toHaveBeenCalled();

    // @ts-expect-error private member
    expect(reporter.pendingQueue.length).equal(0);
  });

  test('If `init` is called after then logger functions, the messages will be inserted into `pendingQueue` which will be handled and clear out when initialization is finished', async () => {
    const reporter = new Reporter({});
    // @ts-expect-error private member
    const logger = reporter.logger.persist;
    reporter.success({ message: 'success' });
    expect(logger.success).not.toHaveBeenCalled();
    reporter.info({ message: 'info' });
    expect(logger.info).not.toHaveBeenCalled();
    reporter.warning({ message: 'warning' });
    expect(logger.warning).not.toHaveBeenCalled();
    reporter.error({ message: 'error', error: new Error() });
    expect(logger.error).not.toHaveBeenCalled();
    reporter.event({ eventName: 'e1' });
    expect(logger.info).not.toHaveBeenCalled();
    reporter.errorEvent({ eventName: 'e2', error: new Error() });
    expect(logger.error).not.toHaveBeenCalled();
    reporter.successEvent({ eventName: 's1' });
    expect(logger.success).not.toHaveBeenCalled();
    // @ts-expect-error private member
    expect(reporter.pendingQueue.length).equal(7);

    const RANDOM_DURATION = 100;
    await wait(RANDOM_DURATION);

    reporter.init({} as any);
    expect(logger.success).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalled();
    expect(logger.warning).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
    // @ts-expect-error private member
    expect(reporter.pendingQueue.length).equal(0);
  });

  test('createReporterWithPreset', () => {
    const presetReporter = rawReporter.createReporterWithPreset({});
    expect(presetReporter.getLogger()).not.undefined;
    expect(presetReporter.slardarInstance).not.undefined;
  });

  describe('Error Event', () => {
    test('The meta of the error event should contain error object', () => {
      const reporter = new Reporter({});
      reporter.errorEvent({
        eventName: 'e',
        error: new Error('custom_message'),
      });

      // @ts-expect-error private member
      const queue = reporter.pendingQueue;
      expect(queue.length).equal(1);
      const item = queue[0];
      expect(item.error).instanceOf(Error);
      expect(item.meta.errorMessage).equal('custom_message');
    });
  });

  describe('Success Event', () => {
    test('The logger.success should be called', () => {
      const reporter = new Reporter({});
      reporter.init({} as any);
      reporter.successEvent({
        eventName: 'e',
      });

      // @ts-expect-error private member
      const logger = reporter.logger.persist;
      expect(logger.success).toHaveBeenCalled();
    });
  });

  describe('Trace Event', () => {
    test('No any trace should not call the logger function', () => {
      const reporter = new Reporter({});
      reporter.init({} as any);
      // Generate but ot use the tracer
      reporter.tracer({ eventName: 'e' });

      // @ts-expect-error private member
      const logger = reporter.logger.persist;
      expect(logger.info).not.toHaveBeenCalled();
    });

    test('Multiple steps logger in order with correct duration', () => {
      const reporter = new Reporter({});
      const { trace } = reporter.tracer({
        eventName: 'e',
      });
      trace('step1');
      trace('step2');
      trace('success');

      // @ts-expect-error private member
      const queue = reporter.pendingQueue;
      expect(queue.length).equal(3);
      const lastItem = queue[queue.length - 1];
      const duration = lastItem.meta.duration as TraceDuration;
      expect(duration.points).toStrictEqual(['step1', 'step2', 'success']);
      expect(duration.interval.step2).equal(CONSTANT_INTERVAL);
      expect(duration.interval.success).equal(CONSTANT_INTERVAL);
    });

    test('The meta of the error step should contain error object', () => {
      const reporter = new Reporter({});
      const { trace } = reporter.tracer({
        eventName: 'e',
      });
      trace('fail', {
        error: new Error(),
      });

      // @ts-expect-error private member
      const queue = reporter.pendingQueue;
      expect(queue.length).equal(1);
      const item = queue[0];
      expect(item.meta.error).instanceOf(Error);
    });

    test('The meta should be recorded correctly', () => {
      const reporter = new Reporter({});
      const { trace } = reporter.tracer({
        eventName: 'e',
      });
      trace('step1', {
        meta: {
          m1: 1, // number
          c1: 'any', // string
        },
      });

      // @ts-expect-error private member
      const queue = reporter.pendingQueue;
      expect(queue.length).equal(1);
      const item = queue[0];
      expect(item.meta.m1).equal(1);
      expect(item.meta.c1).equal('any');
    });
  });
});

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

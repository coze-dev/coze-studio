import {
  type TraceDuration,
  genDurationTracer,
} from '../src/reporter/duration-tracer';

// A constant interval just to test the tracer is valid
const CONSTANT_INTERVAL = 100;

vi.stubGlobal('performance', {
  mark: vi.fn(),
  measure: () => ({
    duration: CONSTANT_INTERVAL,
  }),
});

describe('duration-tracer', () => {
  test('Does not collect empty pointName', () => {
    const { tracer } = genDurationTracer();
    const result = tracer('');
    expect(result.points.length).equal(0);
  });

  test('Durations are collected correctly', () => {
    const { tracer } = genDurationTracer();
    tracer('step1');
    const result1: TraceDuration = tracer('step2');
    expect(result1.points).toStrictEqual(['step1', 'step2']);
    expect(result1.interval.step2).equal(CONSTANT_INTERVAL);
    const result2 = tracer('step3');
    expect(result2.points).toStrictEqual(['step1', 'step2', 'step3']);
    expect(result2.interval.step3).equal(CONSTANT_INTERVAL);
    // Multiple pointName will be filtered
    tracer('step3');
    expect(result2.points).toStrictEqual(['step1', 'step2', 'step3']);
  });
});

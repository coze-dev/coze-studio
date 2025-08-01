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

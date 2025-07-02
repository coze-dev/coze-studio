import { getRangeDirection } from '../src/utils/helper/get-range-direction';

describe('getRangeDirection', () => {
  it('should return "none" when the range start and end are the same', () => {
    const range = document.createRange();
    const div = document.createElement('div');
    document.body.appendChild(div); // 确保节点在 DOM 中
    range.setStart(div, 0);
    range.setEnd(div, 0);

    const direction = getRangeDirection(range);
    expect(direction).toBe('none');
  });

  it('should return "forward" when the range is selected forwards', () => {
    const div = document.createElement('div');
    document.body.appendChild(div); // 确保节点在 DOM 中
    div.textContent = 'Test content';
    const range = document.createRange();
    range.setStart(div.firstChild as Node, 0);
    range.setEnd(div.firstChild as Node, 4); // 选择了 "Test"

    const direction = getRangeDirection(range);
    expect(direction).toBe('forward');
  });
});

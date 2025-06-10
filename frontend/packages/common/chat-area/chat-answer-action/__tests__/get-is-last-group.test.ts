import { getIsLastGroup } from '../src/utils/get-is-last-group';

it('getIsLastGroupCorrectly', () => {
  const res1 = getIsLastGroup({
    meta: { isFromLatestGroup: false, sectionId: '123' },
    latestSectionId: '123',
  });
  const res2 = getIsLastGroup({
    meta: { isFromLatestGroup: true, sectionId: '123' },
    latestSectionId: '123',
  });
  const res3 = getIsLastGroup({
    meta: { isFromLatestGroup: true, sectionId: '321' },
    latestSectionId: '123',
  });
  const res4 = getIsLastGroup({
    meta: { isFromLatestGroup: false, sectionId: '321' },
    latestSectionId: '123',
  });
  expect(res1).toBeFalsy();
  expect(res2).toBeTruthy();
  expect(res3).toBeFalsy();
  expect(res4).toBeFalsy();
});

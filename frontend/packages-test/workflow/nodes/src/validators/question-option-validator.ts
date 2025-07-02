import { z, ZodIssueCode } from 'zod';
import { I18n } from '@coze-arch/i18n';
import { type ValidatorProps } from '@flowgram-adapter/free-layout-editor';

// 自定义验证器，检查数组是否为空，并且没有重复的值
const nonEmptyUniqueArray = z
  .array(
    z.object({
      name: z.string(),
    }),
  )
  .superRefine((val, ctx) => {
    const seenValues = new Set();

    val.forEach((item, idx) => {
      // 检查非空
      if (item.name.trim() === '') {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: I18n.t(
            'workflow_ques_option_notempty',
            {},
            '选项内容不可为空',
          ),
          path: [idx],
        });
      }

      // 检查重复
      if (seenValues.has(item.name)) {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: I18n.t(
            'workflow_ques_ans_testrun_dulpicate',
            {},
            '选项内容不可重复',
          ),
          path: [idx],
        });
      } else {
        seenValues.add(item.name);
      }
    });
  });

export function questionOptionValidator({
  value,
}: ValidatorProps<Array<{ name?: string; id: string }>>) {
  try {
    nonEmptyUniqueArray.parse(value);
  } catch (error) {
    return JSON.stringify(error);
  }
  return true;
}

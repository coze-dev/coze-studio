import dayjs from 'dayjs';
import { faker } from '@faker-js/faker';
import { type IPlugin, type Program, before } from '@coze-arch/idl2ts-plugin';
import {
  type IntConstant,
  isBaseType,
  SyntaxType,
  getBaseTypeConverts,
} from '@coze-arch/idl2ts-helper';
import { type GenMockFieldCtx, HOOK } from '@coze-arch/idl2ts-generator';
// eslint-disable-next-line @coze-arch/no-batch-import-or-export
import * as t from '@babel/types';

const NumMapper = {
  total: 1,
  code: 0,
};

const StrMapper = {
  name: faker.person.lastName(),
};

export class MockPlugin implements IPlugin {
  apply(program: Program) {
    program.register(before(HOOK.GEN_MOCK_FILED), this.genMockValue.bind(this));
  }

  // eslint-disable-next-line complexity
  genMockValue = (ctx: GenMockFieldCtx) => {
    const { context, fieldType, defaultValue } = ctx;
    if (isBaseType(fieldType)) {
      const type = getBaseTypeConverts('number')[fieldType.type];

      if (type === 'string') {
        let value = faker.word.words();
        if (defaultValue && defaultValue.type === SyntaxType.StringLiteral) {
          value = (defaultValue as any).value;
        }
        if (context) {
          const { fieldDefinition } = context;
          const fieldName = fieldDefinition.name.value;
          // 各类 ID
          if (fieldName.toLocaleUpperCase().endsWith('ID')) {
            value = String(faker.number.int());
          }
          // email 处理
          if (fieldName.includes('Email')) {
            value = `${faker.person.lastName()}@foo.com`;
          }
          // 直接映射值
          value = StrMapper[fieldName] || value;
        }
        ctx.output = t.stringLiteral(value);
      } else if (type === 'number') {
        let value = faker.number.int({ min: 0, max: 10000 });
        if (defaultValue && defaultValue.type === SyntaxType.IntConstant) {
          value = Number((defaultValue as IntConstant).value.value);
        }
        if (context) {
          const { fieldDefinition } = context;
          const fieldName = fieldDefinition.name.value;
          const formatName = fieldName.toLocaleUpperCase();
          // 各类 ID
          if (formatName.endsWith('ID')) {
            value = faker.number.int();
          }
          // 时间戳
          if (formatName.endsWith('TIME') || formatName.includes('TIMESTAMP')) {
            value = dayjs(faker.date.anytime()).valueOf();
          }
          // 类型状态
          if (formatName.endsWith('STATUS') || formatName.includes('TYPE')) {
            value = faker.number.int({ min: 0, max: 1 });
          }

          // 直接映射值
          const mapVal = NumMapper[fieldName];
          value = typeof mapVal !== 'undefined' ? mapVal : value;
        }
        ctx.output = t.numericLiteral(value);
      }
    }
    return ctx;
  };
}

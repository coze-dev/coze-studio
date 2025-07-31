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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { set, get } from 'lodash-es';
import { injectable, inject } from 'inversify';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import {
  type DatabaseSettingField,
  type DatabaseSettingFieldDTO,
  type DatabaseConditionDTO,
  type DatabaseCondition,
  ValueExpressionType,
  ConditionLogicDTO,
  ConditionLogic,
  type ConditionOperator,
  workflowQueryClient,
} from '@coze-workflow/base';
import { type SingleDatabaseResponse } from '@coze-arch/idl/memory';
import { I18n } from '@coze-arch/i18n';
import { MemoryApi } from '@coze-arch/bot-api';

import { ValueExpressionService } from './value-expression-service';
import { type DatabaseNodeService } from './database-node-service';

const STALE_TIME = 20000;

interface DatabaseNodeServiceState {
  /**
   * Is the database data loading?
   */
  loading: boolean;

  /**
   */
  data: Record<string, SingleDatabaseResponse>;

  /**
   */
  error: Record<string, string | undefined>;
}

interface DatabasenNodeServiceAction {
  getData: (id: string) => SingleDatabaseResponse;
  setData: (id: string, value: SingleDatabaseResponse) => void;
  getError: (id: string) => string | undefined;
  setError: (id: string, value: string | undefined) => void;
  clearError: (id: string) => void;
}

export type DatabseNodeStore = DatabaseNodeServiceState &
  DatabasenNodeServiceAction;

const createStore = () =>
  createWithEqualityFn<DatabseNodeStore>(
    (setStore, getStore) => ({
      loading: false,
      data: {},
      error: {},

      getData(id) {
        return getStore().data[id];
      },

      setData(id, value) {
        setStore({
          data: {
            ...getStore().data,
            [id]: value,
          },
        });
      },

      getError(id) {
        return getStore().error[id];
      },

      setError(id, value) {
        setStore({
          error: {
            ...getStore().error,
            [id]: value,
          },
        });
      },

      clearError(id) {
        setStore({
          error: {
            ...getStore().error,
            [id]: undefined,
          },
        });
      },
    }),
    shallow,
  );

@injectable()
export class DatabaseNodeServiceImpl implements DatabaseNodeService {
  store = createStore();

  @inject(ValueExpressionService)
  private readonly valueExpressionService: ValueExpressionService;

  public convertSettingFieldToDTO(
    name: string,
    value: any,
    node: FlowNodeEntity,
  ) {
    const databaseSettingField = get(value, name);

    if (!databaseSettingField) {
      return value;
    }

    const databaseSettingFieldDTO: DatabaseSettingFieldDTO[] = (
      databaseSettingField as DatabaseSettingField[]
    ).map(field => {
      const { fieldID, fieldValue = { type: ValueExpressionType.LITERAL } } =
        field;

      return [
        {
          name: 'fieldID',
          input: {
            type: 'string',
            value: {
              type: ValueExpressionType.LITERAL,
              content: fieldID.toString(),
            },
          },
        },
        {
          name: 'fieldValue',
          input: this.valueExpressionService.toDTO(fieldValue, node),
        },
      ];
    });

    set(value, name, databaseSettingFieldDTO);

    return value;
  }

  public convertSettingFieldDTOToField(name: string, value: any) {
    const databaseSettingFieldDTO = get(value, name);

    if (!databaseSettingFieldDTO) {
      return value;
    }

    const databaseSettingField: DatabaseSettingField[] = (
      databaseSettingFieldDTO as DatabaseSettingFieldDTO[]
    ).map(field => ({
      fieldID: Number(field[0].input.value.content),
      fieldValue: this.valueExpressionService.toVO(field[1]?.input),
    }));

    set(value, name, databaseSettingField);

    return value;
  }

  public convertConditionDTOToCondition(name: string, value: any) {
    const conditionDTO = get(value, name);

    if (!conditionDTO) {
      return value;
    }

    const condition: DatabaseCondition[] = conditionDTO.map(
      ([left, operator, right]) => ({
        left: left?.input.value.content,
        operator: operator?.input.value.content,
        right: this.valueExpressionService.toVO(right?.input),
      }),
    );

    set(value, name, condition);

    return value;
  }

  public convertConditionToDTO(name: string, value: any, node: FlowNodeEntity) {
    const condition: DatabaseCondition[] = get(value, name);

    if (!condition) {
      return value;
    }

    const conditionDTO: DatabaseConditionDTO[] = condition.map(
      ({ left, operator, right }) => [
        left
          ? {
              name: 'left',
              input: {
                type: 'string',
                value: {
                  type: ValueExpressionType.LITERAL,
                  content: left,
                },
              },
            }
          : undefined,
        operator
          ? {
              // The translation of operators is not uniform, so operation is used here for the time being
              name: 'operation',
              input: {
                type: 'string',
                value: {
                  type: ValueExpressionType.LITERAL,
                  content: operator,
                },
              },
            }
          : undefined,
        right
          ? {
              name: 'right',
              input: this.valueExpressionService.toDTO(right, node),
            }
          : undefined,
      ],
    );

    set(value, name, conditionDTO);

    return value;
  }

  public convertConditionLogicDTOToConditionLogic(name: string, value: any) {
    const conditionLogicDTO: ConditionLogicDTO = get(value, name);

    const conditionLogic: ConditionLogic =
      conditionLogicDTO === ConditionLogicDTO.AND
        ? ConditionLogic.AND
        : ConditionLogic.OR;

    set(value, name, conditionLogic);

    return value;
  }

  public convertConditionLogicToConditionLogicDTO(name: string, value: any) {
    const conditionLogic: ConditionLogic = get(value, name);

    const conditionLogicDTO: ConditionLogicDTO =
      conditionLogic === ConditionLogic.AND
        ? ConditionLogicDTO.AND
        : ConditionLogicDTO.OR;

    set(value, name, conditionLogicDTO);

    return value;
  }

  public checkConditionOperatorNoNeedRight(
    conditionOperator?: ConditionOperator,
  ) {
    return ['IS_NULL', 'IS_NOT_NULL', 'BE_TRUE', 'BE_FALSE'].includes(
      conditionOperator || '',
    );
  }

  get state() {
    return this.store.getState();
  }

  set loading(v: boolean) {
    this.store.setState({
      loading: v,
    });
  }

  async load(id: string) {
    if (!id) {
      return;
    }
    try {
      this.loading = true;
      const data = await workflowQueryClient.fetchQuery({
        queryKey: ['MemoryApi.GetDatabaseByID', id],
        queryFn: async () =>
          await MemoryApi.GetDatabaseByID({ id, need_sys_fields: true }),
        staleTime: STALE_TIME,
      });
      this.state.setData(id, data);
    } catch (error) {
      this.state.setError(id, error);
      this.state.setData(id, {
        database_info: {
          id,
          table_name: I18n.t('invalid_database', {}, '无效数据库'),
        },
        BaseResp: {},
      });
    } finally {
      this.loading = false;
    }
  }

  clearDatabaseError(id: string) {
    this.state.clearError(id);
  }
}

import { injectable } from 'inversify';
import { isObject, type SchemaDecoration, Emitter } from '@flowgram-adapter/common';

import { type PreferenceSchema } from './preference-contribution';

@injectable()
class PreferencesManager {
  private readonly preferences: Record<string, any> = {};

  readonly schema: PreferenceSchema = {
    properties: {},
  };

  private readonly preferencesChange = new Emitter<void>();

  onDidPreferencesChange = this.preferencesChange.event;

  public init(data: any) {
    /**
     * 从远程或者本地读取用户配置
     */
    Object.assign(this.preferences, data);
    this.preferencesChange.fire();
  }

  public setSchema(schema: PreferenceSchema) {
    const { properties } = schema;
    /** 这里先做简单校验，后面要做整个 validateSchema */
    if (!properties || !isObject(properties)) {
      return;
    }
    Object.entries<SchemaDecoration>(properties).forEach(([key, value]) => {
      if (this.schema.properties[key]) {
        // 重复定义的不覆盖，先报个警告
        console.error(
          'Preference name collision detected in the schema for property: ',
          key,
        );
        return;
      }
      this.schema.properties[key] = value;
    });
  }

  getPreferenceData(key: string) {
    return this.preferences[key];
  }
}

export { PreferencesManager };

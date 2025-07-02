import { type SchemaDecoration } from '@flowgram-adapter/common';

interface PreferenceSchema {
  properties: Record<string, SchemaDecoration>;
}

interface PreferenceContribution {
  configuration: PreferenceSchema;
}

const PreferenceContribution = Symbol('PreferenceContribution');

export { PreferenceContribution, type PreferenceSchema };

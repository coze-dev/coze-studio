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

/* eslint-disable @typescript-eslint/naming-convention */
import type { SetRequired } from 'type-fest';
import type { Draft } from 'immer';
import { castDraft } from 'immer';
import { logger } from '@coze-arch/logger';

import { featureRegistryManager } from './feature-registry-manager';
import { ExternalStore } from './external-store';

export type FeatureModule<Type, Module> = Module & {
  type: Type | string; // By default, add the type field to the Module, which is convenient as the key of the component
};

export interface FeatureConfig<Type, Module> {
  type: Type | string;
  module?: Module;
  loader?: () => Promise<{ default: Module }>;
  tags?: string[]; // Usually Used for Feature Grouping
}

export interface DefaultFeatureConfig<Type, Module>
  extends FeatureConfig<Type, Module> {
  module: Module;
}

// Get the Feature type that should be used by parsing the context
export interface FeatureTypeParser<Type, Context> {
  (context: Context): Type | string;
}

export interface FeatureRegistryConfig<Type, Module, Context> {
  name: string;
  defaultFeature?: DefaultFeatureConfig<Type, Module>;
  features?: FeatureConfig<Type, Module>[];
  featureTypeParser?: FeatureTypeParser<Type, Context>;
}

export interface FeatureTypeInternalThisType<Type> {
  internalHas: (type: Type | string) => boolean;
}

export type Disposer = () => void;

export class FeatureRegistry<
  Type,
  Module,
  Context = undefined,
> extends ExternalStore<{
  featureMap: Map<string, FeatureConfig<Type, Module>>;
}> {
  protected name: string;
  protected _state: {
    featureMap: Map<string, FeatureConfig<Type, Module>>;
  };
  protected featureTypeParser: FeatureTypeParser<Type, Context> | undefined;
  private defaultFeature: DefaultFeatureConfig<Type, Module> | undefined;
  protected get featureMap() {
    return this._state.featureMap;
  }

  constructor(config: FeatureRegistryConfig<Type, Module, Context>) {
    super();
    const { name, defaultFeature, features, featureTypeParser } = config;
    this.name = name;
    this._state = { featureMap: new Map() };
    if (defaultFeature) {
      this.setDefaultFeature(defaultFeature);
    }
    if (features) {
      this.registerSome(features);
    }
    if (featureTypeParser) {
      this.setFeatureTypeParser(featureTypeParser);
    }
    IS_DEV_MODE && featureRegistryManager.add(this);
  }

  private getFeature(
    type: Type | string,
  ): FeatureConfig<Type, Module> | undefined {
    const key = this.getFeatureKey(type);
    const feature = this.featureMap.get(key);
    if (!feature) {
      logger.error({
        error: new Error(
          `[Message Feature]: ${this.name} get feature not exist ${type}`,
        ),
      });
      return;
    }
    return feature;
  }

  private getFeatureKey(type: Type | string) {
    return `feature_${this.name}_${type}`;
  }

  getName() {
    return this.name;
  }

  private _register(
    draft: Draft<{
      featureMap: Map<string, FeatureConfig<Type, Module>>;
    }>,
    feature: FeatureConfig<Type, Module>,
  ) {
    const { defaultFeature } = this;
    const { type } = feature;
    const key = this.getFeatureKey(type);
    if (defaultFeature && type === defaultFeature.type) {
      logger.error({
        error: new Error(
          `[Message Feature]: ${this.name} register type is default feature ${type}`,
        ),
      });
      return;
    }
    if (this._state.featureMap.get(key)) {
      logger.warning(
        `[Message Feature]: ${this.name} register feature already registered ${type}`,
      );
    }
    draft.featureMap.set(key, castDraft(feature));
  }

  register(feature: FeatureConfig<Type, Module>): () => void {
    this._produce(draft => {
      this._register(draft, feature);
    });
    return () => {
      this._produce(draft => {
        this._deregister(draft, feature.type);
      });
    };
  }

  registerSome(features: FeatureConfig<Type, Module>[]) {
    this._produce(draft => {
      features.map(f => this._register(draft, f));
    });
    return () => {
      this._produce(draft => {
        features.forEach(feature => {
          this._deregister(draft, feature.type);
        });
      });
    };
  }

  private _deregister(
    draft: Draft<{
      featureMap: Map<string, FeatureConfig<Type, Module>>;
    }>,
    type: Type | string,
  ) {
    const { defaultFeature } = this;
    const key = this.getFeatureKey(type);
    if (defaultFeature && type === defaultFeature.type) {
      logger.error({
        error: new Error(
          `[Message Feature]: ${this.name} deregister type is default feature ${type}`,
        ),
      });
      return;
    }
    if (!this._state.featureMap.get(key)) {
      logger.error({
        error: new Error(
          `[Message Feature]: ${this.name} deregister invalid feature ${type}`,
        ),
      });
      return;
    }
    draft.featureMap.delete(key);
  }

  deregister(type: Type | string) {
    this._produce(draft => {
      this._deregister(draft, type);
    });
  }

  deregisterSome(types: (Type | string)[]) {
    this._produce(draft => {
      types.forEach(type => {
        this._deregister(draft, type);
      });
    });
  }

  deregisterAll() {
    this._produce(draft => {
      draft.featureMap = new Map();
    });
  }

  // Feature loader to load component
  async load(type: Type | string): Promise<void> {
    const feature = this.getFeature(type);
    if (!feature) {
      logger.error({
        error: new Error(
          `[Message Feature]: ${this.name} load unknown feature ${type}`,
        ),
      });
      return;
    }
    if (!feature.loader) {
      logger.error({
        error: new Error(
          `[Message Feature]: ${this.name} load feature loader unset ${type}`,
        ),
      });
      return;
    }
    const module = await feature.loader();
    this._produce(draft => {
      const loadedFeature = draft.featureMap.get(this.getFeatureKey(type));
      if (loadedFeature) {
        loadedFeature.module = castDraft(module.default);
      }
    });
  }

  // Determine whether the Feature has been loaded
  isLoaded(type: Type | string): boolean {
    const feature = this.getFeature(type);
    if (!feature) {
      logger.error({
        error: new Error(
          `[Message Feature]: ${this.name} isLoaded unknown feature ${type}`,
        ),
      });
      return false;
    }
    if (!feature.module) {
      return false;
    }
    return true;
  }

  // Features Registration
  has(type: Type | string): boolean {
    return Boolean(this.getFeature(type));
  }

  /**
   * Get Feature Modules
   *
   * @param type Feature type
   * @Returns undefined if Feature does not exist or Feature. Module is empty
   */
  getModule(type: Type | string): Module | undefined {
    const feature = this.getFeature(type);
    if (!feature) {
      logger.error({
        error: new Error(
          `[Message Feature][getModule]: ${this.name} get feature not exist ${type}`,
        ),
      });
      return;
    }
    if (!feature.module) {
      logger.error({
        error: new Error(
          `[Message Feature][getModule]: ${this.name} get feature module unset ${type}`,
        ),
      });
      return;
    }
    return feature.module;
  }

  /**
   * Get Feature Modules
   *
   * @Deprecated [Note!] Be careful when using this method, because it will cause the type field of the module to be overwritten, use the'getModule () 'method
   */
  get(type: Type | string): FeatureModule<Type, Module> | undefined {
    const feature = this.getFeature(type);
    if (!feature) {
      logger.error({
        error: new Error(
          `[Message Feature][get]: ${this.name} get feature not exist ${type}`,
        ),
      });
      return;
    }
    if (!feature.module) {
      logger.error({
        error: new Error(
          `[Message Feature][get]: ${this.name} get feature module unset ${type}`,
        ),
      });
      return;
    }
    return { ...feature.module, type };
  }

  async getAsync(
    type: Type | string,
  ): Promise<FeatureModule<Type, Module> | undefined> {
    const feature = this.getFeature(type);
    if (!feature) {
      logger.error({
        error: new Error(
          `[Message Feature]: ${this.name} getAsync unknown feature ${type}`,
        ),
      });
      return;
    }
    if (!feature.module) {
      await this.load(type);
    }
    return this.get(type);
  }

  /**
   * Get entries for all Feature modules, key is feature type, value is feature module
   */
  entries(): [Type | string, Module][] {
    const { featureMap } = this;
    const features = [...featureMap.values()];
    return features
      .filter((feature): feature is SetRequired<typeof feature, 'module'> => {
        if (!feature.module) {
          logger.warning(
            `[Message Feature][entries]: ${this.name} entries module unloaded feature.type=${feature.type}`,
          );
        }
        return feature.module !== null && feature.module !== undefined;
      })
      .map(feature => [feature.type, feature.module]);
  }

  async getAllAsync(): Promise<FeatureModule<Type, Module>[]> {
    const { featureMap } = this;
    const features = [...featureMap.values()];
    const modules = await Promise.all(
      features.map(feature => this.getAsync(feature.type)),
    );
    return modules.filter(module => Boolean(module)) as FeatureModule<
      Type,
      Module
    >[];
  }

  // Get the corresponding Feature type through context
  getTypeByContext(context: Context): Type | string {
    const { featureTypeParser } = this;
    if (!featureTypeParser) {
      logger.error({
        error: new Error(
          `[Message Feature]: ${this.name} getTypeByContext featureTypeParser unset`,
        ),
      });
      return this.getDefaultType() ?? '';
    }
    try {
      return featureTypeParser(context);
    } catch (err) {
      logger.error({
        error: new Error(
          `[Message Feature]: ${this.name} getTypeByContext featureTypeParser error ${err}`,
        ),
      });
      return this.getDefaultType() ?? '';
    }
  }

  // Get the corresponding Feature module through the context
  getByContext(context: Context): FeatureModule<Type, Module> | undefined {
    const type = this.getTypeByContext(context);
    return this.get(type);
  }

  async getByContextAsync(
    context: Context,
  ): Promise<FeatureModule<Type, Module> | undefined> {
    const type = this.getTypeByContext(context);
    return this.getAsync(type);
  }

  // Get Default Feature Module
  getDefault(): FeatureModule<Type, Module> | undefined {
    if (!this.defaultFeature) {
      return undefined;
    }
    return {
      type: this.defaultFeature.type,
      ...this.defaultFeature.module,
    };
  }

  // Get Default Feature Type
  getDefaultType(): Type | string | undefined {
    return this.defaultFeature?.type;
  }

  // Set Default Features
  setDefaultFeature(feature: DefaultFeatureConfig<Type, Module>) {
    const { type } = feature;
    const key = this.getFeatureKey(type);
    this.defaultFeature = feature;
    this._produce(draft => {
      draft.featureMap.set(key, castDraft(feature));
    });
  }

  // Setting Features Type Resolving Functions
  setFeatureTypeParser(parser: FeatureTypeParser<Type, Context>) {
    this.featureTypeParser = parser.bind({
      /**
       * @internal
       * Non-standard methods of internal exposure has
       * Used to find whether the current type is registered when returning a type.
       * Attention: According to the situation, use it with caution and do not abuse it!
       */
      internalHas: (type: Type | string): boolean => {
        try {
          const key = this.getFeatureKey(type);
          const feature = this.featureMap.get(key);
          return Boolean(feature);
        } catch (err) {
          logger.error({
            error: new Error(
              `[Message Feature]: ${this.name} featureTypeParser internalHas error ${err}`,
            ),
          });
          return false;
        }
      },
    });
  }

  deregisterByTag(tag: string) {
    const { featureMap } = this;
    const features = [...featureMap.values()].filter(f =>
      f.tags?.includes(tag),
    );
    this._produce(draft => {
      features.forEach(feature => {
        this._deregister(draft, feature.type);
      });
    });
  }

  // Get the Feature Module containing the corresponding Tag
  getByTag(tag: string): FeatureModule<Type, Module>[] {
    const { featureMap } = this;
    const features = [...featureMap.values()].filter(feature =>
      feature.tags?.includes(tag),
    );
    if (!features.length) {
      logger.warning(
        `[Message Feature]: ${this.name} getByTag no feature include tag ${tag}`,
      );
      return [];
    }
    return features
      .map(feature => this.get(feature.type))
      .filter((module, index) => {
        if (!module) {
          logger.warning(
            `[Message Feature]: ${this.name} getByTag module unloaded features[index].type=${features[index].type}`,
          );
        }
        return Boolean(module);
      }) as FeatureModule<Type, Module>[];
  }

  async getByTagAsync(tag: string): Promise<FeatureModule<Type, Module>[]> {
    const { featureMap } = this;
    const features = [...featureMap.values()].filter(feature =>
      feature.tags?.includes(tag),
    );
    if (!features.length) {
      logger.warning(
        `[Message Feature]: ${this.name} getByTagAsync no feature include tag ${tag}`,
      );
      return [];
    }
    const modules = await Promise.all(
      features.map(feature => this.getAsync(feature.type)),
    );
    return modules.filter(module => Boolean(module)) as FeatureModule<
      Type,
      Module
    >[];
  }
}

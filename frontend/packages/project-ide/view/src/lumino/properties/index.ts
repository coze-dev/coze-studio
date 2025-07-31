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

// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

/**
 * @packageDocumentation
 * @module properties
 */

/**
 * A class which attaches a value to an external object.
 *
 * #### Notes
 * Attached properties are used to extend the state of an object with
 * semantic data from an unrelated class. They also encapsulate value
 * creation, coercion, and notification.
 *
 * Because attached property values are stored in a hash table, which
 * in turn is stored in a WeakMap keyed on the owner object, there is
 * non-trivial storage overhead involved in their use. The pattern is
 * therefore best used for the storage of rare data.
 */
export class AttachedProperty<T, U> {
  /**
   * Construct a new attached property.
   *
   * @param options - The options for initializing the property.
   */
  constructor(options: AttachedProperty.IOptions<T, U>) {
    this.name = options.name;
    this._create = options.create;
    this._coerce = options.coerce || null;
    this._compare = options.compare || null;
    this._changed = options.changed || null;
  }

  /**
   * The human readable name for the property.
   */
  readonly name: string;

  /**
   * Get the current value of the property for a given owner.
   *
   * @param owner - The property owner of interest.
   *
   * @returns The current value of the property.
   *
   * #### Notes
   * If the value has not yet been set, the default value will be
   * computed and assigned as the current value of the property.
   */
  get(owner: T): U {
    let value: U;
    const map = Private.ensureMap(owner);
    if (this._pid in map) {
      value = map[this._pid];
    } else {
      value = map[this._pid] = this._createValue(owner);
    }
    return value;
  }

  /**
   * Set the current value of the property for a given owner.
   *
   * @param owner - The property owner of interest.
   *
   * @param value - The value for the property.
   *
   * #### Notes
   * If the value has not yet been set, the default value will be
   * computed and used as the previous value for the comparison.
   */
  set(owner: T, value: U): void {
    let oldValue: U;
    const map = Private.ensureMap(owner);
    if (this._pid in map) {
      oldValue = map[this._pid];
    } else {
      oldValue = map[this._pid] = this._createValue(owner);
    }
    const newValue = this._coerceValue(owner, value);
    this._maybeNotify(owner, oldValue, (map[this._pid] = newValue));
  }

  /**
   * Explicitly coerce the current property value for a given owner.
   *
   * @param owner - The property owner of interest.
   *
   * #### Notes
   * If the value has not yet been set, the default value will be
   * computed and used as the previous value for the comparison.
   */
  coerce(owner: T): void {
    let oldValue: U;
    const map = Private.ensureMap(owner);
    if (this._pid in map) {
      oldValue = map[this._pid];
    } else {
      oldValue = map[this._pid] = this._createValue(owner);
    }
    const newValue = this._coerceValue(owner, oldValue);
    this._maybeNotify(owner, oldValue, (map[this._pid] = newValue));
  }

  /**
   * Get or create the default value for the given owner.
   */
  private _createValue(owner: T): U {
    const create = this._create;
    return create(owner);
  }

  /**
   * Coerce the value for the given owner.
   */
  private _coerceValue(owner: T, value: U): U {
    const coerce = this._coerce;
    return coerce ? coerce(owner, value) : value;
  }

  /**
   * Compare the old value and new value for equality.
   */
  private _compareValue(oldValue: U, newValue: U): boolean {
    const compare = this._compare;
    return compare ? compare(oldValue, newValue) : oldValue === newValue;
  }

  /**
   * Run the change notification if the given values are different.
   */
  private _maybeNotify(owner: T, oldValue: U, newValue: U): void {
    const changed = this._changed;
    if (changed && !this._compareValue(oldValue, newValue)) {
      changed(owner, oldValue, newValue);
    }
  }

  private _pid = Private.nextPID();

  private _create: (owner: T) => U;

  private _coerce: ((owner: T, value: U) => U) | null;

  private _compare: ((oldValue: U, newValue: U) => boolean) | null;

  private _changed: ((owner: T, oldValue: U, newValue: U) => void) | null;
}

/**
 * The namespace for the `AttachedProperty` class statics.
 */
export namespace AttachedProperty {
  /**
   * The options object used to initialize an attached property.
   */
  export interface IOptions<T, U> {
    /**
     * The human readable name for the property.
     *
     * #### Notes
     * By convention, this should be the same as the name used to define
     * the public accessor for the property value.
     *
     * This **does not** have an effect on the property lookup behavior.
     * Multiple properties may share the same name without conflict.
     */
    name: string;

    /**
     * A factory function used to create the default property value.
     *
     * #### Notes
     * This will be called whenever the property value is required,
     * but has not yet been set for a given owner.
     */
    create: (owner: T) => U;

    /**
     * A function used to coerce a supplied value into the final value.
     *
     * #### Notes
     * This will be called whenever the property value is changed, or
     * when the property is explicitly coerced. The return value will
     * be used as the final value of the property.
     *
     * This will **not** be called for the initial default value.
     */
    coerce?: (owner: T, value: U) => U;

    /**
     * A function used to compare two values for equality.
     *
     * #### Notes
     * This is called to determine if the property value has changed.
     * It should return `true` if the given values are equivalent, or
     * `false` if they are different.
     *
     * If this is not provided, it defaults to the `===` operator.
     */
    compare?: (oldValue: U, newValue: U) => boolean;

    /**
     * A function called when the property value has changed.
     *
     * #### Notes
     * This will be invoked when the property value is changed and the
     * comparator indicates that the old value is not equal to the new
     * value.
     *
     * This will **not** be called for the initial default value.
     */
    changed?: (owner: T, oldValue: U, newValue: U) => void;
  }

  /**
   * Clear the stored property data for the given owner.
   *
   * @param owner - The property owner of interest.
   *
   * #### Notes
   * This will clear all property values for the owner, but it will
   * **not** run the change notification for any of the properties.
   */
  export function clearData(owner: unknown): void {
    Private.ownerData.delete(owner);
  }
}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * A typedef for a mapping of property id to property value.
   */
  export interface PropertyMap {
    [key: string]: any;
  }

  /**
   * A weak mapping of property owner to property map.
   */
  export const ownerData = new WeakMap<any, PropertyMap>();

  /**
   * A function which computes successive unique property ids.
   */
  export const nextPID = (() => {
    let id = 0;
    return () => {
      const rand = Math.random();
      const stem = `${rand}`.slice(2);
      return `pid-${stem}-${id++}`;
    };
  })();

  /**
   * Lookup the data map for the property owner.
   *
   * This will create the map if one does not already exist.
   */
  export function ensureMap(owner: unknown): PropertyMap {
    let map = ownerData.get(owner);
    if (map) {
      return map;
    }
    map = Object.create(null) as PropertyMap;
    ownerData.set(owner, map);
    return map;
  }
}

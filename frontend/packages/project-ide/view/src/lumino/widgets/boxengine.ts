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
 * A sizer object for use with the box engine layout functions.
 *
 * #### Notes
 * A box sizer holds the geometry information for an object along an
 * arbitrary layout orientation.
 *
 * For best performance, this class should be treated as a raw data
 * struct. It should not typically be subclassed.
 */
export class BoxSizer {
  /**
   * The preferred size for the sizer.
   *
   * #### Notes
   * The sizer will be given this initial size subject to its size
   * bounds. The sizer will not deviate from this size unless such
   * deviation is required to fit into the available layout space.
   *
   * There is no limit to this value, but it will be clamped to the
   * bounds defined by {@link minSize} and {@link maxSize}.
   *
   * The default value is `0`.
   */
  sizeHint = 0;

  /**
   * The minimum size of the sizer.
   *
   * #### Notes
   * The sizer will never be sized less than this value, even if
   * it means the sizer will overflow the available layout space.
   *
   * It is assumed that this value lies in the range `[0, Infinity)`
   * and that it is `<=` to {@link maxSize}. Failure to adhere to this
   * constraint will yield undefined results.
   *
   * The default value is `0`.
   */
  minSize = 0;

  /**
   * The maximum size of the sizer.
   *
   * #### Notes
   * The sizer will never be sized greater than this value, even if
   * it means the sizer will underflow the available layout space.
   *
   * It is assumed that this value lies in the range `[0, Infinity]`
   * and that it is `>=` to {@link minSize}. Failure to adhere to this
   * constraint will yield undefined results.
   *
   * The default value is `Infinity`.
   */
  maxSize = Infinity;

  /**
   * The stretch factor for the sizer.
   *
   * #### Notes
   * This controls how much the sizer stretches relative to its sibling
   * sizers when layout space is distributed. A stretch factor of zero
   * is special and will cause the sizer to only be resized after all
   * other sizers with a stretch factor greater than zero have been
   * resized to their limits.
   *
   * It is assumed that this value is an integer that lies in the range
   * `[0, Infinity)`. Failure to adhere to this constraint will yield
   * undefined results.
   *
   * The default value is `1`.
   */
  stretch = 1;

  /**
   * The computed size of the sizer.
   *
   * #### Notes
   * This value is the output of a call to {@link BoxEngine.calc}. It represents
   * the computed size for the object along the layout orientation,
   * and will always lie in the range `[minSize, maxSize]`.
   *
   * This value is output only.
   *
   * Changing this value will have no effect.
   */
  size = 0;

  /**
   * An internal storage property for the layout algorithm.
   *
   * #### Notes
   * This value is used as temporary storage by the layout algorithm.
   *
   * Changing this value will have no effect.
   */
  done = false;
}

/**
 * The namespace for the box engine layout functions.
 */
export namespace BoxEngine {
  /**
   * Calculate the optimal layout sizes for a sequence of box sizers.
   *
   * This distributes the available layout space among the box sizers
   * according to the following algorithm:
   *
   * 1. Initialize the sizers's size to its size hint and compute the
   *    sums for each of size hint, min size, and max size.
   *
   * 2. If the total size hint equals the available space, return.
   *
   * 3. If the available space is less than the total min size, set all
   *    sizers to their min size and return.
   *
   * 4. If the available space is greater than the total max size, set
   *    all sizers to their max size and return.
   *
   * 5. If the layout space is less than the total size hint, distribute
   *    the negative delta as follows:
   *
   *    a. Shrink each sizer with a stretch factor greater than zero by
   *       an amount proportional to the negative space and the sum of
   *       stretch factors. If the sizer reaches its min size, remove
   *       it and its stretch factor from the computation.
   *
   *    b. If after adjusting all stretch sizers there remains negative
   *       space, distribute the space equally among the sizers with a
   *       stretch factor of zero. If a sizer reaches its min size,
   *       remove it from the computation.
   *
   * 6. If the layout space is greater than the total size hint,
   *    distribute the positive delta as follows:
   *
   *    a. Expand each sizer with a stretch factor greater than zero by
   *       an amount proportional to the postive space and the sum of
   *       stretch factors. If the sizer reaches its max size, remove
   *       it and its stretch factor from the computation.
   *
   *    b. If after adjusting all stretch sizers there remains positive
   *       space, distribute the space equally among the sizers with a
   *       stretch factor of zero. If a sizer reaches its max size,
   *       remove it from the computation.
   *
   * 7. return
   *
   * @param sizers - The sizers for a particular layout line.
   *
   * @param space - The available layout space for the sizers.
   *
   * @returns The delta between the provided available space and the
   *   actual consumed space. This value will be zero if the sizers
   *   can be adjusted to fit, negative if the available space is too
   *   small, and positive if the available space is too large.
   *
   * #### Notes
   * The {@link BoxSizer.size} of each sizer is updated with the computed size.
   *
   * This function can be called at any time to recompute the layout for
   * an existing sequence of sizers. The previously computed results will
   * have no effect on the new output. It is therefore not necessary to
   * create new sizer objects on each resize event.
   */
  export function calc(sizers: ArrayLike<BoxSizer>, space: number): number {
    // Bail early if there is nothing to do.
    const count = sizers.length;
    if (count === 0) {
      return space;
    }

    // Setup the size and stretch counters.
    let totalMin = 0;
    let totalMax = 0;
    let totalSize = 0;
    let totalStretch = 0;
    let stretchCount = 0;

    // Setup the sizers and compute the totals.
    for (let i = 0; i < count; ++i) {
      const sizer = sizers[i];
      const min = sizer.minSize;
      const max = sizer.maxSize;
      const hint = sizer.sizeHint;
      sizer.done = false;
      sizer.size = Math.max(min, Math.min(hint, max));
      totalSize += sizer.size;
      totalMin += min;
      totalMax += max;
      if (sizer.stretch > 0) {
        totalStretch += sizer.stretch;
        stretchCount++;
      }
    }

    // If the space is equal to the total size, return early.
    if (space === totalSize) {
      return 0;
    }

    // If the space is less than the total min, minimize each sizer.
    if (space <= totalMin) {
      for (let i = 0; i < count; ++i) {
        const sizer = sizers[i];
        sizer.size = sizer.minSize;
      }
      return space - totalMin;
    }

    // If the space is greater than the total max, maximize each sizer.
    if (space >= totalMax) {
      for (let i = 0; i < count; ++i) {
        const sizer = sizers[i];
        sizer.size = sizer.maxSize;
      }
      return space - totalMax;
    }

    // The loops below perform sub-pixel precision sizing. A near zero
    // value is used for compares instead of zero to ensure that the
    // loop terminates when the subdivided space is reasonably small.
    const nearZero = 0.01;

    // A counter which is decremented each time a sizer is resized to
    // its limit. This ensures the loops terminate even if there is
    // space remaining to distribute.
    let notDoneCount = count;

    // Distribute negative delta space.
    if (space < totalSize) {
      // Shrink each stretchable sizer by an amount proportional to its
      // stretch factor. If a sizer reaches its min size it's marked as
      // done. The loop progresses in phases where each sizer is given
      // a chance to consume its fair share for the pass, regardless of
      // whether a sizer before it reached its limit. This continues
      // until the stretchable sizers or the free space is exhausted.
      let freeSpace = totalSize - space;
      while (stretchCount > 0 && freeSpace > nearZero) {
        const distSpace = freeSpace;
        const distStretch = totalStretch;
        for (let i = 0; i < count; ++i) {
          const sizer = sizers[i];
          if (sizer.done || sizer.stretch === 0) {
            continue;
          }
          const amt = (sizer.stretch * distSpace) / distStretch;
          if (sizer.size - amt <= sizer.minSize) {
            freeSpace -= sizer.size - sizer.minSize;
            totalStretch -= sizer.stretch;
            sizer.size = sizer.minSize;
            sizer.done = true;
            notDoneCount--;
            stretchCount--;
          } else {
            freeSpace -= amt;
            sizer.size -= amt;
          }
        }
      }
      // Distribute any remaining space evenly among the non-stretchable
      // sizers. This progresses in phases in the same manner as above.
      while (notDoneCount > 0 && freeSpace > nearZero) {
        const amt = freeSpace / notDoneCount;
        for (let i = 0; i < count; ++i) {
          const sizer = sizers[i];
          if (sizer.done) {
            continue;
          }
          if (sizer.size - amt <= sizer.minSize) {
            freeSpace -= sizer.size - sizer.minSize;
            sizer.size = sizer.minSize;
            sizer.done = true;
            notDoneCount--;
          } else {
            freeSpace -= amt;
            sizer.size -= amt;
          }
        }
      }
    }
    // Distribute positive delta space.
    else {
      // Expand each stretchable sizer by an amount proportional to its
      // stretch factor. If a sizer reaches its max size it's marked as
      // done. The loop progresses in phases where each sizer is given
      // a chance to consume its fair share for the pass, regardless of
      // whether a sizer before it reached its limit. This continues
      // until the stretchable sizers or the free space is exhausted.
      let freeSpace = space - totalSize;
      while (stretchCount > 0 && freeSpace > nearZero) {
        const distSpace = freeSpace;
        const distStretch = totalStretch;
        for (let i = 0; i < count; ++i) {
          const sizer = sizers[i];
          if (sizer.done || sizer.stretch === 0) {
            continue;
          }
          const amt = (sizer.stretch * distSpace) / distStretch;
          if (sizer.size + amt >= sizer.maxSize) {
            freeSpace -= sizer.maxSize - sizer.size;
            totalStretch -= sizer.stretch;
            sizer.size = sizer.maxSize;
            sizer.done = true;
            notDoneCount--;
            stretchCount--;
          } else {
            freeSpace -= amt;
            sizer.size += amt;
          }
        }
      }
      // Distribute any remaining space evenly among the non-stretchable
      // sizers. This progresses in phases in the same manner as above.
      while (notDoneCount > 0 && freeSpace > nearZero) {
        const amt = freeSpace / notDoneCount;
        for (let i = 0; i < count; ++i) {
          const sizer = sizers[i];
          if (sizer.done) {
            continue;
          }
          if (sizer.size + amt >= sizer.maxSize) {
            freeSpace -= sizer.maxSize - sizer.size;
            sizer.size = sizer.maxSize;
            sizer.done = true;
            notDoneCount--;
          } else {
            freeSpace -= amt;
            sizer.size += amt;
          }
        }
      }
    }

    // Indicate that the consumed space equals the available space.
    return 0;
  }

  /**
   * Adjust a sizer by a delta and update its neighbors accordingly.
   *
   * @param sizers - The sizers which should be adjusted.
   *
   * @param index - The index of the sizer to grow.
   *
   * @param delta - The amount to adjust the sizer, positive or negative.
   *
   * #### Notes
   * This will adjust the indicated sizer by the specified amount, along
   * with the sizes of the appropriate neighbors, subject to the limits
   * specified by each of the sizers.
   *
   * This is useful when implementing box layouts where the boundaries
   * between the sizers are interactively adjustable by the user.
   */
  export function adjust(
    sizers: ArrayLike<BoxSizer>,
    index: number,
    delta: number,
  ): void {
    // Bail early when there is nothing to do.
    if (sizers.length === 0 || delta === 0) {
      return;
    }

    // Dispatch to the proper implementation.
    if (delta > 0) {
      growSizer(sizers, index, delta);
    } else {
      shrinkSizer(sizers, index, -delta);
    }
  }

  /**
   * Grow a sizer by a positive delta and adjust neighbors.
   */
  function growSizer(
    sizers: ArrayLike<BoxSizer>,
    index: number,
    delta: number,
  ): void {
    // Compute how much the items to the left can expand.
    let growLimit = 0;
    for (let i = 0; i <= index; ++i) {
      const sizer = sizers[i];
      growLimit += sizer.maxSize - sizer.size;
    }

    // Compute how much the items to the right can shrink.
    let shrinkLimit = 0;
    for (let i = index + 1, n = sizers.length; i < n; ++i) {
      const sizer = sizers[i];
      shrinkLimit += sizer.size - sizer.minSize;
    }

    // Clamp the delta adjustment to the limits.
    delta = Math.min(delta, growLimit, shrinkLimit);

    // Grow the sizers to the left by the delta.
    let grow = delta;
    for (let i = index; i >= 0 && grow > 0; --i) {
      const sizer = sizers[i];
      const limit = sizer.maxSize - sizer.size;
      if (limit >= grow) {
        sizer.sizeHint = sizer.size + grow;
        grow = 0;
      } else {
        sizer.sizeHint = sizer.size + limit;
        grow -= limit;
      }
    }

    // Shrink the sizers to the right by the delta.
    let shrink = delta;
    for (let i = index + 1, n = sizers.length; i < n && shrink > 0; ++i) {
      const sizer = sizers[i];
      const limit = sizer.size - sizer.minSize;
      if (limit >= shrink) {
        sizer.sizeHint = sizer.size - shrink;
        shrink = 0;
      } else {
        sizer.sizeHint = sizer.size - limit;
        shrink -= limit;
      }
    }
  }

  /**
   * Shrink a sizer by a positive delta and adjust neighbors.
   */
  function shrinkSizer(
    sizers: ArrayLike<BoxSizer>,
    index: number,
    delta: number,
  ): void {
    // Compute how much the items to the right can expand.
    let growLimit = 0;
    for (let i = index + 1, n = sizers.length; i < n; ++i) {
      const sizer = sizers[i];
      growLimit += sizer.maxSize - sizer.size;
    }

    // Compute how much the items to the left can shrink.
    let shrinkLimit = 0;
    for (let i = 0; i <= index; ++i) {
      const sizer = sizers[i];
      shrinkLimit += sizer.size - sizer.minSize;
    }

    // Clamp the delta adjustment to the limits.
    delta = Math.min(delta, growLimit, shrinkLimit);

    // Grow the sizers to the right by the delta.
    let grow = delta;
    for (let i = index + 1, n = sizers.length; i < n && grow > 0; ++i) {
      const sizer = sizers[i];
      const limit = sizer.maxSize - sizer.size;
      if (limit >= grow) {
        sizer.sizeHint = sizer.size + grow;
        grow = 0;
      } else {
        sizer.sizeHint = sizer.size + limit;
        grow -= limit;
      }
    }

    // Shrink the sizers to the left by the delta.
    let shrink = delta;
    for (let i = index; i >= 0 && shrink > 0; --i) {
      const sizer = sizers[i];
      const limit = sizer.size - sizer.minSize;
      if (limit >= shrink) {
        sizer.sizeHint = sizer.size - shrink;
        shrink = 0;
      } else {
        sizer.sizeHint = sizer.size - limit;
        shrink -= limit;
      }
    }
  }
}

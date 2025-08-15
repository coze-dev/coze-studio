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

package maps

func ToAnyValue[K comparable, V any](m map[K]V) map[K]any {
	n := make(map[K]any, len(m))
	for k, v := range m {
		n[k] = v
	}

	return n
}

func TransformKey[K1, K2 comparable, V any](m map[K1]V, f func(K1) K2) map[K2]V {
	n := make(map[K2]V, len(m))
	for k1, v := range m {
		n[f(k1)] = v
	}
	return n
}

func TransformKeyWithErrorCheck[K1, K2 comparable, V any](m map[K1]V, f func(K1) (K2, error)) (map[K2]V, error) {
	n := make(map[K2]V, len(m))
	for k1, v := range m {
		k2, err := f(k1)
		if err != nil {
			return nil, err
		}
		n[k2] = v
	}
	return n, nil
}

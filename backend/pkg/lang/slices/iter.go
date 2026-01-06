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

package slices

func Transform[A, B any](src []A, fn func(A) B) []B {
	if src == nil {
		return nil
	}

	dst := make([]B, 0, len(src))
	for _, a := range src {
		dst = append(dst, fn(a))
	}

	return dst
}

func Contains[T comparable](src []T, item T) bool {
	if src == nil {
		return false
	}
	for _, s := range src {
		if s == item {
			return true
		}
	}
	return false
}
func TransformWithErrorCheck[A, B any](src []A, fn func(A) (B, error)) ([]B, error) {
	if src == nil {
		return nil, nil
	}

	dst := make([]B, 0, len(src))
	for _, a := range src {
		item, err := fn(a)
		if err != nil {
			return nil, err
		}
		dst = append(dst, item)
	}

	return dst, nil
}

func GroupBy[A, K comparable, V any](src []A, fn func(A) (K, V)) map[K][]V {
	if src == nil {
		return nil
	}
	dst := make(map[K][]V, len(src))
	for _, a := range src {
		k, v := fn(a)
		dst[k] = append(dst[k], v)
	}
	return dst
}

func Unique[T comparable](src []T) []T {
	if src == nil {
		return nil
	}
	dst := make([]T, 0, len(src))
	m := make(map[T]struct{}, len(src))
	for _, s := range src {
		if _, ok := m[s]; ok {
			continue
		}
		dst = append(dst, s)
		m[s] = struct{}{}
	}

	return dst
}

func Fill[T any](val T, size int) []T {
	slice := make([]T, size)
	for i := 0; i < size; i++ {
		slice[i] = val
	}
	return slice
}

func Chunks[T any](s []T, chunkSize int) [][]T {
	sliceLen := len(s)
	chunks := make([][]T, 0, sliceLen/chunkSize)

	for start := 0; start < sliceLen; start += chunkSize {
		end := start + chunkSize
		if end > sliceLen {
			end = sliceLen
		}

		chunks = append(chunks, s[start:end])
	}

	return chunks
}

func ToMap[E any, K comparable, V any](src []E, fn func(e E) (K, V)) map[K]V {
	if src == nil {
		return nil
	}

	dst := make(map[K]V, len(src))
	for _, e := range src {
		k, v := fn(e)
		dst[k] = v
	}

	return dst
}

func Reverse[T any](slice []T) []T {
	left := 0
	right := len(slice) - 1
	for left < right {
		slice[left], slice[right] = slice[right], slice[left]
		left++
		right--
	}
	return slice
}

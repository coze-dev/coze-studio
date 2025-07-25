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

package sets

type Set[T comparable] map[T]struct{}

func FromSlice[T comparable](s []T) Set[T] {
	set := make(Set[T], len(s))
	for _, elem := range s {
		cpElem := elem
		set[cpElem] = struct{}{}
	}
	return set
}

func (s Set[T]) ToSlice() []T {
	sl := make([]T, 0, len(s))
	for elem := range s {
		cpElem := elem
		sl = append(sl, cpElem)
	}
	return sl
}

func (s Set[T]) Contains(elem T) bool {
	_, ok := s[elem]
	return ok
}

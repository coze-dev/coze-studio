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

package kvstore

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"

	"gorm.io/gorm"
)

var ErrKeyNotFound = errors.New("key not found")

/*
CREATE TABLE IF NOT EXISTS `kv_entries` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `namespace` VARCHAR(255) NOT NULL,
  `key_data` VARCHAR(255) NOT NULL,
  `value_data` MEDIUMBLOB NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_namespace_key` (`namespace`, `key_data`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_general_ci COMMENT 'kv data';
*/

type KVStore[T any] struct {
	repo *gorm.DB
}

func New[T any](db *gorm.DB) *KVStore[T] {
	return &KVStore[T]{
		repo: db,
	}
}

func (g *KVStore[T]) Save(ctx context.Context, namespace, k string, v *T) error {
	if v == nil {
		return fmt.Errorf("cannot save nil value for key: %s", k)
	}

	data, err := json.Marshal(v)
	if err != nil {
		return fmt.Errorf("marshal failed for key %s for type %T: %w", k, *v, err)
	}

	res := g.repo.WithContext(ctx).Exec(
		"INSERT INTO `kv_entries` (`namespace`, `key_data`, `value_data`) VALUES (?, ?, ?) "+
			"AS new ON DUPLICATE KEY UPDATE value_data = new.value_data",
		namespace, k, data,
	)

	if res.Error != nil {
		return fmt.Errorf("failed to save key %s: %w", k, res.Error)
	}

	return nil
}

func (g *KVStore[T]) Get(ctx context.Context, namespace, k string) (*T, error) {
	var obj T

	row := g.repo.WithContext(ctx).Raw(
		"SELECT `value_data` FROM `kv_entries` WHERE `namespace` = ? AND `key_data` = ? LIMIT 1",
		namespace, k,
	).Row()

	var value []byte
	if err := row.Scan(&value); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrKeyNotFound
		}
		return nil, fmt.Errorf("failed to get key %s: %w", k, err)
	}

	if err := json.Unmarshal(value, &obj); err != nil {
		return nil, fmt.Errorf("failed to unmarshal json for key %s: %w", k, err)
	}

	return &obj, nil
}

func (g *KVStore[T]) Delete(ctx context.Context, namespace, k string) error {
	res := g.repo.WithContext(ctx).Exec(
		"DELETE FROM `kv_entries` WHERE `namespace` = ? AND `key_data` = ?",
		namespace, k,
	)

	return res.Error
}

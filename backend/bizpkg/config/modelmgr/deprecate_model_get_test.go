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

package modelmgr

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestToNewModelNilConnConfig(t *testing.T) {
	old := &OldModel{
		ID:   1,
		Name: "model-without-conn-config",
		Meta: ModelOldMeta{
			Protocol: ProtocolOllama,
			// ConnConfig is nil — e.g. a yaml that omits meta.conn_config.
		},
	}

	// Must return a clear error instead of panicking on a nil dereference.
	m, err := toNewModel(old)
	require.Error(t, err)
	require.Nil(t, m)
	require.Contains(t, err.Error(), "conn_config")
}

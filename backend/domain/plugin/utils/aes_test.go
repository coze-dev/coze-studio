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

package utils

import (
	"testing"

	"github.com/bytedance/mockey"
	"github.com/stretchr/testify/assert"
)

func TestDecryptByAES(t *testing.T) {
	mockey.PatchConvey("unsafe encryption compatibility", t, func() {
		secret := "test_secret_1234"
		plaintext := []byte("test_plaintext")

		encrypted, err := UnsafeEncryptByAES(plaintext, secret)
		assert.NoError(t, err)

		decrypted, err := DecryptByAES(encrypted, secret)
		assert.NoError(t, err)
		assert.Equal(t, plaintext, decrypted)
	})

	mockey.PatchConvey("safe encryption", t, func() {
		secret := "test_secret_1234"
		plaintext := []byte("test_plaintext")

		encrypted, err := EncryptByAES(plaintext, secret)
		assert.NoError(t, err)

		decrypted, err := DecryptByAES(encrypted, secret)
		assert.NoError(t, err)
		assert.Equal(t, plaintext, decrypted)
	})
}

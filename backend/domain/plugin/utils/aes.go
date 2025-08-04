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
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"

	"github.com/bytedance/gopkg/util/logger"
)

const (
	AuthSecretEnv       = "PLUGIN_AES_AUTH_SECRET"
	StateSecretEnv      = "PLUGIN_AES_STATE_SECRET"
	OAuthTokenSecretEnv = "PLUGIN_AES_OAUTH_TOKEN_SECRET"
)

const encryptVersion = "aes-cbc-v1"

// In order to be compatible with the problem of no existing env configuration,
// these default values are temporarily retained.
const (
	// Deprecated. Configuring AuthSecretEnv in env instead.
	DefaultAuthSecret = "^*6x3hdu2nc%-p38"
	// Deprecated. Configuring StateSecretEnv in env instead.
	DefaultStateSecret = "osj^kfhsd*(z!sno"
	// Deprecated. Configuring OAuthTokenSecretEnv in env instead.
	DefaultOAuthTokenSecret = "cn+$PJ(HhJ[5d*z9"
)

type AESEncryption struct {
	Version       string `json:"version"`
	IV            []byte `json:"iv"`
	EncryptedData []byte `json:"encrypted_data"`
}

func EncryptByAES(val []byte, secret string) (string, error) {
	if secret == "" {
		return "", fmt.Errorf("secret is required")
	}

	sb := []byte(secret)

	block, err := aes.NewCipher(sb)
	if err != nil {
		return "", err
	}

	blockSize := block.BlockSize()
	paddingData := pkcs7Padding(val, blockSize)

	iv := make([]byte, blockSize)
	if _, err = io.ReadFull(rand.Reader, iv); err != nil {
		return "", err
	}

	encrypted := make([]byte, len(paddingData))
	blockMode := cipher.NewCBCEncrypter(block, iv)
	blockMode.CryptBlocks(encrypted, paddingData)

	en := &AESEncryption{
		Version:       encryptVersion,
		IV:            iv,
		EncryptedData: encrypted,
	}

	encrypted, err = json.Marshal(en)
	if err != nil {
		return "", err
	}

	return base64.RawURLEncoding.EncodeToString(encrypted), nil
}

func pkcs7Padding(data []byte, blockSize int) []byte {
	padding := blockSize - len(data)%blockSize
	padText := bytes.Repeat([]byte{byte(padding)}, padding)

	return append(data, padText...)
}

func DecryptByAES(data, secret string) ([]byte, error) {
	if secret == "" {
		return nil, fmt.Errorf("secret is required")
	}

	enBytes, err := base64.RawURLEncoding.DecodeString(data)
	if err != nil {
		return nil, err
	}

	en := &AESEncryption{}
	err = json.Unmarshal(enBytes, &en)
	if err != nil { // fallback to unsafeEncryptByAES
		logger.Warnf("failed to unmarshal encrypted data, fallback to unsafeEncryptByAES: %v", err)
		return UnsafeDecryptByAES(data, secret)
	}

	sb := []byte(secret)

	block, err := aes.NewCipher(sb)
	if err != nil {
		return nil, err
	}

	blockMode := cipher.NewCBCDecrypter(block, en.IV)

	if len(en.EncryptedData)%blockMode.BlockSize() != 0 {
		return nil, fmt.Errorf("invalid block size")
	}

	decrypted := make([]byte, len(en.EncryptedData))
	blockMode.CryptBlocks(decrypted, en.EncryptedData)

	decrypted, err = pkcs7UnPadding(decrypted)
	if err != nil {
		return nil, err
	}

	return decrypted, nil
}

// Deprecated: use EncryptByAES instead
// UnsafeEncryptByAES is an insecure encryption method,
// because the iv is fixed using the first 16 bits of the secret.
func UnsafeEncryptByAES(val []byte, secret string) (string, error) {
	sb := []byte(secret)

	block, err := aes.NewCipher(sb)
	if err != nil {
		return "", err
	}

	blockSize := block.BlockSize()
	paddingData := pkcs7Padding(val, blockSize)

	encrypted := make([]byte, len(paddingData))
	blockMode := cipher.NewCBCEncrypter(block, sb[:blockSize])
	blockMode.CryptBlocks(encrypted, paddingData)

	return base64.RawURLEncoding.EncodeToString(encrypted), nil
}

// Deprecated: use DecryptByAES instead
// UnsafeDecryptByAES is an insecure decryption method,
// because the iv is fixed using the first 16 bits of the secret.
// In order to be compatible with existing data that has been encrypted by UnsafeEncryptByAES,
// this method is retained as a fallback decryption method.
func UnsafeDecryptByAES(data, secret string) ([]byte, error) {
	dataBytes, err := base64.RawURLEncoding.DecodeString(data)
	if err != nil {
		return nil, err
	}

	sb := []byte(secret)

	block, err := aes.NewCipher(sb)
	if err != nil {
		return nil, err
	}

	blockSize := block.BlockSize()
	blockMode := cipher.NewCBCDecrypter(block, sb[:blockSize])
	if len(dataBytes)%blockMode.BlockSize() != 0 {
		return nil, fmt.Errorf("invalid block size")
	}

	decrypted := make([]byte, len(dataBytes))
	blockMode.CryptBlocks(decrypted, dataBytes)

	decrypted, err = pkcs7UnPadding(decrypted)
	if err != nil {
		return nil, err
	}

	return decrypted, nil
}

func pkcs7UnPadding(decrypted []byte) ([]byte, error) {
	length := len(decrypted)
	if length == 0 {
		return nil, fmt.Errorf("decrypted is empty")
	}

	unPadding := int(decrypted[length-1])
	if unPadding > length {
		return nil, fmt.Errorf("invalid padding")
	}

	return decrypted[:(length - unPadding)], nil
}

package entity

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"encoding/json"
	"fmt"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

type AuthorizationCodeMeta struct {
	UserID   string
	PluginID int64
	IsDraft  bool
}

type AuthorizationCodeInfo struct {
	RecordID             int64
	Meta                 *AuthorizationCodeMeta
	Config               *model.OAuthAuthorizationCodeConfig
	AccessToken          string
	RefreshToken         string
	TokenExpiredAtMS     int64
	NextTokenRefreshAtMS *int64
	LastActiveAtMS       int64
}

func (a *AuthorizationCodeInfo) GetNextTokenRefreshAtMS() int64 {
	if a == nil {
		return 0
	}
	return ptr.FromOrDefault(a.NextTokenRefreshAtMS, 0)
}

type OAuthInfo struct {
	OAuthMode         model.AuthzSubType
	AuthorizationCode *AuthorizationCodeInfo
}

const stateSecretKey = "osj^kfhsd*(z!sno"

type State struct {
	ClientName OAuthProvider `json:"client_name"`
	UserID     string        `json:"user_id"`
	PluginID   int64         `json:"plugin_id"`
	IsDraft    bool          `json:"is_draft"`
}

func (s State) EncryptState() (string, error) {
	data, err := json.Marshal(s)
	if err != nil {
		return "", err
	}

	encrypted, err := encryptByAes(data)
	if err != nil {
		return "", err
	}

	return encrypted, nil
}

func encryptByAes(data []byte) (string, error) {
	keyBytes := []byte(stateSecretKey)

	block, err := aes.NewCipher(keyBytes)
	if err != nil {
		return "", err
	}

	blockSize := block.BlockSize()
	paddingData := pkcs7Padding(data, blockSize)

	encrypted := make([]byte, len(paddingData))
	blockMode := cipher.NewCBCEncrypter(block, keyBytes[:blockSize])
	blockMode.CryptBlocks(encrypted, paddingData)

	return base64.RawURLEncoding.EncodeToString(encrypted), nil
}

func pkcs7Padding(data []byte, blockSize int) []byte {
	padding := blockSize - len(data)%blockSize
	padText := bytes.Repeat([]byte{byte(padding)}, padding)

	return append(data, padText...)
}

func DecryptState(data string) (*State, error) {
	decrypted, err := decryptByAes(data)
	if err != nil {
		return nil, err
	}

	state := &State{}
	if err := json.Unmarshal(decrypted, state); err != nil {
		return nil, err
	}

	return state, nil
}

func decryptByAes(data string) ([]byte, error) {
	dataBytes, err := base64.RawURLEncoding.DecodeString(data)
	if err != nil {
		return nil, err
	}

	keyBytes := []byte(stateSecretKey)

	block, err := aes.NewCipher(keyBytes)
	if err != nil {
		return nil, err
	}

	blockSize := block.BlockSize()
	blockMode := cipher.NewCBCDecrypter(block, keyBytes[:blockSize])
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

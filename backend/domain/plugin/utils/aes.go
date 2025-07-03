package utils

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"fmt"
)

func EncryptByAES(val []byte, secretKey string) (string, error) {
	sb := []byte(secretKey)

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

func pkcs7Padding(data []byte, blockSize int) []byte {
	padding := blockSize - len(data)%blockSize
	padText := bytes.Repeat([]byte{byte(padding)}, padding)

	return append(data, padText...)
}

func DecryptByAES(data, secretKey string) ([]byte, error) {
	dataBytes, err := base64.RawURLEncoding.DecodeString(data)
	if err != nil {
		return nil, err
	}

	sb := []byte(secretKey)

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

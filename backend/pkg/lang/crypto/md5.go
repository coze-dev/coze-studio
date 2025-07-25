package crypto

import (
	"crypto/md5"
	"encoding/hex"
)

func MD5HexValue(input string) string {
	md5Hash := md5.Sum([]byte(input))
	return hex.EncodeToString(md5Hash[:])
}

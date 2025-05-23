package conv

import (
	"encoding/json"
	"strconv"

	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

// StrToInt64E returns strconv.ParseInt(v, 10, 64)
func StrToInt64(v string) (int64, error) {
	return strconv.ParseInt(v, 10, 64)
}

// Int64ToStr returns strconv.FormatInt(v, 10) result
func Int64ToStr(v int64) string {
	return strconv.FormatInt(v, 10)
}

// StrToInt64 returns strconv.ParseInt(v, 10, 64)'s value.
// if error occurs, returns defaultValue as result.
func StrToInt64D(v string, defaultValue int64) int64 {
	toV, err := strconv.ParseInt(v, 10, 64)
	if err != nil {
		return defaultValue
	}
	return toV
}

// DebugJsonToStr
func DebugJsonToStr(v interface{}) string {
	b, err := json.Marshal(v)
	if err != nil {
		return ""
	}
	return string(b)
}

func BoolToInt(p bool) int {
	if p == true {
		return 1
	}

	return 0
}

// BoolToIntPointer returns 1 or 0 as pointer
func BoolToIntPointer(p *bool) *int {
	if p == nil {
		return nil
	}

	if *p == true {
		return ptr.Of(int(1))
	}

	return ptr.Of(int(0))
}

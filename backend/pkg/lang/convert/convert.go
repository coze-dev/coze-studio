package convert

import "strconv"

func StringToInt64(s string) int64 {
	vInt64, _ := strconv.ParseInt(s, 10, 64)
	return vInt64
}

func Int64ToString(i int64) string {
	vInt64S := strconv.FormatInt(i, 10)
	return vInt64S
}

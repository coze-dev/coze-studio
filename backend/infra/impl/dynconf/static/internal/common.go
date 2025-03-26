package internal

import (
	"os"
)

func FileExist(name string) (existed bool, isDir bool) {
	info, err := os.Stat(name)
	if err != nil {
		return !os.IsNotExist(err), false
	}

	return true, info.IsDir()
}

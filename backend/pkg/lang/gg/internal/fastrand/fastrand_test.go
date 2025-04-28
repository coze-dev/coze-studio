package fastrand

import (
	"testing"
)

func TestAll(t *testing.T) {
	_ = Uint32()

	p := make([]byte, 1000)
	n, err := Read(p)
	if n != len(p) || err != nil || (p[0] == 0 && p[1] == 0 && p[2] == 0) {
		t.Fatal()
	}

	a := Perm(100)
	for i := range a {
		var find bool
		for _, v := range a {
			if v == i {
				find = true
			}
		}
		if !find {
			t.Fatal()
		}
	}

	Shuffle(len(a), func(i, j int) {
		a[i], a[j] = a[j], a[i]
	})
	for i := range a {
		var find bool
		for _, v := range a {
			if v == i {
				find = true
			}
		}
		if !find {
			t.Fatal()
		}
	}

	Shuffle2(a)
	for i := range a {
		var find bool
		for _, v := range a {
			if v == i {
				find = true
			}
		}
		if !find {
			t.Fatal()
		}
	}
}

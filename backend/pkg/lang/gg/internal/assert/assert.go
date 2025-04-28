// Package provides human readable assertion for automated testing.
//
// Please refer to README.md for details.
package assert

import (
	"bytes"
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"io/ioutil"
	"math"
	"reflect"
	"runtime"
	"runtime/debug"
	"strconv"
	"strings"
	"testing"

	"code.byted.org/flow/opencoze/backend/pkg/lang/gg/internal/constraints"
)

var picker = newFormalArgPicker()

type parsedFile struct {
	src  string
	fset *token.FileSet
	ast  *ast.File
}

type formalArgPicker struct {
	parsedFiles map[string]*parsedFile
}

func newFormalArgPicker() *formalArgPicker {
	return &formalArgPicker{
		parsedFiles: make(map[string]*parsedFile),
	}
}

func (p *formalArgPicker) Pick(skip int, args ...int) ([]ast.Node, []string) {
	// Get caller info from runtime.
	_, file, line, _ := runtime.Caller(skip)
	pc, _, _, _ := runtime.Caller(skip - 1)
	fname := runtime.FuncForPC(pc).Name()

	// Convert full function name to short one:
	// "xxx.com/pkg/pkg.Func" => "pkg.Func"
	strv := strings.Split(fname, "/")
	fname = strv[len(strv)-1]
	// Strip possible type param list:
	// "pkg.Func[...]" => "pkg.Func
	strv = strings.Split(fname, "[")
	fname = strv[0]

	// Parse ast of tested file
	pf, ok := p.parsedFiles[file]
	if !ok {
		// Read source
		bs, _ := ioutil.ReadFile(file)
		src := string(bs)
		// Create the AST by parsing src.
		fset := token.NewFileSet() // positions are relative to fset
		ast, _ := parser.ParseFile(fset, file, nil, 0)
		// Inspect the AST and print all identifiers and literals.
		pf = &parsedFile{
			src:  src,
			fset: fset,
			ast:  ast,
		}
		p.parsedFiles[file] = pf
	}

	// Pick selected arguments
	fargs := make([]ast.Node, len(args))
	fstrs := make([]string, len(args))

	ast.Inspect(pf.ast, func(n ast.Node) bool {
		if n == nil {
			return true
		}
		if pf.fset.Position(n.Pos()).Line != line {
			return true
		}
		callExpr, ok := n.(*ast.CallExpr)
		if !ok {
			return true
		}
		if p.nodeToString(pf, callExpr.Fun) != fname {
			return true
		}
		for i, n := range args {
			fargs[i] = callExpr.Args[n]
			fstrs[i] = p.nodeToString(pf, callExpr.Args[n])
		}
		return false
	})

	return fargs, fstrs
}

func (p *formalArgPicker) nodeToString(pf *parsedFile, n ast.Node) string {
	start := pf.fset.Position(n.Pos()).Offset
	stop := pf.fset.Position(n.End()).Offset
	return pf.src[start:stop]
}

func valueToString(v any) string {
	switch x := v.(type) {
	case string:
		return strconv.Quote(x)
	default:
		return fmt.Sprintf("%#v", v)
	}
}

// Copied from https://github.com/stretchr/testify/blob/v1.7.0/assert/assertions.go#L334
//
// isEqual determines if two objects are considered equal.
//
// This function does no assertion of any kind.
func isEqual(expected, actual any) bool {
	if expected == nil || actual == nil {
		return expected == actual
	}

	switch exp := expected.(type) {
	// handle byte slices more efficiently
	case []byte:
		act, ok := actual.([]byte)
		if !ok {
			return false
		}
		return bytes.Equal(exp, act)
	// float point should not use ==
	case float32:
		act, ok := actual.(float32)
		if !ok {
			return false
		}
		return floatAlmostEqual(exp, act)
	case float64:
		act, ok := actual.(float64)
		if !ok {
			return false
		}
		return floatAlmostEqual(exp, act)
	case []float32:
		act, ok := actual.([]float32)
		if !ok {
			return false
		}
		if len(exp) != len(act) {
			return false
		}
		for i := range exp {
			if !floatAlmostEqual(exp[i], act[i]) {
				return false
			}
		}
		return true
	case []float64:
		act, ok := actual.([]float64)
		if !ok {
			return false
		}
		if len(exp) != len(act) {
			return false
		}
		for i := range exp {
			if !floatAlmostEqual(exp[i], act[i]) {
				return false
			}
		}
		return true
	default:
		return reflect.DeepEqual(expected, actual)
	}
}

func floatAlmostEqual[T constraints.Float](f1, f2 T) bool {
	const delta = 1e-6
	return math.Abs(float64(f1-f2)) < delta
}

func Equal[T any](t *testing.T, expected, actual T) bool {
	ok := isEqual(expected, actual)
	if !ok {
		// Ask *testing.T to skip current function when printing file and
		// line information.
		t.Helper()

		_, fstrs := picker.Pick(2, 1, 2)
		expectedArg := fstrs[0]
		expectedArgStr := valueToString(expected)
		if expectedArg != expectedArgStr {
			expectedArg += " (" + expectedArgStr + ")"
		}
		actualArg := fstrs[1]
		t.Errorf(`
		Expected: %s

		is equal to: %s

		but got: %s`,
			actualArg, expectedArg, valueToString(actual))
	}
	return ok
}

func NotEqual[T any](t *testing.T, expected, actual T) bool {
	ok := isEqual(expected, actual)
	if ok {
		// Ask *testing.T to skip current function when printing file and
		// line information.
		t.Helper()

		_, fstrs := picker.Pick(2, 1, 2)
		expectedArg := fstrs[0]
		expectedArgStr := valueToString(expected)
		if expectedArg != expectedArgStr {
			expectedArg += " (" + expectedArgStr + ")"
		}
		actualArg := fstrs[1]
		t.Errorf(`
		Expected: %s

		is not equal to: %s

		but got: %s`,
			actualArg, expectedArg, valueToString(actual))
	}
	return !ok
}

func True[T ~bool](t *testing.T, i T) bool {
	if !i {
		// Ask *testing.T to skip current function when printing file and
		// line information.
		t.Helper()

		_, fstrs := picker.Pick(2, 1)
		arg := fstrs[0]
		t.Errorf("Expect %s is true, but got false", arg)
	}
	return bool(i)
}

func False[T ~bool](t *testing.T, i T) bool {
	if i {
		// Ask *testing.T to skip current function when printing file and
		// line information.
		t.Helper()

		_, fstrs := picker.Pick(2, 1)
		arg := fstrs[0]
		t.Errorf("Expect %s is false, but got true", arg)
	}
	return bool(i)
}

// Copied from https://github.com/stretchr/testify/blob/v1.7.0/assert/assertions.go#L1003
//
// didPanic returns true if the function passed to it panics. Otherwise, it returns false.
func didPanic(f func()) (bool, any, string) {
	didPanic := false
	var message any
	var stack string
	func() {
		defer func() {
			if message = recover(); message != nil {
				didPanic = true
				stack = string(debug.Stack())
			}
		}()

		// call the target function
		f()
	}()

	return didPanic, message, stack
}

func Panic(t *testing.T, f func()) bool {
	ok, _, _ := didPanic(f)
	if !ok {
		// Ask *testing.T to skip current function when printing file and
		// line information.
		t.Helper()

		_, fstrs := picker.Pick(2, 1)
		arg := fstrs[0]
		t.Errorf("Func %s should panic", arg)
	}
	return ok
}

func NotPanic(t *testing.T, f func()) bool {
	ok, e, stack := didPanic(f)
	if ok {
		// Ask *testing.T to skip current function when printing file and
		// line information.
		t.Helper()

		_, fstrs := picker.Pick(2, 1)
		arg := fstrs[0]
		t.Errorf("Func %s should not panic", arg)
		t.Errorf("Message: %v", e)
		t.Errorf("Stack: %s", stack)
	}
	return !ok
}

func Nil(t *testing.T, i any) bool {
	if i != nil {
		// Ask *testing.T to skip current function when printing file and
		// line information.
		t.Helper()

		_, fstrs := picker.Pick(2, 1)
		arg := fstrs[0]
		t.Errorf("Expect %s is nil, but got %s", arg, valueToString(i))
	}
	return i == nil
}

func NotNil(t *testing.T, i any) bool {
	if i == nil {
		// Ask *testing.T to skip current function when printing file and
		// line information.
		t.Helper()

		_, fstrs := picker.Pick(2, 1)
		arg := fstrs[0]
		t.Errorf("Expect %s is not nil", arg)
	}
	return i != nil
}

func Zero(t *testing.T, i any) bool {
	zero := i == nil || reflect.DeepEqual(i, reflect.Zero(reflect.TypeOf(i)).Interface())
	if !zero {
		// Ask *testing.T to skip current function when printing file and
		// line information.
		t.Helper()

		_, fstrs := picker.Pick(2, 1)
		arg := fstrs[0]
		t.Errorf("Expect %s is zero, but got %s", arg, valueToString(i))
	}
	return zero
}

func NotZero(t *testing.T, i any) bool {
	zero := i == nil || reflect.DeepEqual(i, reflect.Zero(reflect.TypeOf(i)).Interface())
	if zero {
		// Ask *testing.T to skip current function when printing file and
		// line information.
		t.Helper()

		_, fstrs := picker.Pick(2, 1)
		arg := fstrs[0]
		t.Errorf("Expect %s is not zero", arg)
	}
	return !zero
}

func Less[T constraints.Integer](t *testing.T, expected, actual T) bool {
	ok := actual < expected
	if !ok {
		t.Helper()

		_, fstrs := picker.Pick(2, 2)
		arg := fstrs[0]
		t.Errorf("Expect %s is less than %s, but got %s",
			arg, valueToString(expected), valueToString(actual))
	}
	return ok
}

func Greater[T constraints.Integer](t *testing.T, expected, actual T) bool {
	ok := actual > expected
	if !ok {
		t.Helper()

		_, fstrs := picker.Pick(2, 2)
		arg := fstrs[0]
		t.Errorf("Expect %s is greater than %s, but got %s",
			arg, valueToString(expected), valueToString(actual))
	}
	return ok
}

package sandbox

import (
	"encoding/json"
	"reflect"
	"strings"
)

// OutputEqual compares actual vs expected judge output.
//
//   - A-group (IsAutoWrap=true): stdout is JSON → semantic deep-equal.
//     "[0, 1]" == "[0,1]", true == true, 1.0 == 1.
//   - B-group (IsAutoWrap=false): raw text → whitespace-normalised token comparison.
//     "0 1\n" == "0  1"
//
// Returns true when outputs are considered equivalent.
func OutputEqual(isAutoWrap bool, actual, expected string) bool {
	a := strings.TrimSpace(actual)
	e := strings.TrimSpace(expected)
	if a == e {
		return true
	}
	if isAutoWrap && jsonDeepEqual(a, e) {
		return true
	}
	return tokenEqual(a, e)
}

// jsonDeepEqual unmarshals both strings as JSON and compares them structurally.
// Falls back to string comparison if either side is not valid JSON.
func jsonDeepEqual(a, b string) bool {
	var va, vb any
	if err := json.Unmarshal([]byte(a), &va); err != nil {
		return false
	}
	if err := json.Unmarshal([]byte(b), &vb); err != nil {
		return false
	}
	// json.Unmarshal maps all numbers to float64; reflect.DeepEqual handles this.
	return reflect.DeepEqual(va, vb)
}

// tokenEqual splits both strings on whitespace and compares token-by-token.
func tokenEqual(a, b string) bool {
	return strings.Join(strings.Fields(a), " ") == strings.Join(strings.Fields(b), " ")
}

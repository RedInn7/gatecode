package sandbox

import (
	"encoding/json"
	"math"
	"reflect"
	"regexp"
	"sort"
	"strings"
)

const floatEpsilon = 1e-5

// OutputEqual compares actual vs expected judge output.
//
//   - A-group (IsAutoWrap=true): stdout is JSON → semantic deep-equal,
//     then order-independent array comparison, then float-epsilon comparison.
//   - B-group (IsAutoWrap=false): raw text → whitespace-normalised token comparison.
//
// Returns true when outputs are considered equivalent.
func OutputEqual(isAutoWrap bool, actual, expected string) bool {
	a := strings.TrimSpace(actual)
	e := strings.TrimSpace(expected)

	// Normalize Infinity/inf variants before comparison
	a = normalizeInfinity(a)
	e = normalizeInfinity(e)

	// Normalize null vs [] for empty linked lists
	a = normalizeNullEmpty(a)
	e = normalizeNullEmpty(e)

	// If either side contains the infinity placeholder, also normalize
	// C++/Java sentinel values (INT_MAX, 1e18, etc.)
	if strings.Contains(e, infPlaceholder) || strings.Contains(a, infPlaceholder) {
		a = normalizeSentinelInfinity(a)
		e = normalizeSentinelInfinity(e)
	}

	if a == e {
		return true
	}
	if isAutoWrap {
		if jsonDeepEqual(a, e) {
			return true
		}
		if jsonFloatEqual(a, e) {
			return true
		}
		if jsonSortedEqual(a, e) {
			return true
		}
		// TreeNode return: expected is a single value (e.g. 3),
		// actual is a tree array whose root matches (e.g. [3,5,1,...])
		if jsonRootEqual(a, e) {
			return true
		}
		// Frequency-sorted string comparison: both strings have the same
		// character multiset and characters are grouped by non-increasing frequency.
		// This handles "sort characters by frequency" style problems where
		// characters with the same frequency can appear in any order.
		if freqSortedStringEqual(a, e) {
			return true
		}
	}
	return tokenEqual(a, e)
}

// jsonDeepEqual unmarshals both strings as JSON and compares them structurally.
func jsonDeepEqual(a, b string) bool {
	var va, vb any
	if err := json.Unmarshal([]byte(a), &va); err != nil {
		return false
	}
	if err := json.Unmarshal([]byte(b), &vb); err != nil {
		return false
	}
	return reflect.DeepEqual(va, vb)
}

// jsonFloatEqual compares two JSON values with epsilon tolerance for floats.
func jsonFloatEqual(a, b string) bool {
	var va, vb any
	if err := json.Unmarshal([]byte(a), &va); err != nil {
		return false
	}
	if err := json.Unmarshal([]byte(b), &vb); err != nil {
		return false
	}
	return deepEqualEpsilon(va, vb)
}

// deepEqualEpsilon compares two JSON-decoded values with float tolerance.
// Also handles bool/int equivalence (true==1, false==0) common in Python output.
func deepEqualEpsilon(a, b any) bool {
	switch va := a.(type) {
	case bool:
		if vb, ok := b.(bool); ok {
			return va == vb
		}
		// bool vs float64 (JSON numbers decode as float64)
		if fb, ok := b.(float64); ok {
			if va {
				return fb == 1.0
			}
			return fb == 0.0
		}
		return false
	case float64:
		vb, ok := b.(float64)
		if ok {
			if math.IsNaN(va) && math.IsNaN(vb) {
				return true
			}
			diff := math.Abs(va - vb)
			return diff < floatEpsilon || diff <= floatEpsilon*math.Max(math.Abs(va), math.Abs(vb))
		}
		// float64 vs bool (JSON booleans)
		if bb, ok := b.(bool); ok {
			if bb {
				return va == 1.0
			}
			return va == 0.0
		}
		return false
	case []any:
		vb, ok := b.([]any)
		if !ok {
			// [] == null (empty array ↔ nil for empty tree/list)
			if b == nil && len(va) == 0 {
				return true
			}
			return false
		}
		if len(va) != len(vb) {
			return false
		}
		for i := range va {
			if !deepEqualEpsilon(va[i], vb[i]) {
				return false
			}
		}
		return true
	case map[string]any:
		vb, ok := b.(map[string]any)
		if !ok || len(va) != len(vb) {
			return false
		}
		for k, v := range va {
			if !deepEqualEpsilon(v, vb[k]) {
				return false
			}
		}
		return true
	case nil:
		// null == [] (nil ↔ empty array for empty tree/list)
		if vb, ok := b.([]any); ok && len(vb) == 0 {
			return true
		}
		return b == nil
	default:
		return reflect.DeepEqual(a, b)
	}
}

// jsonSortedEqual compares two JSON arrays in an order-independent way.
// Handles cases like 3Sum and Subsets where answer order doesn't matter.
func jsonSortedEqual(a, b string) bool {
	var va, vb any
	if err := json.Unmarshal([]byte(a), &va); err != nil {
		return false
	}
	if err := json.Unmarshal([]byte(b), &vb); err != nil {
		return false
	}
	arrA, okA := va.([]any)
	arrB, okB := vb.([]any)
	if !okA || !okB || len(arrA) != len(arrB) {
		return false
	}
	// Sort both arrays by their canonical JSON string and compare
	return reflect.DeepEqual(sortedCanonical(arrA), sortedCanonical(arrB))
}

// sortedCanonical returns a sorted copy of the slice by canonical JSON representation.
// For nested arrays, each sub-array is also sorted recursively.
func sortedCanonical(arr []any) []string {
	strs := make([]string, len(arr))
	for i, v := range arr {
		// Recursively sort sub-arrays
		if sub, ok := v.([]any); ok {
			v = sortedCanonicalValue(sub)
		}
		b, _ := json.Marshal(v)
		strs[i] = string(b)
	}
	sort.Strings(strs)
	return strs
}

// sortedCanonicalValue sorts a nested array for canonical comparison.
func sortedCanonicalValue(arr []any) []any {
	result := make([]any, len(arr))
	copy(result, arr)
	// Sort sub-arrays recursively
	for i, v := range result {
		if sub, ok := v.([]any); ok {
			result[i] = sortedCanonicalValue(sub)
		}
	}
	// Sort elements by JSON representation
	sort.Slice(result, func(i, j int) bool {
		bi, _ := json.Marshal(result[i])
		bj, _ := json.Marshal(result[j])
		return string(bi) < string(bj)
	})
	return result
}

// jsonRootEqual handles TreeNode returns: expected is a primitive (e.g. 3),
// actual is a JSON array whose first element matches (e.g. [3,5,1,...]).
// This covers LCA-style problems where the expected is just the node value.
func jsonRootEqual(a, b string) bool {
	var va, vb any
	if err := json.Unmarshal([]byte(a), &va); err != nil {
		return false
	}
	if err := json.Unmarshal([]byte(b), &vb); err != nil {
		return false
	}
	// One must be an array and the other a primitive
	arr, prim, ok := classifyArrayPrimitive(va, vb)
	if !ok {
		return false
	}
	if len(arr) == 0 {
		return false
	}
	return deepEqualEpsilon(arr[0], prim)
}

func classifyArrayPrimitive(a, b any) (arr []any, prim any, ok bool) {
	if aa, isArr := a.([]any); isArr {
		if _, isArr2 := b.([]any); !isArr2 {
			return aa, b, true
		}
	}
	if ba, isArr := b.([]any); isArr {
		if _, isArr2 := a.([]any); !isArr2 {
			return ba, a, true
		}
	}
	return nil, nil, false
}

// normalizeInfinity canonicalizes all infinity representations to a single form.
// Handles: Infinity, -Infinity, inf, -inf.
var infRe = regexp.MustCompile(`(?i)\b(?:infinity|inf)\b`)

// infPlaceholder is a large number used to replace all "Infinity" representations
// so that JSON parsing can work correctly. It's large enough to not conflict with
// real values in LeetCode problems.
const infPlaceholder = "9999999999999"
const negInfPlaceholder = "-9999999999999"

func normalizeInfinity(s string) string {
	s = infRe.ReplaceAllStringFunc(s, func(m string) string {
		return infPlaceholder
	})
	// Fix up negative: -9999999999999 should stay as is
	return s
}

// normalizeSentinelInfinity replaces common C++/Java sentinel values
// (INT_MAX, INT_MIN, 1e18) with the same placeholder so comparison works.
var posInfSentinels = regexp.MustCompile(`\b(?:2147483647|1000000000000000000|1073741824)\b`)
var negInfSentinels = regexp.MustCompile(`-(?:2147483648|1000000000000000000|1073741824)\b`)
var floatInfSentinels = regexp.MustCompile(`\b1e\+?18\b`)

func normalizeSentinelInfinity(s string) string {
	s = floatInfSentinels.ReplaceAllString(s, infPlaceholder)
	s = negInfSentinels.ReplaceAllString(s, negInfPlaceholder)
	s = posInfSentinels.ReplaceAllString(s, infPlaceholder)
	return s
}

// normalizeNullEmpty treats "null" and "[]" as equivalent for void-return / empty list.
func normalizeNullEmpty(s string) string {
	if s == "null" {
		return "[]"
	}
	return s
}

// freqSortedStringEqual compares two JSON-encoded strings for frequency-sort equivalence.
// Both strings must have the same character multiset, and characters in each must be
// grouped by non-increasing frequency. This handles problems like "Sort Characters By Frequency"
// where multiple valid orderings exist for characters with the same frequency.
func freqSortedStringEqual(a, b string) bool {
	// Both must be JSON strings (start and end with ")
	var sa, sb string
	if err := json.Unmarshal([]byte(a), &sa); err != nil {
		return false
	}
	if err := json.Unmarshal([]byte(b), &sb); err != nil {
		return false
	}
	if len(sa) != len(sb) {
		return false
	}
	if len(sa) == 0 {
		return true
	}

	// Check same character multiset
	cntA := make(map[rune]int)
	cntB := make(map[rune]int)
	for _, c := range sa {
		cntA[c]++
	}
	for _, c := range sb {
		cntB[c]++
	}
	if !reflect.DeepEqual(cntA, cntB) {
		return false
	}

	// Check that both strings group characters by non-increasing frequency.
	// Each string should be a series of runs where each run's character has
	// frequency >= the next run's character frequency.
	isValidFreqSort := func(s string, cnt map[rune]int) bool {
		prevFreq := len(s) + 1
		i := 0
		for i < len(s) {
			c := rune(s[i])
			freq := cnt[c]
			if freq > prevFreq {
				return false
			}
			// Check that all occurrences of this character are contiguous
			j := i
			for j < len(s) && rune(s[j]) == c {
				j++
			}
			if j-i != freq {
				return false // not all occurrences are contiguous
			}
			prevFreq = freq
			i = j
		}
		return true
	}

	return isValidFreqSort(sa, cntA) && isValidFreqSort(sb, cntB)
}

// tokenEqual splits both strings on whitespace and compares token-by-token.
func tokenEqual(a, b string) bool {
	return strings.Join(strings.Fields(a), " ") == strings.Join(strings.Fields(b), " ")
}

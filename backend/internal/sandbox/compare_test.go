package sandbox

import "testing"

func TestOutputEqual_ExactMatch(t *testing.T) {
	if !OutputEqual(true, "42", "42") {
		t.Error("exact match failed")
	}
}

func TestOutputEqual_JSONDeepEqual(t *testing.T) {
	if !OutputEqual(true, "[0, 1]", "[0,1]") {
		t.Error("json whitespace mismatch")
	}
}

func TestOutputEqual_FloatEpsilon(t *testing.T) {
	tests := []struct {
		name     string
		actual   string
		expected string
		want     bool
	}{
		{"exact zero", "0.0", "0.0", true},
		{"near zero", "4.63595894152229e-20", "0.0", true},
		{"near zero neg", "-1e-10", "0.0", true},
		{"different values", "1.5", "2.5", false},
		{"close floats", "3.14159", "3.14160", true},
		{"integer as float", "1", "1.0", true},
		{"array of floats", "[1.00001, 2.0]", "[1.0, 2.0]", true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := OutputEqual(true, tt.actual, tt.expected)
			if got != tt.want {
				t.Errorf("OutputEqual(%q, %q) = %v, want %v", tt.actual, tt.expected, got, tt.want)
			}
		})
	}
}

func TestOutputEqual_SortedArrays(t *testing.T) {
	tests := []struct {
		name     string
		actual   string
		expected string
		want     bool
	}{
		{
			"3sum order",
			`[[-4,-2,6],[-4,0,4],[-4,1,3],[-4,2,2],[-2,-2,4],[-2,0,2]]`,
			`[[-4,-2,6],[-4,0,4],[-2,-2,4],[-4,1,3],[-4,2,2],[-2,0,2]]`,
			true,
		},
		{
			"subsets order",
			`[[],[3],[2],[2,3],[1],[1,3],[1,2],[1,2,3]]`,
			`[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]`,
			true,
		},
		{
			"different content",
			`[[1,2],[3,4]]`,
			`[[1,2],[3,5]]`,
			false,
		},
		{
			"simple array order",
			`[3,1,2]`,
			`[1,2,3]`,
			true,
		},
		{
			"different lengths",
			`[1,2]`,
			`[1,2,3]`,
			false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := OutputEqual(true, tt.actual, tt.expected)
			if got != tt.want {
				t.Errorf("OutputEqual(%q, %q) = %v, want %v", tt.actual, tt.expected, got, tt.want)
			}
		})
	}
}

func TestOutputEqual_BoolIntEquivalence(t *testing.T) {
	tests := []struct {
		name     string
		actual   string
		expected string
		want     bool
	}{
		{"true vs 1", "true", "1", true},
		{"false vs 0", "false", "0", true},
		{"1 vs true", "1", "true", true},
		{"0 vs false", "0", "false", true},
		{"true vs 2", "true", "2", false},
		{"false vs 1", "false", "1", false},
		{"bool array", "[true, false]", "[1, 0]", true},
		{"nested bool", "[[true], [false]]", "[[1], [0]]", true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := OutputEqual(true, tt.actual, tt.expected)
			if got != tt.want {
				t.Errorf("OutputEqual(%q, %q) = %v, want %v", tt.actual, tt.expected, got, tt.want)
			}
		})
	}
}

func TestOutputEqual_TokenEqual(t *testing.T) {
	if !OutputEqual(false, "0 1\n", "0  1") {
		t.Error("token equal should handle whitespace")
	}
}

func TestOutputEqual_Infinity(t *testing.T) {
	tests := []struct {
		name     string
		actual   string
		expected string
		want     bool
	}{
		{"inf vs Infinity", "inf", "Infinity", true},
		{"-inf vs -Infinity", "-inf", "-Infinity", true},
		{"INF vs Infinity", "INF", "Infinity", true},
		{"C++ inf in array", "[1.5, inf, -inf]", "[1.5, Infinity, -Infinity]", true},
		{"both Infinity", "Infinity", "Infinity", true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := OutputEqual(true, tt.actual, tt.expected)
			if got != tt.want {
				t.Errorf("OutputEqual(%q, %q) = %v, want %v", tt.actual, tt.expected, got, tt.want)
			}
		})
	}
}

func TestOutputEqual_NullVsEmpty(t *testing.T) {
	tests := []struct {
		name     string
		actual   string
		expected string
		want     bool
	}{
		{"null vs []", "[]", "null", true},
		{"[] vs null", "null", "[]", true},
		{"both null", "null", "null", true},
		{"both []", "[]", "[]", true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := OutputEqual(true, tt.actual, tt.expected)
			if got != tt.want {
				t.Errorf("OutputEqual(%q, %q) = %v, want %v", tt.actual, tt.expected, got, tt.want)
			}
		})
	}
}

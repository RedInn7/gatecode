package sandbox

import (
	"regexp"
	"strings"
)

// LangConfig holds all metadata needed to compile and run a solution in a given language.
type LangConfig struct {
	Image      string // Docker image
	FileName   string // file to write inside /w
	CompileCmd string // empty = no compile step
	RunCmd     string // command to execute the solution
	IsAutoWrap bool   // true = A group: append stdin→func→JSON runner
}

// LangConfigs covers all 19 LeetCode languages.
var LangConfigs = map[string]LangConfig{
	"JavaScript": {
		Image:      "node:20-alpine",
		FileName:   "solution.js",
		RunCmd:     "node /w/solution.js",
		IsAutoWrap: true,
	},
	"TypeScript": {
		Image:      "node:20-alpine",
		FileName:   "solution.ts",
		RunCmd:     "npx ts-node /w/solution.ts",
		IsAutoWrap: true,
	},
	"Python3": {
		Image:      "python:3.11-alpine",
		FileName:   "solution.py",
		RunCmd:     "python3 /w/solution.py",
		IsAutoWrap: true,
	},
	"Python": {
		Image:      "python:3.11-alpine",
		FileName:   "solution.py",
		RunCmd:     "python3 /w/solution.py",
		IsAutoWrap: true,
	},
	"C++": {
		Image:      "gcc:13",
		FileName:   "solution.cpp",
		CompileCmd: "g++ -O2 -o /w/sol /w/solution.cpp",
		RunCmd:     "/w/sol",
		IsAutoWrap: false,
	},
	"C": {
		Image:      "gcc:13",
		FileName:   "solution.c",
		CompileCmd: "gcc -O2 -o /w/sol /w/solution.c",
		RunCmd:     "/w/sol",
		IsAutoWrap: false,
	},
	"Java": {
		Image:      "eclipse-temurin:21-jdk-alpine",
		FileName:   "Solution.java",
		CompileCmd: "javac /w/Solution.java",
		RunCmd:     "java -cp /w Solution",
		IsAutoWrap: false,
	},
	"C#": {
		Image:      "mcr.microsoft.com/dotnet/sdk:8.0",
		FileName:   "solution.csx",
		RunCmd:     "dotnet script /w/solution.csx",
		IsAutoWrap: false,
	},
	"Go": {
		Image:      "golang:1.21-alpine",
		FileName:   "solution.go",
		RunCmd:     "go run /w/solution.go",
		IsAutoWrap: false,
	},
	"Kotlin": {
		Image:      "eclipse-temurin:21-jdk-alpine",
		FileName:   "solution.kt",
		CompileCmd: "kotlinc /w/solution.kt -include-runtime -d /w/sol.jar",
		RunCmd:     "java -jar /w/sol.jar",
		IsAutoWrap: false,
	},
	"Swift": {
		Image:      "swift:5.9-slim",
		FileName:   "solution.swift",
		RunCmd:     "swift /w/solution.swift",
		IsAutoWrap: false,
	},
	"Rust": {
		Image:      "rust:1.74-alpine",
		FileName:   "solution.rs",
		CompileCmd: "rustc -o /w/sol /w/solution.rs",
		RunCmd:     "/w/sol",
		IsAutoWrap: false,
	},
	"Ruby": {
		Image:      "ruby:3.2-alpine",
		FileName:   "solution.rb",
		RunCmd:     "ruby /w/solution.rb",
		IsAutoWrap: true,
	},
	"PHP": {
		Image:      "php:8.2-alpine",
		FileName:   "solution.php",
		RunCmd:     "php /w/solution.php",
		IsAutoWrap: true,
	},
	"Dart": {
		Image:      "dart:stable",
		FileName:   "solution.dart",
		RunCmd:     "dart /w/solution.dart",
		IsAutoWrap: false,
	},
	"Scala": {
		Image:      "sbtscala/scala-sbt",
		FileName:   "solution.scala",
		CompileCmd: "scalac /w/solution.scala -d /w",
		RunCmd:     "scala -cp /w Solution",
		IsAutoWrap: false,
	},
	"Elixir": {
		Image:      "elixir:1.15-alpine",
		FileName:   "solution.exs",
		RunCmd:     "elixir /w/solution.exs",
		IsAutoWrap: false,
	},
	"Erlang": {
		Image:      "erlang:26-alpine",
		FileName:   "solution.erl",
		CompileCmd: "erlc /w/solution.erl -o /w",
		RunCmd:     "erl -noshell -pa /w -s solution main -s init stop",
		IsAutoWrap: false,
	},
	"Racket": {
		Image:      "racket:latest",
		FileName:   "solution.rkt",
		RunCmd:     "racket /w/solution.rkt",
		IsAutoWrap: false,
	},
}

// LangKeyToDisplay maps lowercase DB keys (e.g. "python3") to display names (e.g. "Python3").
var LangKeyToDisplay = map[string]string{
	"javascript": "JavaScript",
	"typescript": "TypeScript",
	"python3":    "Python3",
	"python":     "Python",
	"cpp":        "C++",
	"c":          "C",
	"java":       "Java",
	"csharp":     "C#",
	"go":         "Go",
	"kotlin":     "Kotlin",
	"swift":      "Swift",
	"rust":       "Rust",
	"ruby":       "Ruby",
	"php":        "PHP",
	"dart":       "Dart",
	"scala":      "Scala",
	"elixir":     "Elixir",
	"erlang":     "Erlang",
	"racket":     "Racket",
}

// funcNamePatterns extracts the primary function name per language.
var funcNamePatterns = map[string]*regexp.Regexp{
	"JavaScript": regexp.MustCompile(`(?:var|let|const)\s+(\w+)\s*=\s*function|function\s+(\w+)\s*\(`),
	"TypeScript": regexp.MustCompile(`(?:var|let|const)\s+(\w+)\s*=\s*function|function\s+(\w+)\s*\(`),
	"Python3":    regexp.MustCompile(`def\s+(\w+)\s*\(`),
	"Python":     regexp.MustCompile(`def\s+(\w+)\s*\(`),
	"Ruby":       regexp.MustCompile(`def\s+(\w+)[\s\(]`),
	"PHP":        regexp.MustCompile(`function\s+(\w+)\s*\(`),
}

// ExtractFuncName extracts the primary user function name from template code.
func ExtractFuncName(lang, code string) string {
	re, ok := funcNamePatterns[lang]
	if !ok {
		return ""
	}
	matches := re.FindStringSubmatch(code)
	for i := 1; i < len(matches); i++ {
		if matches[i] != "" {
			return matches[i]
		}
	}
	return ""
}

// runner templates — use {{FUNC}} as the placeholder for the function name.
const jsRunnerTpl = `
;(function(){
  var _rl = require('readline').createInterface({input: process.stdin});
  var _lines = [];
  _rl.on('line', function(l){ var t = l.trim(); if(t) _lines.push(t); });
  _rl.on('close', function(){
    var _args = _lines.map(function(l){ return JSON.parse(l); });
    var _result = {{FUNC}}.apply(null, _args);
    process.stdout.write(JSON.stringify(_result) + '\n');
  });
})();
`

const tsRunnerTpl = `
;(function(){
  const _rl = require('readline').createInterface({input: process.stdin});
  const _lines: string[] = [];
  _rl.on('line', (l: string) => { const t = l.trim(); if(t) _lines.push(t); });
  _rl.on('close', () => {
    const _args = _lines.map((l: string) => JSON.parse(l));
    const _result = ({{FUNC}} as Function).apply(null, _args);
    process.stdout.write(JSON.stringify(_result) + '\n');
  });
})();
`

const pyRunnerTpl = `
if __name__ == '__main__':
    import sys as _sys, json as _json
    _lines = [l.strip() for l in _sys.stdin if l.strip()]
    _args = [_json.loads(l) for l in _lines]
    try:
        _result = Solution().{{FUNC}}(*_args)
    except NameError:
        _result = {{FUNC}}(*_args)
    print(_json.dumps(_result))
`

const rubyRunnerTpl = `
# runner
require 'json'
_lines = $stdin.readlines.map(&:strip).reject(&:empty?)
_args = _lines.map { |l| JSON.parse(l) }
_result = {{FUNC}}(*_args)
puts JSON.generate(_result)
`

const phpRunnerTpl = `
// runner
$_stdin = file_get_contents('php://stdin');
$_lines = array_values(array_filter(array_map('trim', explode("\n", $_stdin))));
$_args = array_map(function($_l) { return json_decode($_l, true); }, $_lines);
$_result = {{FUNC}}(...$_args);
echo json_encode($_result) . "\n";
`

// WrapCode appends a stdin→func→JSON runner for A-group languages.
// B-group code is returned unchanged.
func WrapCode(lang, code string) string {
	cfg, ok := LangConfigs[lang]
	if !ok || !cfg.IsAutoWrap {
		return code
	}

	funcName := ExtractFuncName(lang, code)
	if funcName == "" {
		funcName = "solution"
	}

	var tpl string
	switch lang {
	case "JavaScript":
		tpl = jsRunnerTpl
	case "TypeScript":
		tpl = tsRunnerTpl
	case "Python3", "Python":
		tpl = pyRunnerTpl
	case "Ruby":
		tpl = rubyRunnerTpl
	case "PHP":
		tpl = phpRunnerTpl
	default:
		return code
	}

	runner := strings.ReplaceAll(tpl, "{{FUNC}}", funcName)
	return code + runner
}

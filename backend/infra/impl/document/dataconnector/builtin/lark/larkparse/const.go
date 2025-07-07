package larkparse

type LarkErrorCode int

const (
	LarkErrorCodeInvalidToken       = 4001    // 查看token是否填写正确，是否过期
	LarkErrorCodeInvalidAccessToken = 20005   // 无效的 access_token
	LarkErrorCodeMethodRateLimited  = 1000004 // 接口请求过快，超出频率限制，降低请求频率
	LarkErrorCodeAppRateLimited     = 1000005 // 应用被限流，降低请求频率
)

type FeishuDocxBlockType int

const (
	FeishuDocxBlockTypePage           FeishuDocxBlockType = 1   // 文档 Block
	FeishuDocxBlockTypeText           FeishuDocxBlockType = 2   // 文本 Block
	FeishuDocxBlockTypeHeading1       FeishuDocxBlockType = 3   // 一级标题 Block
	FeishuDocxBlockTypeHeading2       FeishuDocxBlockType = 4   // 二级标题 Block
	FeishuDocxBlockTypeHeading3       FeishuDocxBlockType = 5   // 三级标题 Block
	FeishuDocxBlockTypeHeading4       FeishuDocxBlockType = 6   // 四级标题 Block
	FeishuDocxBlockTypeHeading5       FeishuDocxBlockType = 7   // 五级标题 Block
	FeishuDocxBlockTypeHeading6       FeishuDocxBlockType = 8   // 六级标题 Block
	FeishuDocxBlockTypeHeading7       FeishuDocxBlockType = 9   // 七级标题 Block
	FeishuDocxBlockTypeHeading8       FeishuDocxBlockType = 10  // 八级标题 Block
	FeishuDocxBlockTypeHeading9       FeishuDocxBlockType = 11  // 九级标题 Block
	FeishuDocxBlockTypeBullet         FeishuDocxBlockType = 12  // 无序列表 Block
	FeishuDocxBlockTypeOrdered        FeishuDocxBlockType = 13  // 有序列表 Block
	FeishuDocxBlockTypeCode           FeishuDocxBlockType = 14  // 代码 Block
	FeishuDocxBlockTypeQuote          FeishuDocxBlockType = 15  // 引用 Block
	FeishuDocxBlockTypeEquation       FeishuDocxBlockType = 16  // 公式 Block
	FeishuDocxBlockTypeTodo           FeishuDocxBlockType = 17  // 任务 Block
	FeishuDocxBlockTypeBitable        FeishuDocxBlockType = 18  // 多维表格 Block
	FeishuDocxBlockTypeCallout        FeishuDocxBlockType = 19  // 高亮块 Block
	FeishuDocxBlockTypeChatCard       FeishuDocxBlockType = 20  // 群聊卡片 Block
	FeishuDocxBlockTypeDiagram        FeishuDocxBlockType = 21  // 流程图/UML Block
	FeishuDocxBlockTypeDivider        FeishuDocxBlockType = 22  // 分割线 Block
	FeishuDocxBlockTypeFile           FeishuDocxBlockType = 23  // 文件 Block
	FeishuDocxBlockTypeGrid           FeishuDocxBlockType = 24  // 分栏 Block
	FeishuDocxBlockTypeGridColumn     FeishuDocxBlockType = 25  // 分栏列 Block
	FeishuDocxBlockTypeIframe         FeishuDocxBlockType = 26  // 内嵌 Block
	FeishuDocxBlockTypeImage          FeishuDocxBlockType = 27  // 图片 Block
	FeishuDocxBlockTypeISV            FeishuDocxBlockType = 28  // 三方 Block
	FeishuDocxBlockTypeMindNote       FeishuDocxBlockType = 29  // 思维笔记 Block
	FeishuDocxBlockTypeSheet          FeishuDocxBlockType = 30  // 电子表格 Block
	FeishuDocxBlockTypeTable          FeishuDocxBlockType = 31  // 表格 Block
	FeishuDocxBlockTypeTableCell      FeishuDocxBlockType = 32  // 单元格 Block
	FeishuDocxBlockTypeView           FeishuDocxBlockType = 33  // 视图 Block
	FeishuDocxBlockTypeQuoteContainer FeishuDocxBlockType = 34  // 引用容器 Block
	FeishuDocxBlockTypeTask           FeishuDocxBlockType = 35  // 任务 Block
	FeishuDocxBlockTypeOKR            FeishuDocxBlockType = 36  // OKR Block
	FeishuDocxBlockTypeOKRObjective   FeishuDocxBlockType = 37  // OKR Objective Block
	FeishuDocxBlockTypeOKRKeyResult   FeishuDocxBlockType = 38  // OKR Key Result Block
	FeishuDocxBlockTypeOKRProgress    FeishuDocxBlockType = 39  // OKR Progress Block
	FeishuDocxBlockTypeComponent      FeishuDocxBlockType = 40  // 文件小组件 Block
	FeishuDocxBlockTypeJiraIssue      FeishuDocxBlockType = 41  // Jira问题 Block
	FeishuDocxBlockTypeWikiCatalog    FeishuDocxBlockType = 42  // Wiki子目录 Block
	FeishuDocxBlockTypeBoard          FeishuDocxBlockType = 43  // 画板 Block
	FeishuDocxBlockTypeUndefined      FeishuDocxBlockType = 999 // 未支持 Block
)

// FeishuDocxCodeLanguage 代码块语言
type FeishuDocxCodeLanguage int64

const (
	FeishuDocxCodeLanguagePlainText    FeishuDocxCodeLanguage = 1  // PlainText
	FeishuDocxCodeLanguageABAP         FeishuDocxCodeLanguage = 2  // ABAP
	FeishuDocxCodeLanguageAda          FeishuDocxCodeLanguage = 3  // Ada
	FeishuDocxCodeLanguageApache       FeishuDocxCodeLanguage = 4  // Apache
	FeishuDocxCodeLanguageApex         FeishuDocxCodeLanguage = 5  // Apex
	FeishuDocxCodeLanguageAssembly     FeishuDocxCodeLanguage = 6  // Assembly
	FeishuDocxCodeLanguageBash         FeishuDocxCodeLanguage = 7  // Bash
	FeishuDocxCodeLanguageCSharp       FeishuDocxCodeLanguage = 8  // CSharp
	FeishuDocxCodeLanguageCPlusPlus    FeishuDocxCodeLanguage = 9  // C++
	FeishuDocxCodeLanguageC            FeishuDocxCodeLanguage = 10 // C
	FeishuDocxCodeLanguageCOBOL        FeishuDocxCodeLanguage = 11 // COBOL
	FeishuDocxCodeLanguageCSS          FeishuDocxCodeLanguage = 12 // CSS
	FeishuDocxCodeLanguageCoffeeScript FeishuDocxCodeLanguage = 13 // CoffeeScript
	FeishuDocxCodeLanguageD            FeishuDocxCodeLanguage = 14 // D
	FeishuDocxCodeLanguageDart         FeishuDocxCodeLanguage = 15 // Dart
	FeishuDocxCodeLanguageDelphi       FeishuDocxCodeLanguage = 16 // Delphi
	FeishuDocxCodeLanguageDjango       FeishuDocxCodeLanguage = 17 // Django
	FeishuDocxCodeLanguageDockerfile   FeishuDocxCodeLanguage = 18 // Dockerfile
	FeishuDocxCodeLanguageErlang       FeishuDocxCodeLanguage = 19 // Erlang
	FeishuDocxCodeLanguageFortran      FeishuDocxCodeLanguage = 20 // Fortran
	FeishuDocxCodeLanguageFoxPro       FeishuDocxCodeLanguage = 21 // FoxPro
	FeishuDocxCodeLanguageGo           FeishuDocxCodeLanguage = 22 // Go
	FeishuDocxCodeLanguageGroovy       FeishuDocxCodeLanguage = 23 // Groovy
	FeishuDocxCodeLanguageHTML         FeishuDocxCodeLanguage = 24 // HTML
	FeishuDocxCodeLanguageHTMLBars     FeishuDocxCodeLanguage = 25 // HTMLBars
	FeishuDocxCodeLanguageHTTP         FeishuDocxCodeLanguage = 26 // HTTP
	FeishuDocxCodeLanguageHaskell      FeishuDocxCodeLanguage = 27 // Haskell
	FeishuDocxCodeLanguageJSON         FeishuDocxCodeLanguage = 28 // JSON
	FeishuDocxCodeLanguageJava         FeishuDocxCodeLanguage = 29 // Java
	FeishuDocxCodeLanguageJavaScript   FeishuDocxCodeLanguage = 30 // JavaScript
	FeishuDocxCodeLanguageJulia        FeishuDocxCodeLanguage = 31 // Julia
	FeishuDocxCodeLanguageKotlin       FeishuDocxCodeLanguage = 32 // Kotlin
	FeishuDocxCodeLanguageLateX        FeishuDocxCodeLanguage = 33 // LateX
	FeishuDocxCodeLanguageLisp         FeishuDocxCodeLanguage = 34 // Lisp
	FeishuDocxCodeLanguageLogo         FeishuDocxCodeLanguage = 35 // Logo
	FeishuDocxCodeLanguageLua          FeishuDocxCodeLanguage = 36 // Lua
	FeishuDocxCodeLanguageMATLAB       FeishuDocxCodeLanguage = 37 // MATLAB
	FeishuDocxCodeLanguageMakefile     FeishuDocxCodeLanguage = 38 // Makefile
	FeishuDocxCodeLanguageMarkdown     FeishuDocxCodeLanguage = 39 // Markdown
	FeishuDocxCodeLanguageNginx        FeishuDocxCodeLanguage = 40 // Nginx
	FeishuDocxCodeLanguageObjective    FeishuDocxCodeLanguage = 41 // Objective
	FeishuDocxCodeLanguageOpenEdgeABL  FeishuDocxCodeLanguage = 42 // OpenEdgeABL
	FeishuDocxCodeLanguagePHP          FeishuDocxCodeLanguage = 43 // PHP
	FeishuDocxCodeLanguagePerl         FeishuDocxCodeLanguage = 44 // Perl
	FeishuDocxCodeLanguagePostScript   FeishuDocxCodeLanguage = 45 // PostScript
	FeishuDocxCodeLanguagePower        FeishuDocxCodeLanguage = 46 // Power
	FeishuDocxCodeLanguageProlog       FeishuDocxCodeLanguage = 47 // Prolog
	FeishuDocxCodeLanguageProtoBuf     FeishuDocxCodeLanguage = 48 // ProtoBuf
	FeishuDocxCodeLanguagePython       FeishuDocxCodeLanguage = 49 // Python
	FeishuDocxCodeLanguageR            FeishuDocxCodeLanguage = 50 // R
	FeishuDocxCodeLanguageRPG          FeishuDocxCodeLanguage = 51 // RPG
	FeishuDocxCodeLanguageRuby         FeishuDocxCodeLanguage = 52 // Ruby
	FeishuDocxCodeLanguageRust         FeishuDocxCodeLanguage = 53 // Rust
	FeishuDocxCodeLanguageSAS          FeishuDocxCodeLanguage = 54 // SAS
	FeishuDocxCodeLanguageSCSS         FeishuDocxCodeLanguage = 55 // SCSS
	FeishuDocxCodeLanguageSQL          FeishuDocxCodeLanguage = 56 // SQL
	FeishuDocxCodeLanguageScala        FeishuDocxCodeLanguage = 57 // Scala
	FeishuDocxCodeLanguageScheme       FeishuDocxCodeLanguage = 58 // Scheme
	FeishuDocxCodeLanguageScratch      FeishuDocxCodeLanguage = 59 // Scratch
	FeishuDocxCodeLanguageShell        FeishuDocxCodeLanguage = 60 // Shell
	FeishuDocxCodeLanguageSwift        FeishuDocxCodeLanguage = 61 // Swift
	FeishuDocxCodeLanguageThrift       FeishuDocxCodeLanguage = 62 // Thrift
	FeishuDocxCodeLanguageTypeScript   FeishuDocxCodeLanguage = 63 // TypeScript
	FeishuDocxCodeLanguageVBScript     FeishuDocxCodeLanguage = 64 // VBScript
	FeishuDocxCodeLanguageVisual       FeishuDocxCodeLanguage = 65 // Visual
	FeishuDocxCodeLanguageXML          FeishuDocxCodeLanguage = 66 // XML
	FeishuDocxCodeLanguageYAML         FeishuDocxCodeLanguage = 67 // YAML
	FeishuDocxCodeLanguageCMake        FeishuDocxCodeLanguage = 68 // CMake
	FeishuDocxCodeLanguageDiff         FeishuDocxCodeLanguage = 69 // Diff
	FeishuDocxCodeLanguageGherkin      FeishuDocxCodeLanguage = 70 // Gherkin
	FeishuDocxCodeLanguageGraphQL      FeishuDocxCodeLanguage = 71 // GraphQL
	FeishuDocxCodeLanguageOpenGL       FeishuDocxCodeLanguage = 72 // OpenGL Shading Language
	FeishuDocxCodeLanguageProperties   FeishuDocxCodeLanguage = 73 // Properties
	FeishuDocxCodeLanguageSolidity     FeishuDocxCodeLanguage = 74 // Solidity
	FeishuDocxCodeLanguageTOML         FeishuDocxCodeLanguage = 75 // TOML
)

var FeishuDocxCodeLang2MdStr = map[FeishuDocxCodeLanguage]string{
	FeishuDocxCodeLanguagePlainText:    "",
	FeishuDocxCodeLanguageABAP:         "abap",
	FeishuDocxCodeLanguageAda:          "ada",
	FeishuDocxCodeLanguageApache:       "apache",
	FeishuDocxCodeLanguageApex:         "apex",
	FeishuDocxCodeLanguageAssembly:     "assembly",
	FeishuDocxCodeLanguageBash:         "bash",
	FeishuDocxCodeLanguageCSharp:       "csharp",
	FeishuDocxCodeLanguageCPlusPlus:    "cpp",
	FeishuDocxCodeLanguageC:            "c",
	FeishuDocxCodeLanguageCOBOL:        "cobol",
	FeishuDocxCodeLanguageCSS:          "css",
	FeishuDocxCodeLanguageCoffeeScript: "coffeescript",
	FeishuDocxCodeLanguageD:            "d",
	FeishuDocxCodeLanguageDart:         "dart",
	FeishuDocxCodeLanguageDelphi:       "delphi",
	FeishuDocxCodeLanguageDjango:       "django",
	FeishuDocxCodeLanguageDockerfile:   "dockerfile",
	FeishuDocxCodeLanguageErlang:       "erlang",
	FeishuDocxCodeLanguageFortran:      "fortran",
	FeishuDocxCodeLanguageFoxPro:       "foxpro",
	FeishuDocxCodeLanguageGo:           "go",
	FeishuDocxCodeLanguageGroovy:       "groovy",
	FeishuDocxCodeLanguageHTML:         "html",
	FeishuDocxCodeLanguageHTMLBars:     "htmlbars",
	FeishuDocxCodeLanguageHTTP:         "http",
	FeishuDocxCodeLanguageHaskell:      "haskell",
	FeishuDocxCodeLanguageJSON:         "json",
	FeishuDocxCodeLanguageJava:         "java",
	FeishuDocxCodeLanguageJavaScript:   "javascript",
	FeishuDocxCodeLanguageJulia:        "julia",
	FeishuDocxCodeLanguageKotlin:       "kotlin",
	FeishuDocxCodeLanguageLateX:        "latex",
	FeishuDocxCodeLanguageLisp:         "lisp",
	FeishuDocxCodeLanguageLogo:         "logo",
	FeishuDocxCodeLanguageLua:          "lua",
	FeishuDocxCodeLanguageMATLAB:       "matlab",
	FeishuDocxCodeLanguageMakefile:     "makefile",
	FeishuDocxCodeLanguageMarkdown:     "markdown",
	FeishuDocxCodeLanguageNginx:        "nginx",
	FeishuDocxCodeLanguageObjective:    "objectivec",
	FeishuDocxCodeLanguageOpenEdgeABL:  "openedge-abl",
	FeishuDocxCodeLanguagePHP:          "php",
	FeishuDocxCodeLanguagePerl:         "perl",
	FeishuDocxCodeLanguagePostScript:   "postscript",
	FeishuDocxCodeLanguagePower:        "powershell",
	FeishuDocxCodeLanguageProlog:       "prolog",
	FeishuDocxCodeLanguageProtoBuf:     "protobuf",
	FeishuDocxCodeLanguagePython:       "python",
	FeishuDocxCodeLanguageR:            "r",
	FeishuDocxCodeLanguageRPG:          "rpg",
	FeishuDocxCodeLanguageRuby:         "ruby",
	FeishuDocxCodeLanguageRust:         "rust",
	FeishuDocxCodeLanguageSAS:          "sas",
	FeishuDocxCodeLanguageSCSS:         "scss",
	FeishuDocxCodeLanguageSQL:          "sql",
	FeishuDocxCodeLanguageScala:        "scala",
	FeishuDocxCodeLanguageScheme:       "scheme",
	FeishuDocxCodeLanguageScratch:      "scratch",
	FeishuDocxCodeLanguageShell:        "shell",
	FeishuDocxCodeLanguageSwift:        "swift",
	FeishuDocxCodeLanguageThrift:       "thrift",
	FeishuDocxCodeLanguageTypeScript:   "typescript",
	FeishuDocxCodeLanguageVBScript:     "vbscript",
	FeishuDocxCodeLanguageVisual:       "vbnet",
	FeishuDocxCodeLanguageXML:          "xml",
	FeishuDocxCodeLanguageYAML:         "yaml",
	FeishuDocxCodeLanguageCMake:        "yaml",
	FeishuDocxCodeLanguageDiff:         "yaml",
	FeishuDocxCodeLanguageGherkin:      "gherkin",
	FeishuDocxCodeLanguageGraphQL:      "graphql",
	FeishuDocxCodeLanguageOpenGL:       "opengl",
	FeishuDocxCodeLanguageProperties:   "properties",
	FeishuDocxCodeLanguageSolidity:     "solidity",
	FeishuDocxCodeLanguageTOML:         "toml",
}

const FeishuImageFormatURLForTos = "<img src=\"%s\" data-tos-key=\"%s\" >"
const FeishuImageFormatURLForSrc = "<img src=\"%s\">"

const RetrieveImageMaxRetry = 3

const (
	FileBizTypeBizConnectorImage = "FileBizType.BIZ_CONNECTOR_IMAGE"
)

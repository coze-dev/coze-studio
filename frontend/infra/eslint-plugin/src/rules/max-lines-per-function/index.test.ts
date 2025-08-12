/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { RuleTester } from 'eslint';
import { maxLinePerFunctionRule } from './index';

const ruleTester = new RuleTester({});

ruleTester.run('max-lines-per-function', maxLinePerFunctionRule, {
  valid: [
    // Test code in global scope doesn't count
    {
      code: 'var x = 5;\nvar x = 2;\n',
      options: [{ max: 1 }],
    },

    // Test single line standalone function
    {
      code: 'function name() {}',
      options: [{ max: 1 }],
    },

    // Test standalone function with lines of code
    {
      code: 'function name() {\nvar x = 5;\nvar x = 2;\n}',
      options: [{ max: 4 }],
    },

    // Test inline arrow function
    {
      code: 'const bar = () => 2',
      options: [{ max: 1 }],
    },

    // Test arrow function
    {
      code: 'const bar = () => {\nconst x = 2 + 1;\nreturn x;\n}',
      options: [{ max: 4 }],
    },

    // skipBlankLines: false with simple standalone function
    {
      code: 'function name() {\nvar x = 5;\n\t\n \n\nvar x = 2;\n}',
      options: [{ max: 7 }],
    },
    //  single line comment
    {
      code: "function name() {\nvar x = 5;\n// a comment on it's own line\nvar x = 2; // end of line comment\n}",
      options: [{ max: 5 }],
    },

    // multiple different comment types
    {
      code: 'function name() {\nvar x = 5;\n/* a \n multi \n line \n comment \n*/\n\nvar x = 2; // end of line comment\n}',
      options: [{ max: 10 }],
    },

    //  with multiple different comment types, including trailing and leading whitespace
    {
      code: 'function name() {\nvar x = 5;\n\t/* a comment with leading whitespace */\n/* a comment with trailing whitespace */\t\t\n\t/* a comment with trailing and leading whitespace */\t\t\n/* a \n multi \n line \n comment \n*/\t\t\n\nvar x = 2; // end of line comment\n}',
      options: [{ max: 13 }],
    },

    // Multiple params on separate lines test
    {
      code: `function foo(
        aaa = 1,
        bbb = 2,
        ccc = 3
    ) {
        return aaa + bbb + ccc
    }`,
      options: [{ max: 7 }],
    },

    // IIFE validity test
    {
      code: `(
    function
    ()
    {
    }
    )
    ()`,
      options: [{ max: 4 }],
    },

    {
      code: `function parent() {
    var x = 0;
    function nested() {
        var y = 0;
        x = 2;
    }
    if ( x === y ) {
        x++;
    }
    }`,
      options: [{ max: 10 }],
    },

    // Class method validity test
    {
      code: `class foo {
        method() {
            let y = 10;
            let x = 20;
            return y + x;
        }
    }`,
      options: [{ max: 5 }],
    },

    // IIFEs
    {
      code: `(function(){
        let x = 0;
        let y = 0;
        let z = x + y;
        let foo = {};
        return bar;
    }());`,
      options: [{ max: 7 }],
    },
  ],

  invalid: [
    // Test simple standalone function is recognized
    {
      code: 'function name() {\n}',
      options: [{ max: 1 }],
      errors: [
        {
          messageId: 'exceed',
          data: { name: "function 'name'", lineCount: 2, maxLines: 1 },
        },
      ],
    },

    // Test anonymous function assigned to variable is recognized
    {
      code: 'var func = function() {\n}',
      options: [{ max: 1 }],
      errors: [
        {
          messageId: 'exceed',
          data: { name: "function 'func'", lineCount: 2, maxLines: 1 },
        },
      ],
    },

    // Test arrow functions are recognized
    {
      code: 'const bar = () => {\nconst x = 2 + 1;\nreturn x;\n}',
      options: [{ max: 3 }],
      errors: [
        {
          messageId: 'exceed',
          data: { name: "Arrow function 'bar'", lineCount: 4, maxLines: 3 },
        },
      ],
    },

    // Test inline arrow functions are recognized
    {
      code: 'const bar = () =>\n 2',
      options: [{ max: 1 }],
      errors: [
        {
          messageId: 'exceed',
          data: { name: "Arrow function 'bar'", lineCount: 2, maxLines: 1 },
        },
      ],
    },

    // Test that option defaults work as expected
    {
      code: `() => {${'var foo\n'.repeat(150)}}`,
      options: [{}],
      errors: [
        {
          messageId: 'exceed',
          data: { name: 'Arrow function', lineCount: 151, maxLines: 150 },
        },
      ],
    },

    // Test skipBlankLines: false
    {
      code: 'function name() {\nvar x = 5;\n\t\n \n\nvar x = 2;\n}',
      options: [{ max: 6 }],
      errors: [
        {
          messageId: 'exceed',
          data: { name: "function 'name'", lineCount: 7, maxLines: 6 },
        },
      ],
    },

    // Test skipBlankLines: false with CRLF line endings
    {
      code: 'function name() {\r\nvar x = 5;\r\n\t\r\n \r\n\r\nvar x = 2;\r\n}',
      options: [{ max: 6 }],
      errors: [
        {
          messageId: 'exceed',
          data: { name: "function 'name'", lineCount: 7, maxLines: 6 },
        },
      ],
    },

    //
    {
      code: 'function name() {\nvar x = 5;\n\t\n \n\nvar x = 2;\n}',
      options: [{ max: 2 }],
      errors: [
        {
          messageId: 'exceed',
          data: { name: "function 'name'", lineCount: 7, maxLines: 2 },
        },
      ],
    },

    // with CRLF line endings
    {
      code: 'function name() {\r\nvar x = 5;\r\n\t\r\n \r\n\r\nvar x = 2;\r\n}',
      options: [{ max: 2 }],
      errors: [
        {
          messageId: 'exceed',
          data: { name: "function 'name'", lineCount: 7, maxLines: 2 },
        },
      ],
    },

    //  for multiple types of comment
    {
      code: 'function name() { // end of line comment\nvar x = 5; /* mid line comment */\n\t// single line comment taking up whole line\n\t\n \n\nvar x = 2;\n}',
      options: [{ max: 6 }],
      errors: [
        {
          messageId: 'exceed',
          data: { name: "function 'name'", lineCount: 8, maxLines: 6 },
        },
      ],
    },

    // Test simple standalone function with params on separate lines
    {
      code: `function foo(
        aaa = 1,
        bbb = 2,
        ccc = 3
    ) {
        return aaa + bbb + ccc
    }`,
      options: [{ max: 2 }],
      errors: [
        {
          messageId: 'exceed',
          data: { name: "function 'foo'", lineCount: 7, maxLines: 2 },
        },
      ],
    },

    // Test IIFE "function" keyword is included in the count
    {
      code: `(
    function
    ()
    {
    }
    )
    ()`,
      options: [{ max: 2 }],
      errors: [
        {
          messageId: 'exceed',
          data: { name: 'function', lineCount: 4, maxLines: 2 },
        },
      ],
    },
    // Test Generator
    {
      code: ` function* generator() {
            yield 1;
            yield 2;
            yield 3;
          }`,
      options: [{ max: 2 }],
      errors: [
        {
          messageId: 'exceed',
          data: {
            name: "generator function 'generator'",
            lineCount: 5,
            maxLines: 2,
          },
        },
      ],
    },

    // Test nested functions are included in it's parent's function count.
    {
      code: `function parent() {
    var x = 0;
    function nested() {
        var y = 0;
        x = 2;
    }
    if ( x === y ) {
        x++;
    }
    }`,
      options: [{ max: 9 }],
      errors: [
        {
          messageId: 'exceed',
          data: { name: "function 'parent'", lineCount: 10, maxLines: 9 },
        },
      ],
    },

    // Test nested functions are included in it's parent's function count.
    {
      code: `function parent() {
              var x = 0;
              function nested() {
              var y = 0;
              x = 2;
              }
              if ( x === y ) {
                 x++;
                }
              }`,
      options: [{ max: 2 }],
      errors: [
        {
          messageId: 'exceed',
          data: { name: "function 'parent'", lineCount: 10, maxLines: 2 },
        },
        {
          messageId: 'exceed',
          data: { name: "function 'nested'", lineCount: 4, maxLines: 2 },
        },
      ],
    },

    // Test regular methods are recognized
    {
      code: `class foo {
        method() {
            let y = 10;
            let x = 20;
            return y + x;
        }
    }`,
      options: [{ max: 2 }],
      errors: [
        {
          messageId: 'exceed',
          data: { name: "method 'method'", lineCount: 5, maxLines: 2 },
        },
      ],
    },

    // Test static methods are recognized
    {
      code: `class A {
        static foo (a) {
            return a
        }
     }`,
      options: [{ max: 2 }],
      errors: [
        {
          messageId: 'exceed',
          data: { name: "static method 'foo'", lineCount: 3, maxLines: 2 },
        },
      ],
    },

    // Test private methods are recognized
    {
      code: `class A {
        #privateMethod() {
          return "hello world";
        }
     }`,
      options: [{ max: 2 }],
      errors: [
        {
          messageId: 'exceed',
          data: {
            name: 'private method #privateMethod',
            lineCount: 3,
            maxLines: 2,
          },
        },
      ],
    },

    // Test getters are recognized as properties
    {
      code: `var obj = {
        get
        foo
        () {
            return 1
        }
    }`,
      options: [{ max: 2 }],
      errors: [
        {
          messageId: 'exceed',
          data: { name: "getter 'foo'", lineCount: 5, maxLines: 2 },
        },
      ],
    },

    // Test setters are recognized as properties
    {
      code: `var obj = {
        set
        foo
        ( val ) {
            this._foo = val;
        }
    }`,
      options: [{ max: 2 }],
      errors: [
        {
          messageId: 'exceed',
          data: { name: "setter 'foo'", lineCount: 5, maxLines: 2 },
        },
      ],
    },

    // Test computed property names
    {
      code: `class A {
        static
        [
            foo +
                bar
        ]
        (a) {
            return a
        }
    }`,
      options: [{ max: 2 }],
      errors: [
        {
          messageId: 'exceed',
          data: { name: 'static method', lineCount: 8, maxLines: 2 },
        },
      ],
    },
    // Test computed property names with TemplateLiteral
    {
      code: `class A {
          static
          [
              \`s\`
          ]
          () {

          }
      }`,
      options: [{ max: 2 }],
      errors: [
        {
          messageId: 'exceed',
          data: { name: "static method 's'", lineCount: 7, maxLines: 2 },
        },
      ],
    },

    // Test computed property names with Literal
    {
      code: `class A {
          static
          "literal"
          () {

          }
      }`,
      options: [{ max: 2 }],
      errors: [
        {
          messageId: 'exceed',
          data: { name: "static method 'literal'", lineCount: 5, maxLines: 2 },
        },
      ],
    },

    // Test computed property names with null
    {
      code: `class A {
            static
            null
            () {

            }
        }`,
      options: [{ max: 2 }],
      errors: [
        {
          messageId: 'exceed',
          data: { name: "static method 'null'", lineCount: 5, maxLines: 2 },
        },
      ],
    },

    // Test the IIFEs option
    {
      code: `(function(){
        let x = 0;
        let y = 0;
        let z = x + y;
        let foo = {};
        return bar;
    }());`,
      options: [{ max: 2 }],
      errors: [
        {
          messageId: 'exceed',
          data: { name: 'function', lineCount: 7, maxLines: 2 },
        },
      ],
    },
  ],
});

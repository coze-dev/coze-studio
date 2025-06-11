// nolint: cyclo_complexity, method_line
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/InternalError.js
var require_InternalError = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/InternalError.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InternalError = void 0;
    var InternalError = class extends Error {
      constructor(message) {
        super(InternalError._formatMessage(message));
        this.__proto__ = InternalError.prototype;
        this.unformattedMessage = message;
        if (InternalError.breakInDebugger) {
          debugger;
        }
      }
      static _formatMessage(unformattedMessage) {
        return `Internal Error: ${unformattedMessage}

You have encountered a software defect. Please consider reporting the issue to the maintainers of this application.`;
      }
      toString() {
        return this.message;
      }
    };
    exports.InternalError = InternalError;
    InternalError.breakInDebugger = true;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/TypeUuid.js
var require_TypeUuid = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/TypeUuid.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TypeUuid = void 0;
    var InternalError_1 = require_InternalError();
    var classPrototypeUuidSymbol = Symbol.for("TypeUuid.classPrototypeUuid");
    var TypeUuid = class {
      static registerClass(targetClass, typeUuid) {
        if (typeof targetClass !== "function") {
          throw new Error("The targetClass parameter must be a JavaScript class");
        }
        if (!TypeUuid._uuidRegExp.test(typeUuid)) {
          throw new Error(`The type UUID must be specified as lowercase hexadecimal with dashes: "${typeUuid}"`);
        }
        const targetClassPrototype = targetClass.prototype;
        if (Object.hasOwnProperty.call(targetClassPrototype, classPrototypeUuidSymbol)) {
          const existingUuid = targetClassPrototype[classPrototypeUuidSymbol];
          throw new InternalError_1.InternalError(`Cannot register the target class ${targetClass.name || ""} typeUuid=${typeUuid} because it was already registered with typeUuid=${existingUuid}`);
        }
        targetClassPrototype[classPrototypeUuidSymbol] = typeUuid;
      }
      static isInstanceOf(targetObject, typeUuid) {
        if (targetObject === void 0 || targetObject === null) {
          return false;
        }
        let objectPrototype = Object.getPrototypeOf(targetObject);
        while (objectPrototype !== void 0 && objectPrototype !== null) {
          const registeredUuid = objectPrototype[classPrototypeUuidSymbol];
          if (registeredUuid === typeUuid) {
            return true;
          }
          objectPrototype = Object.getPrototypeOf(objectPrototype);
        }
        return false;
      }
    };
    exports.TypeUuid = TypeUuid;
    TypeUuid._uuidRegExp = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/AlreadyReportedError.js
var require_AlreadyReportedError = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/AlreadyReportedError.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AlreadyReportedError = void 0;
    var TypeUuid_1 = require_TypeUuid();
    var uuidAlreadyReportedError = "f26b0640-a49b-49d1-9ead-1a516d5920c7";
    var AlreadyReportedError = class extends Error {
      constructor() {
        super("An error occurred.");
        this.__proto__ = AlreadyReportedError.prototype;
      }
      static [Symbol.hasInstance](instance) {
        return TypeUuid_1.TypeUuid.isInstanceOf(instance, uuidAlreadyReportedError);
      }
    };
    exports.AlreadyReportedError = AlreadyReportedError;
    TypeUuid_1.TypeUuid.registerClass(AlreadyReportedError, uuidAlreadyReportedError);
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Terminal/Colors.js
var require_Colors = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Terminal/Colors.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Colors = exports.ConsoleColorCodes = exports.TextAttribute = exports.ColorValue = exports.eolSequence = void 0;
    exports.eolSequence = {
      isEol: true
    };
    var ColorValue;
    (function(ColorValue2) {
      ColorValue2[ColorValue2["Black"] = 0] = "Black";
      ColorValue2[ColorValue2["Red"] = 1] = "Red";
      ColorValue2[ColorValue2["Green"] = 2] = "Green";
      ColorValue2[ColorValue2["Yellow"] = 3] = "Yellow";
      ColorValue2[ColorValue2["Blue"] = 4] = "Blue";
      ColorValue2[ColorValue2["Magenta"] = 5] = "Magenta";
      ColorValue2[ColorValue2["Cyan"] = 6] = "Cyan";
      ColorValue2[ColorValue2["White"] = 7] = "White";
      ColorValue2[ColorValue2["Gray"] = 8] = "Gray";
    })(ColorValue = exports.ColorValue || (exports.ColorValue = {}));
    var TextAttribute;
    (function(TextAttribute2) {
      TextAttribute2[TextAttribute2["Bold"] = 0] = "Bold";
      TextAttribute2[TextAttribute2["Dim"] = 1] = "Dim";
      TextAttribute2[TextAttribute2["Underline"] = 2] = "Underline";
      TextAttribute2[TextAttribute2["Blink"] = 3] = "Blink";
      TextAttribute2[TextAttribute2["InvertColor"] = 4] = "InvertColor";
      TextAttribute2[TextAttribute2["Hidden"] = 5] = "Hidden";
    })(TextAttribute = exports.TextAttribute || (exports.TextAttribute = {}));
    var ConsoleColorCodes;
    (function(ConsoleColorCodes2) {
      ConsoleColorCodes2[ConsoleColorCodes2["BlackForeground"] = 30] = "BlackForeground";
      ConsoleColorCodes2[ConsoleColorCodes2["RedForeground"] = 31] = "RedForeground";
      ConsoleColorCodes2[ConsoleColorCodes2["GreenForeground"] = 32] = "GreenForeground";
      ConsoleColorCodes2[ConsoleColorCodes2["YellowForeground"] = 33] = "YellowForeground";
      ConsoleColorCodes2[ConsoleColorCodes2["BlueForeground"] = 34] = "BlueForeground";
      ConsoleColorCodes2[ConsoleColorCodes2["MagentaForeground"] = 35] = "MagentaForeground";
      ConsoleColorCodes2[ConsoleColorCodes2["CyanForeground"] = 36] = "CyanForeground";
      ConsoleColorCodes2[ConsoleColorCodes2["WhiteForeground"] = 37] = "WhiteForeground";
      ConsoleColorCodes2[ConsoleColorCodes2["GrayForeground"] = 90] = "GrayForeground";
      ConsoleColorCodes2[ConsoleColorCodes2["DefaultForeground"] = 39] = "DefaultForeground";
      ConsoleColorCodes2[ConsoleColorCodes2["BlackBackground"] = 40] = "BlackBackground";
      ConsoleColorCodes2[ConsoleColorCodes2["RedBackground"] = 41] = "RedBackground";
      ConsoleColorCodes2[ConsoleColorCodes2["GreenBackground"] = 42] = "GreenBackground";
      ConsoleColorCodes2[ConsoleColorCodes2["YellowBackground"] = 43] = "YellowBackground";
      ConsoleColorCodes2[ConsoleColorCodes2["BlueBackground"] = 44] = "BlueBackground";
      ConsoleColorCodes2[ConsoleColorCodes2["MagentaBackground"] = 45] = "MagentaBackground";
      ConsoleColorCodes2[ConsoleColorCodes2["CyanBackground"] = 46] = "CyanBackground";
      ConsoleColorCodes2[ConsoleColorCodes2["WhiteBackground"] = 47] = "WhiteBackground";
      ConsoleColorCodes2[ConsoleColorCodes2["GrayBackground"] = 100] = "GrayBackground";
      ConsoleColorCodes2[ConsoleColorCodes2["DefaultBackground"] = 49] = "DefaultBackground";
      ConsoleColorCodes2[ConsoleColorCodes2["Bold"] = 1] = "Bold";
      ConsoleColorCodes2[ConsoleColorCodes2["Dim"] = 2] = "Dim";
      ConsoleColorCodes2[ConsoleColorCodes2["NormalColorOrIntensity"] = 22] = "NormalColorOrIntensity";
      ConsoleColorCodes2[ConsoleColorCodes2["Underline"] = 4] = "Underline";
      ConsoleColorCodes2[ConsoleColorCodes2["UnderlineOff"] = 24] = "UnderlineOff";
      ConsoleColorCodes2[ConsoleColorCodes2["Blink"] = 5] = "Blink";
      ConsoleColorCodes2[ConsoleColorCodes2["BlinkOff"] = 25] = "BlinkOff";
      ConsoleColorCodes2[ConsoleColorCodes2["InvertColor"] = 7] = "InvertColor";
      ConsoleColorCodes2[ConsoleColorCodes2["InvertColorOff"] = 27] = "InvertColorOff";
      ConsoleColorCodes2[ConsoleColorCodes2["Hidden"] = 8] = "Hidden";
      ConsoleColorCodes2[ConsoleColorCodes2["HiddenOff"] = 28] = "HiddenOff";
    })(ConsoleColorCodes = exports.ConsoleColorCodes || (exports.ConsoleColorCodes = {}));
    var Colors2 = class {
      static black(text) {
        return Object.assign(Object.assign({}, Colors2._normalizeStringOrColorableSequence(text)), { foregroundColor: ColorValue.Black });
      }
      static red(text) {
        return Object.assign(Object.assign({}, Colors2._normalizeStringOrColorableSequence(text)), { foregroundColor: ColorValue.Red });
      }
      static green(text) {
        return Object.assign(Object.assign({}, Colors2._normalizeStringOrColorableSequence(text)), { foregroundColor: ColorValue.Green });
      }
      static yellow(text) {
        return Object.assign(Object.assign({}, Colors2._normalizeStringOrColorableSequence(text)), { foregroundColor: ColorValue.Yellow });
      }
      static blue(text) {
        return Object.assign(Object.assign({}, Colors2._normalizeStringOrColorableSequence(text)), { foregroundColor: ColorValue.Blue });
      }
      static magenta(text) {
        return Object.assign(Object.assign({}, Colors2._normalizeStringOrColorableSequence(text)), { foregroundColor: ColorValue.Magenta });
      }
      static cyan(text) {
        return Object.assign(Object.assign({}, Colors2._normalizeStringOrColorableSequence(text)), { foregroundColor: ColorValue.Cyan });
      }
      static white(text) {
        return Object.assign(Object.assign({}, Colors2._normalizeStringOrColorableSequence(text)), { foregroundColor: ColorValue.White });
      }
      static gray(text) {
        return Object.assign(Object.assign({}, Colors2._normalizeStringOrColorableSequence(text)), { foregroundColor: ColorValue.Gray });
      }
      static blackBackground(text) {
        return Object.assign(Object.assign({}, Colors2._normalizeStringOrColorableSequence(text)), { backgroundColor: ColorValue.Black });
      }
      static redBackground(text) {
        return Object.assign(Object.assign({}, Colors2._normalizeStringOrColorableSequence(text)), { backgroundColor: ColorValue.Red });
      }
      static greenBackground(text) {
        return Object.assign(Object.assign({}, Colors2._normalizeStringOrColorableSequence(text)), { backgroundColor: ColorValue.Green });
      }
      static yellowBackground(text) {
        return Object.assign(Object.assign({}, Colors2._normalizeStringOrColorableSequence(text)), { backgroundColor: ColorValue.Yellow });
      }
      static blueBackground(text) {
        return Object.assign(Object.assign({}, Colors2._normalizeStringOrColorableSequence(text)), { backgroundColor: ColorValue.Blue });
      }
      static magentaBackground(text) {
        return Object.assign(Object.assign({}, Colors2._normalizeStringOrColorableSequence(text)), { backgroundColor: ColorValue.Magenta });
      }
      static cyanBackground(text) {
        return Object.assign(Object.assign({}, Colors2._normalizeStringOrColorableSequence(text)), { backgroundColor: ColorValue.Cyan });
      }
      static whiteBackground(text) {
        return Object.assign(Object.assign({}, Colors2._normalizeStringOrColorableSequence(text)), { backgroundColor: ColorValue.White });
      }
      static grayBackground(text) {
        return Object.assign(Object.assign({}, Colors2._normalizeStringOrColorableSequence(text)), { backgroundColor: ColorValue.Gray });
      }
      static bold(text) {
        return Colors2._applyTextAttribute(text, TextAttribute.Bold);
      }
      static dim(text) {
        return Colors2._applyTextAttribute(text, TextAttribute.Dim);
      }
      static underline(text) {
        return Colors2._applyTextAttribute(text, TextAttribute.Underline);
      }
      static blink(text) {
        return Colors2._applyTextAttribute(text, TextAttribute.Blink);
      }
      static invertColor(text) {
        return Colors2._applyTextAttribute(text, TextAttribute.InvertColor);
      }
      static hidden(text) {
        return Colors2._applyTextAttribute(text, TextAttribute.Hidden);
      }
      static _normalizeStringOrColorableSequence(value) {
        if (typeof value === "string") {
          return {
            text: value
          };
        } else {
          return value;
        }
      }
      static _applyTextAttribute(text, attribute) {
        const sequence = Colors2._normalizeStringOrColorableSequence(text);
        if (!sequence.textAttributes) {
          sequence.textAttributes = [];
        }
        sequence.textAttributes.push(attribute);
        return sequence;
      }
    };
    exports.Colors = Colors2;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Terminal/AnsiEscape.js
var require_AnsiEscape = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Terminal/AnsiEscape.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AnsiEscape = void 0;
    var Colors_1 = require_Colors();
    var AnsiEscape = class {
      static removeCodes(text) {
        return text.replace(AnsiEscape._csiRegExp, "");
      }
      static formatForTests(text, options) {
        if (!options) {
          options = {};
        }
        let result = text.replace(AnsiEscape._csiRegExp, (capture, csiCode) => {
          const match = csiCode.match(AnsiEscape._sgrRegExp);
          if (match) {
            const sgrParameter = parseInt(match[1]);
            const sgrParameterName = AnsiEscape._tryGetSgrFriendlyName(sgrParameter);
            if (sgrParameterName) {
              return `[${sgrParameterName}]`;
            }
          }
          return `[${csiCode}]`;
        });
        if (options.encodeNewlines) {
          result = result.replace(AnsiEscape._backslashNRegExp, "[n]").replace(AnsiEscape._backslashRRegExp, `[r]`);
        }
        return result;
      }
      static _tryGetSgrFriendlyName(sgiParameter) {
        switch (sgiParameter) {
          case Colors_1.ConsoleColorCodes.BlackForeground:
            return "black";
          case Colors_1.ConsoleColorCodes.RedForeground:
            return "red";
          case Colors_1.ConsoleColorCodes.GreenForeground:
            return "green";
          case Colors_1.ConsoleColorCodes.YellowForeground:
            return "yellow";
          case Colors_1.ConsoleColorCodes.BlueForeground:
            return "blue";
          case Colors_1.ConsoleColorCodes.MagentaForeground:
            return "magenta";
          case Colors_1.ConsoleColorCodes.CyanForeground:
            return "cyan";
          case Colors_1.ConsoleColorCodes.WhiteForeground:
            return "white";
          case Colors_1.ConsoleColorCodes.GrayForeground:
            return "gray";
          case Colors_1.ConsoleColorCodes.DefaultForeground:
            return "default";
          case Colors_1.ConsoleColorCodes.BlackBackground:
            return "black-bg";
          case Colors_1.ConsoleColorCodes.RedBackground:
            return "red-bg";
          case Colors_1.ConsoleColorCodes.GreenBackground:
            return "green-bg";
          case Colors_1.ConsoleColorCodes.YellowBackground:
            return "yellow-bg";
          case Colors_1.ConsoleColorCodes.BlueBackground:
            return "blue-bg";
          case Colors_1.ConsoleColorCodes.MagentaBackground:
            return "magenta-bg";
          case Colors_1.ConsoleColorCodes.CyanBackground:
            return "cyan-bg";
          case Colors_1.ConsoleColorCodes.WhiteBackground:
            return "white-bg";
          case Colors_1.ConsoleColorCodes.GrayBackground:
            return "gray-bg";
          case Colors_1.ConsoleColorCodes.DefaultBackground:
            return "default-bg";
          case Colors_1.ConsoleColorCodes.Bold:
            return "bold";
          case Colors_1.ConsoleColorCodes.Dim:
            return "dim";
          case Colors_1.ConsoleColorCodes.NormalColorOrIntensity:
            return "normal";
          case Colors_1.ConsoleColorCodes.Underline:
            return "underline";
          case Colors_1.ConsoleColorCodes.UnderlineOff:
            return "underline-off";
          case Colors_1.ConsoleColorCodes.Blink:
            return "blink";
          case Colors_1.ConsoleColorCodes.BlinkOff:
            return "blink-off";
          case Colors_1.ConsoleColorCodes.InvertColor:
            return "invert";
          case Colors_1.ConsoleColorCodes.InvertColorOff:
            return "invert-off";
          case Colors_1.ConsoleColorCodes.Hidden:
            return "hidden";
          case Colors_1.ConsoleColorCodes.HiddenOff:
            return "hidden-off";
          default:
            return void 0;
        }
      }
    };
    exports.AnsiEscape = AnsiEscape;
    AnsiEscape._csiRegExp = /\x1b\[([\x30-\x3f]*[\x20-\x2f]*[\x40-\x7e])/gu;
    AnsiEscape._sgrRegExp = /([0-9]+)m/u;
    AnsiEscape._backslashNRegExp = /\n/g;
    AnsiEscape._backslashRRegExp = /\r/g;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Async.js
var require_Async = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Async.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Async = void 0;
    var Async = class {
      static async mapAsync(iterable, callback, options) {
        const result = [];
        await Async.forEachAsync(iterable, async (item, arrayIndex) => {
          result[arrayIndex] = await callback(item, arrayIndex);
        }, options);
        return result;
      }
      static async forEachAsync(iterable, callback, options) {
        await new Promise((resolve, reject) => {
          const concurrency = (options === null || options === void 0 ? void 0 : options.concurrency) && options.concurrency > 0 ? options.concurrency : Infinity;
          let operationsInProgress = 0;
          const iterator = (iterable[Symbol.iterator] || iterable[Symbol.asyncIterator]).call(iterable);
          let arrayIndex = 0;
          let iteratorIsComplete = false;
          let promiseHasResolvedOrRejected = false;
          async function queueOperationsAsync() {
            while (operationsInProgress < concurrency && !iteratorIsComplete && !promiseHasResolvedOrRejected) {
              operationsInProgress++;
              const currentIteratorResult = await iterator.next();
              iteratorIsComplete = !!currentIteratorResult.done;
              if (!iteratorIsComplete) {
                Promise.resolve(callback(currentIteratorResult.value, arrayIndex++)).then(async () => {
                  operationsInProgress--;
                  await onOperationCompletionAsync();
                }).catch((error) => {
                  promiseHasResolvedOrRejected = true;
                  reject(error);
                });
              } else {
                operationsInProgress--;
              }
            }
            if (iteratorIsComplete) {
              await onOperationCompletionAsync();
            }
          }
          async function onOperationCompletionAsync() {
            if (!promiseHasResolvedOrRejected) {
              if (operationsInProgress === 0 && iteratorIsComplete) {
                promiseHasResolvedOrRejected = true;
                resolve();
              } else if (!iteratorIsComplete) {
                await queueOperationsAsync();
              }
            }
          }
          queueOperationsAsync().catch((error) => {
            promiseHasResolvedOrRejected = true;
            reject(error);
          });
        });
      }
      static async sleep(ms) {
        await new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
      }
      static async runWithRetriesAsync({ action, maxRetries, retryDelayMs = 0 }) {
        let retryCounter = 0;
        while (true) {
          try {
            return await action();
          } catch (e) {
            if (++retryCounter > maxRetries) {
              throw e;
            } else if (retryDelayMs > 0) {
              await Async.sleep(retryDelayMs);
            }
          }
        }
      }
    };
    exports.Async = Async;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Constants.js
var require_Constants = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Constants.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FolderConstants = exports.FileConstants = void 0;
    var FileConstants;
    (function(FileConstants2) {
      FileConstants2["PackageJson"] = "package.json";
    })(FileConstants = exports.FileConstants || (exports.FileConstants = {}));
    var FolderConstants;
    (function(FolderConstants2) {
      FolderConstants2["Git"] = ".git";
      FolderConstants2["NodeModules"] = "node_modules";
    })(FolderConstants = exports.FolderConstants || (exports.FolderConstants = {}));
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Enum.js
var require_Enum = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Enum.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Enum = void 0;
    var Enum = class {
      constructor() {
      }
      static tryGetValueByKey(enumObject, key) {
        return enumObject[key];
      }
      static getValueByKey(enumObject, key) {
        const result = enumObject[key];
        if (result === void 0) {
          throw new Error(`The lookup key ${JSON.stringify(key)} is not defined`);
        }
        return result;
      }
      static tryGetKeyByNumber(enumObject, value) {
        return enumObject[value];
      }
      static getKeyByNumber(enumObject, value) {
        const result = enumObject[value];
        if (result === void 0) {
          throw new Error(`The value ${value} does not exist in the mapping`);
        }
        return result;
      }
    };
    exports.Enum = Enum;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/EnvironmentMap.js
var require_EnvironmentMap = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/EnvironmentMap.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EnvironmentMap = void 0;
    var process_1 = __importDefault(require("process"));
    var InternalError_1 = require_InternalError();
    var EnvironmentMap = class {
      constructor(environmentObject = {}) {
        this._map = /* @__PURE__ */ new Map();
        Object.defineProperty(this, "_sanityCheck", {
          enumerable: true,
          get: function() {
            throw new InternalError_1.InternalError("Attempt to read EnvironmentMap class as an object");
          }
        });
        this.caseSensitive = process_1.default.platform !== "win32";
        this.mergeFromObject(environmentObject);
      }
      clear() {
        this._map.clear();
      }
      set(name, value) {
        const key = this.caseSensitive ? name : name.toUpperCase();
        this._map.set(key, { name, value });
      }
      unset(name) {
        const key = this.caseSensitive ? name : name.toUpperCase();
        this._map.delete(key);
      }
      get(name) {
        const key = this.caseSensitive ? name : name.toUpperCase();
        const entry = this._map.get(key);
        if (entry === void 0) {
          return void 0;
        }
        return entry.value;
      }
      names() {
        return this._map.keys();
      }
      entries() {
        return this._map.values();
      }
      mergeFrom(environmentMap) {
        for (const entry of environmentMap.entries()) {
          this.set(entry.name, entry.value);
        }
      }
      mergeFromObject(environmentObject = {}) {
        for (const [name, value] of Object.entries(environmentObject)) {
          if (value !== void 0) {
            this.set(name, value);
          }
        }
      }
      toObject() {
        const result = {};
        for (const entry of this.entries()) {
          result[entry.name] = entry.value;
        }
        return result;
      }
    };
    exports.EnvironmentMap = EnvironmentMap;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/universalify@0.1.2/node_modules/universalify/index.js
var require_universalify = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/universalify@0.1.2/node_modules/universalify/index.js"(exports) {
    "use strict";
    exports.fromCallback = function(fn) {
      return Object.defineProperty(function() {
        if (typeof arguments[arguments.length - 1] === "function")
          fn.apply(this, arguments);
        else {
          return new Promise((resolve, reject) => {
            arguments[arguments.length] = (err, res) => {
              if (err)
                return reject(err);
              resolve(res);
            };
            arguments.length++;
            fn.apply(this, arguments);
          });
        }
      }, "name", { value: fn.name });
    };
    exports.fromPromise = function(fn) {
      return Object.defineProperty(function() {
        const cb = arguments[arguments.length - 1];
        if (typeof cb !== "function")
          return fn.apply(this, arguments);
        else
          fn.apply(this, arguments).then((r) => cb(null, r), cb);
      }, "name", { value: fn.name });
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/graceful-fs@4.2.11/node_modules/graceful-fs/polyfills.js
var require_polyfills = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/graceful-fs@4.2.11/node_modules/graceful-fs/polyfills.js"(exports, module2) {
    var constants = require("constants");
    var origCwd = process.cwd;
    var cwd = null;
    var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
    process.cwd = function() {
      if (!cwd)
        cwd = origCwd.call(process);
      return cwd;
    };
    try {
      process.cwd();
    } catch (er) {
    }
    if (typeof process.chdir === "function") {
      chdir = process.chdir;
      process.chdir = function(d) {
        cwd = null;
        chdir.call(process, d);
      };
      if (Object.setPrototypeOf)
        Object.setPrototypeOf(process.chdir, chdir);
    }
    var chdir;
    module2.exports = patch;
    function patch(fs) {
      if (constants.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
        patchLchmod(fs);
      }
      if (!fs.lutimes) {
        patchLutimes(fs);
      }
      fs.chown = chownFix(fs.chown);
      fs.fchown = chownFix(fs.fchown);
      fs.lchown = chownFix(fs.lchown);
      fs.chmod = chmodFix(fs.chmod);
      fs.fchmod = chmodFix(fs.fchmod);
      fs.lchmod = chmodFix(fs.lchmod);
      fs.chownSync = chownFixSync(fs.chownSync);
      fs.fchownSync = chownFixSync(fs.fchownSync);
      fs.lchownSync = chownFixSync(fs.lchownSync);
      fs.chmodSync = chmodFixSync(fs.chmodSync);
      fs.fchmodSync = chmodFixSync(fs.fchmodSync);
      fs.lchmodSync = chmodFixSync(fs.lchmodSync);
      fs.stat = statFix(fs.stat);
      fs.fstat = statFix(fs.fstat);
      fs.lstat = statFix(fs.lstat);
      fs.statSync = statFixSync(fs.statSync);
      fs.fstatSync = statFixSync(fs.fstatSync);
      fs.lstatSync = statFixSync(fs.lstatSync);
      if (fs.chmod && !fs.lchmod) {
        fs.lchmod = function(path, mode, cb) {
          if (cb)
            process.nextTick(cb);
        };
        fs.lchmodSync = function() {
        };
      }
      if (fs.chown && !fs.lchown) {
        fs.lchown = function(path, uid, gid, cb) {
          if (cb)
            process.nextTick(cb);
        };
        fs.lchownSync = function() {
        };
      }
      if (platform === "win32") {
        fs.rename = typeof fs.rename !== "function" ? fs.rename : function(fs$rename) {
          function rename(from, to, cb) {
            var start = Date.now();
            var backoff = 0;
            fs$rename(from, to, function CB(er) {
              if (er && (er.code === "EACCES" || er.code === "EPERM" || er.code === "EBUSY") && Date.now() - start < 6e4) {
                setTimeout(function() {
                  fs.stat(to, function(stater, st) {
                    if (stater && stater.code === "ENOENT")
                      fs$rename(from, to, CB);
                    else
                      cb(er);
                  });
                }, backoff);
                if (backoff < 100)
                  backoff += 10;
                return;
              }
              if (cb)
                cb(er);
            });
          }
          if (Object.setPrototypeOf)
            Object.setPrototypeOf(rename, fs$rename);
          return rename;
        }(fs.rename);
      }
      fs.read = typeof fs.read !== "function" ? fs.read : function(fs$read) {
        function read(fd, buffer, offset, length, position, callback_) {
          var callback;
          if (callback_ && typeof callback_ === "function") {
            var eagCounter = 0;
            callback = function(er, _, __) {
              if (er && er.code === "EAGAIN" && eagCounter < 10) {
                eagCounter++;
                return fs$read.call(fs, fd, buffer, offset, length, position, callback);
              }
              callback_.apply(this, arguments);
            };
          }
          return fs$read.call(fs, fd, buffer, offset, length, position, callback);
        }
        if (Object.setPrototypeOf)
          Object.setPrototypeOf(read, fs$read);
        return read;
      }(fs.read);
      fs.readSync = typeof fs.readSync !== "function" ? fs.readSync : function(fs$readSync) {
        return function(fd, buffer, offset, length, position) {
          var eagCounter = 0;
          while (true) {
            try {
              return fs$readSync.call(fs, fd, buffer, offset, length, position);
            } catch (er) {
              if (er.code === "EAGAIN" && eagCounter < 10) {
                eagCounter++;
                continue;
              }
              throw er;
            }
          }
        };
      }(fs.readSync);
      function patchLchmod(fs2) {
        fs2.lchmod = function(path, mode, callback) {
          fs2.open(
            path,
            constants.O_WRONLY | constants.O_SYMLINK,
            mode,
            function(err, fd) {
              if (err) {
                if (callback)
                  callback(err);
                return;
              }
              fs2.fchmod(fd, mode, function(err2) {
                fs2.close(fd, function(err22) {
                  if (callback)
                    callback(err2 || err22);
                });
              });
            }
          );
        };
        fs2.lchmodSync = function(path, mode) {
          var fd = fs2.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode);
          var threw = true;
          var ret;
          try {
            ret = fs2.fchmodSync(fd, mode);
            threw = false;
          } finally {
            if (threw) {
              try {
                fs2.closeSync(fd);
              } catch (er) {
              }
            } else {
              fs2.closeSync(fd);
            }
          }
          return ret;
        };
      }
      function patchLutimes(fs2) {
        if (constants.hasOwnProperty("O_SYMLINK") && fs2.futimes) {
          fs2.lutimes = function(path, at, mt, cb) {
            fs2.open(path, constants.O_SYMLINK, function(er, fd) {
              if (er) {
                if (cb)
                  cb(er);
                return;
              }
              fs2.futimes(fd, at, mt, function(er2) {
                fs2.close(fd, function(er22) {
                  if (cb)
                    cb(er2 || er22);
                });
              });
            });
          };
          fs2.lutimesSync = function(path, at, mt) {
            var fd = fs2.openSync(path, constants.O_SYMLINK);
            var ret;
            var threw = true;
            try {
              ret = fs2.futimesSync(fd, at, mt);
              threw = false;
            } finally {
              if (threw) {
                try {
                  fs2.closeSync(fd);
                } catch (er) {
                }
              } else {
                fs2.closeSync(fd);
              }
            }
            return ret;
          };
        } else if (fs2.futimes) {
          fs2.lutimes = function(_a, _b, _c, cb) {
            if (cb)
              process.nextTick(cb);
          };
          fs2.lutimesSync = function() {
          };
        }
      }
      function chmodFix(orig) {
        if (!orig)
          return orig;
        return function(target, mode, cb) {
          return orig.call(fs, target, mode, function(er) {
            if (chownErOk(er))
              er = null;
            if (cb)
              cb.apply(this, arguments);
          });
        };
      }
      function chmodFixSync(orig) {
        if (!orig)
          return orig;
        return function(target, mode) {
          try {
            return orig.call(fs, target, mode);
          } catch (er) {
            if (!chownErOk(er))
              throw er;
          }
        };
      }
      function chownFix(orig) {
        if (!orig)
          return orig;
        return function(target, uid, gid, cb) {
          return orig.call(fs, target, uid, gid, function(er) {
            if (chownErOk(er))
              er = null;
            if (cb)
              cb.apply(this, arguments);
          });
        };
      }
      function chownFixSync(orig) {
        if (!orig)
          return orig;
        return function(target, uid, gid) {
          try {
            return orig.call(fs, target, uid, gid);
          } catch (er) {
            if (!chownErOk(er))
              throw er;
          }
        };
      }
      function statFix(orig) {
        if (!orig)
          return orig;
        return function(target, options, cb) {
          if (typeof options === "function") {
            cb = options;
            options = null;
          }
          function callback(er, stats) {
            if (stats) {
              if (stats.uid < 0)
                stats.uid += 4294967296;
              if (stats.gid < 0)
                stats.gid += 4294967296;
            }
            if (cb)
              cb.apply(this, arguments);
          }
          return options ? orig.call(fs, target, options, callback) : orig.call(fs, target, callback);
        };
      }
      function statFixSync(orig) {
        if (!orig)
          return orig;
        return function(target, options) {
          var stats = options ? orig.call(fs, target, options) : orig.call(fs, target);
          if (stats) {
            if (stats.uid < 0)
              stats.uid += 4294967296;
            if (stats.gid < 0)
              stats.gid += 4294967296;
          }
          return stats;
        };
      }
      function chownErOk(er) {
        if (!er)
          return true;
        if (er.code === "ENOSYS")
          return true;
        var nonroot = !process.getuid || process.getuid() !== 0;
        if (nonroot) {
          if (er.code === "EINVAL" || er.code === "EPERM")
            return true;
        }
        return false;
      }
    }
  }
});

// ../../../common/temp/default/node_modules/.pnpm/graceful-fs@4.2.11/node_modules/graceful-fs/legacy-streams.js
var require_legacy_streams = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/graceful-fs@4.2.11/node_modules/graceful-fs/legacy-streams.js"(exports, module2) {
    var Stream = require("stream").Stream;
    module2.exports = legacy;
    function legacy(fs) {
      return {
        ReadStream,
        WriteStream
      };
      function ReadStream(path, options) {
        if (!(this instanceof ReadStream))
          return new ReadStream(path, options);
        Stream.call(this);
        var self2 = this;
        this.path = path;
        this.fd = null;
        this.readable = true;
        this.paused = false;
        this.flags = "r";
        this.mode = 438;
        this.bufferSize = 64 * 1024;
        options = options || {};
        var keys = Object.keys(options);
        for (var index = 0, length = keys.length; index < length; index++) {
          var key = keys[index];
          this[key] = options[key];
        }
        if (this.encoding)
          this.setEncoding(this.encoding);
        if (this.start !== void 0) {
          if ("number" !== typeof this.start) {
            throw TypeError("start must be a Number");
          }
          if (this.end === void 0) {
            this.end = Infinity;
          } else if ("number" !== typeof this.end) {
            throw TypeError("end must be a Number");
          }
          if (this.start > this.end) {
            throw new Error("start must be <= end");
          }
          this.pos = this.start;
        }
        if (this.fd !== null) {
          process.nextTick(function() {
            self2._read();
          });
          return;
        }
        fs.open(this.path, this.flags, this.mode, function(err, fd) {
          if (err) {
            self2.emit("error", err);
            self2.readable = false;
            return;
          }
          self2.fd = fd;
          self2.emit("open", fd);
          self2._read();
        });
      }
      function WriteStream(path, options) {
        if (!(this instanceof WriteStream))
          return new WriteStream(path, options);
        Stream.call(this);
        this.path = path;
        this.fd = null;
        this.writable = true;
        this.flags = "w";
        this.encoding = "binary";
        this.mode = 438;
        this.bytesWritten = 0;
        options = options || {};
        var keys = Object.keys(options);
        for (var index = 0, length = keys.length; index < length; index++) {
          var key = keys[index];
          this[key] = options[key];
        }
        if (this.start !== void 0) {
          if ("number" !== typeof this.start) {
            throw TypeError("start must be a Number");
          }
          if (this.start < 0) {
            throw new Error("start must be >= zero");
          }
          this.pos = this.start;
        }
        this.busy = false;
        this._queue = [];
        if (this.fd === null) {
          this._open = fs.open;
          this._queue.push([this._open, this.path, this.flags, this.mode, void 0]);
          this.flush();
        }
      }
    }
  }
});

// ../../../common/temp/default/node_modules/.pnpm/graceful-fs@4.2.11/node_modules/graceful-fs/clone.js
var require_clone = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/graceful-fs@4.2.11/node_modules/graceful-fs/clone.js"(exports, module2) {
    "use strict";
    module2.exports = clone;
    var getPrototypeOf = Object.getPrototypeOf || function(obj) {
      return obj.__proto__;
    };
    function clone(obj) {
      if (obj === null || typeof obj !== "object")
        return obj;
      if (obj instanceof Object)
        var copy = { __proto__: getPrototypeOf(obj) };
      else
        var copy = /* @__PURE__ */ Object.create(null);
      Object.getOwnPropertyNames(obj).forEach(function(key) {
        Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
      });
      return copy;
    }
  }
});

// ../../../common/temp/default/node_modules/.pnpm/graceful-fs@4.2.11/node_modules/graceful-fs/graceful-fs.js
var require_graceful_fs = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/graceful-fs@4.2.11/node_modules/graceful-fs/graceful-fs.js"(exports, module2) {
    var fs = require("fs");
    var polyfills = require_polyfills();
    var legacy = require_legacy_streams();
    var clone = require_clone();
    var util = require("util");
    var gracefulQueue;
    var previousSymbol;
    if (typeof Symbol === "function" && typeof Symbol.for === "function") {
      gracefulQueue = Symbol.for("graceful-fs.queue");
      previousSymbol = Symbol.for("graceful-fs.previous");
    } else {
      gracefulQueue = "___graceful-fs.queue";
      previousSymbol = "___graceful-fs.previous";
    }
    function noop() {
    }
    function publishQueue(context, queue2) {
      Object.defineProperty(context, gracefulQueue, {
        get: function() {
          return queue2;
        }
      });
    }
    var debug = noop;
    if (util.debuglog)
      debug = util.debuglog("gfs4");
    else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ""))
      debug = function() {
        var m = util.format.apply(util, arguments);
        m = "GFS4: " + m.split(/\n/).join("\nGFS4: ");
        console.error(m);
      };
    if (!fs[gracefulQueue]) {
      queue = global[gracefulQueue] || [];
      publishQueue(fs, queue);
      fs.close = function(fs$close) {
        function close(fd, cb) {
          return fs$close.call(fs, fd, function(err) {
            if (!err) {
              resetQueue();
            }
            if (typeof cb === "function")
              cb.apply(this, arguments);
          });
        }
        Object.defineProperty(close, previousSymbol, {
          value: fs$close
        });
        return close;
      }(fs.close);
      fs.closeSync = function(fs$closeSync) {
        function closeSync(fd) {
          fs$closeSync.apply(fs, arguments);
          resetQueue();
        }
        Object.defineProperty(closeSync, previousSymbol, {
          value: fs$closeSync
        });
        return closeSync;
      }(fs.closeSync);
      if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || "")) {
        process.on("exit", function() {
          debug(fs[gracefulQueue]);
          require("assert").equal(fs[gracefulQueue].length, 0);
        });
      }
    }
    var queue;
    if (!global[gracefulQueue]) {
      publishQueue(global, fs[gracefulQueue]);
    }
    module2.exports = patch(clone(fs));
    if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs.__patched) {
      module2.exports = patch(fs);
      fs.__patched = true;
    }
    function patch(fs2) {
      polyfills(fs2);
      fs2.gracefulify = patch;
      fs2.createReadStream = createReadStream;
      fs2.createWriteStream = createWriteStream;
      var fs$readFile = fs2.readFile;
      fs2.readFile = readFile;
      function readFile(path, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        return go$readFile(path, options, cb);
        function go$readFile(path2, options2, cb2, startTime) {
          return fs$readFile(path2, options2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$readFile, [path2, options2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$writeFile = fs2.writeFile;
      fs2.writeFile = writeFile;
      function writeFile(path, data, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        return go$writeFile(path, data, options, cb);
        function go$writeFile(path2, data2, options2, cb2, startTime) {
          return fs$writeFile(path2, data2, options2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$writeFile, [path2, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$appendFile = fs2.appendFile;
      if (fs$appendFile)
        fs2.appendFile = appendFile;
      function appendFile(path, data, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        return go$appendFile(path, data, options, cb);
        function go$appendFile(path2, data2, options2, cb2, startTime) {
          return fs$appendFile(path2, data2, options2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$appendFile, [path2, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$copyFile = fs2.copyFile;
      if (fs$copyFile)
        fs2.copyFile = copyFile;
      function copyFile(src, dest, flags, cb) {
        if (typeof flags === "function") {
          cb = flags;
          flags = 0;
        }
        return go$copyFile(src, dest, flags, cb);
        function go$copyFile(src2, dest2, flags2, cb2, startTime) {
          return fs$copyFile(src2, dest2, flags2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$copyFile, [src2, dest2, flags2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$readdir = fs2.readdir;
      fs2.readdir = readdir;
      var noReaddirOptionVersions = /^v[0-5]\./;
      function readdir(path, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        var go$readdir = noReaddirOptionVersions.test(process.version) ? function go$readdir2(path2, options2, cb2, startTime) {
          return fs$readdir(path2, fs$readdirCallback(
            path2,
            options2,
            cb2,
            startTime
          ));
        } : function go$readdir2(path2, options2, cb2, startTime) {
          return fs$readdir(path2, options2, fs$readdirCallback(
            path2,
            options2,
            cb2,
            startTime
          ));
        };
        return go$readdir(path, options, cb);
        function fs$readdirCallback(path2, options2, cb2, startTime) {
          return function(err, files) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([
                go$readdir,
                [path2, options2, cb2],
                err,
                startTime || Date.now(),
                Date.now()
              ]);
            else {
              if (files && files.sort)
                files.sort();
              if (typeof cb2 === "function")
                cb2.call(this, err, files);
            }
          };
        }
      }
      if (process.version.substr(0, 4) === "v0.8") {
        var legStreams = legacy(fs2);
        ReadStream = legStreams.ReadStream;
        WriteStream = legStreams.WriteStream;
      }
      var fs$ReadStream = fs2.ReadStream;
      if (fs$ReadStream) {
        ReadStream.prototype = Object.create(fs$ReadStream.prototype);
        ReadStream.prototype.open = ReadStream$open;
      }
      var fs$WriteStream = fs2.WriteStream;
      if (fs$WriteStream) {
        WriteStream.prototype = Object.create(fs$WriteStream.prototype);
        WriteStream.prototype.open = WriteStream$open;
      }
      Object.defineProperty(fs2, "ReadStream", {
        get: function() {
          return ReadStream;
        },
        set: function(val) {
          ReadStream = val;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(fs2, "WriteStream", {
        get: function() {
          return WriteStream;
        },
        set: function(val) {
          WriteStream = val;
        },
        enumerable: true,
        configurable: true
      });
      var FileReadStream = ReadStream;
      Object.defineProperty(fs2, "FileReadStream", {
        get: function() {
          return FileReadStream;
        },
        set: function(val) {
          FileReadStream = val;
        },
        enumerable: true,
        configurable: true
      });
      var FileWriteStream = WriteStream;
      Object.defineProperty(fs2, "FileWriteStream", {
        get: function() {
          return FileWriteStream;
        },
        set: function(val) {
          FileWriteStream = val;
        },
        enumerable: true,
        configurable: true
      });
      function ReadStream(path, options) {
        if (this instanceof ReadStream)
          return fs$ReadStream.apply(this, arguments), this;
        else
          return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
      }
      function ReadStream$open() {
        var that = this;
        open(that.path, that.flags, that.mode, function(err, fd) {
          if (err) {
            if (that.autoClose)
              that.destroy();
            that.emit("error", err);
          } else {
            that.fd = fd;
            that.emit("open", fd);
            that.read();
          }
        });
      }
      function WriteStream(path, options) {
        if (this instanceof WriteStream)
          return fs$WriteStream.apply(this, arguments), this;
        else
          return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
      }
      function WriteStream$open() {
        var that = this;
        open(that.path, that.flags, that.mode, function(err, fd) {
          if (err) {
            that.destroy();
            that.emit("error", err);
          } else {
            that.fd = fd;
            that.emit("open", fd);
          }
        });
      }
      function createReadStream(path, options) {
        return new fs2.ReadStream(path, options);
      }
      function createWriteStream(path, options) {
        return new fs2.WriteStream(path, options);
      }
      var fs$open = fs2.open;
      fs2.open = open;
      function open(path, flags, mode, cb) {
        if (typeof mode === "function")
          cb = mode, mode = null;
        return go$open(path, flags, mode, cb);
        function go$open(path2, flags2, mode2, cb2, startTime) {
          return fs$open(path2, flags2, mode2, function(err, fd) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$open, [path2, flags2, mode2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      return fs2;
    }
    function enqueue(elem) {
      debug("ENQUEUE", elem[0].name, elem[1]);
      fs[gracefulQueue].push(elem);
      retry();
    }
    var retryTimer;
    function resetQueue() {
      var now = Date.now();
      for (var i = 0; i < fs[gracefulQueue].length; ++i) {
        if (fs[gracefulQueue][i].length > 2) {
          fs[gracefulQueue][i][3] = now;
          fs[gracefulQueue][i][4] = now;
        }
      }
      retry();
    }
    function retry() {
      clearTimeout(retryTimer);
      retryTimer = void 0;
      if (fs[gracefulQueue].length === 0)
        return;
      var elem = fs[gracefulQueue].shift();
      var fn = elem[0];
      var args = elem[1];
      var err = elem[2];
      var startTime = elem[3];
      var lastTime = elem[4];
      if (startTime === void 0) {
        debug("RETRY", fn.name, args);
        fn.apply(null, args);
      } else if (Date.now() - startTime >= 6e4) {
        debug("TIMEOUT", fn.name, args);
        var cb = args.pop();
        if (typeof cb === "function")
          cb.call(null, err);
      } else {
        var sinceAttempt = Date.now() - lastTime;
        var sinceStart = Math.max(lastTime - startTime, 1);
        var desiredDelay = Math.min(sinceStart * 1.2, 100);
        if (sinceAttempt >= desiredDelay) {
          debug("RETRY", fn.name, args);
          fn.apply(null, args.concat([startTime]));
        } else {
          fs[gracefulQueue].push(elem);
        }
      }
      if (retryTimer === void 0) {
        retryTimer = setTimeout(retry, 0);
      }
    }
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/fs/index.js
var require_fs = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/fs/index.js"(exports) {
    "use strict";
    var u = require_universalify().fromCallback;
    var fs = require_graceful_fs();
    var api = [
      "access",
      "appendFile",
      "chmod",
      "chown",
      "close",
      "copyFile",
      "fchmod",
      "fchown",
      "fdatasync",
      "fstat",
      "fsync",
      "ftruncate",
      "futimes",
      "lchown",
      "lchmod",
      "link",
      "lstat",
      "mkdir",
      "mkdtemp",
      "open",
      "readFile",
      "readdir",
      "readlink",
      "realpath",
      "rename",
      "rmdir",
      "stat",
      "symlink",
      "truncate",
      "unlink",
      "utimes",
      "writeFile"
    ].filter((key) => {
      return typeof fs[key] === "function";
    });
    Object.keys(fs).forEach((key) => {
      if (key === "promises") {
        return;
      }
      exports[key] = fs[key];
    });
    api.forEach((method) => {
      exports[method] = u(fs[method]);
    });
    exports.exists = function(filename, callback) {
      if (typeof callback === "function") {
        return fs.exists(filename, callback);
      }
      return new Promise((resolve) => {
        return fs.exists(filename, resolve);
      });
    };
    exports.read = function(fd, buffer, offset, length, position, callback) {
      if (typeof callback === "function") {
        return fs.read(fd, buffer, offset, length, position, callback);
      }
      return new Promise((resolve, reject) => {
        fs.read(fd, buffer, offset, length, position, (err, bytesRead, buffer2) => {
          if (err)
            return reject(err);
          resolve({ bytesRead, buffer: buffer2 });
        });
      });
    };
    exports.write = function(fd, buffer, ...args) {
      if (typeof args[args.length - 1] === "function") {
        return fs.write(fd, buffer, ...args);
      }
      return new Promise((resolve, reject) => {
        fs.write(fd, buffer, ...args, (err, bytesWritten, buffer2) => {
          if (err)
            return reject(err);
          resolve({ bytesWritten, buffer: buffer2 });
        });
      });
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/mkdirs/win32.js
var require_win32 = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/mkdirs/win32.js"(exports, module2) {
    "use strict";
    var path = require("path");
    function getRootPath(p) {
      p = path.normalize(path.resolve(p)).split(path.sep);
      if (p.length > 0)
        return p[0];
      return null;
    }
    var INVALID_PATH_CHARS = /[<>:"|?*]/;
    function invalidWin32Path(p) {
      const rp = getRootPath(p);
      p = p.replace(rp, "");
      return INVALID_PATH_CHARS.test(p);
    }
    module2.exports = {
      getRootPath,
      invalidWin32Path
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/mkdirs/mkdirs.js
var require_mkdirs = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/mkdirs/mkdirs.js"(exports, module2) {
    "use strict";
    var fs = require_graceful_fs();
    var path = require("path");
    var invalidWin32Path = require_win32().invalidWin32Path;
    var o777 = parseInt("0777", 8);
    function mkdirs(p, opts, callback, made) {
      if (typeof opts === "function") {
        callback = opts;
        opts = {};
      } else if (!opts || typeof opts !== "object") {
        opts = { mode: opts };
      }
      if (process.platform === "win32" && invalidWin32Path(p)) {
        const errInval = new Error(p + " contains invalid WIN32 path characters.");
        errInval.code = "EINVAL";
        return callback(errInval);
      }
      let mode = opts.mode;
      const xfs = opts.fs || fs;
      if (mode === void 0) {
        mode = o777 & ~process.umask();
      }
      if (!made)
        made = null;
      callback = callback || function() {
      };
      p = path.resolve(p);
      xfs.mkdir(p, mode, (er) => {
        if (!er) {
          made = made || p;
          return callback(null, made);
        }
        switch (er.code) {
          case "ENOENT":
            if (path.dirname(p) === p)
              return callback(er);
            mkdirs(path.dirname(p), opts, (er2, made2) => {
              if (er2)
                callback(er2, made2);
              else
                mkdirs(p, opts, callback, made2);
            });
            break;
          default:
            xfs.stat(p, (er2, stat) => {
              if (er2 || !stat.isDirectory())
                callback(er, made);
              else
                callback(null, made);
            });
            break;
        }
      });
    }
    module2.exports = mkdirs;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/mkdirs/mkdirs-sync.js
var require_mkdirs_sync = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/mkdirs/mkdirs-sync.js"(exports, module2) {
    "use strict";
    var fs = require_graceful_fs();
    var path = require("path");
    var invalidWin32Path = require_win32().invalidWin32Path;
    var o777 = parseInt("0777", 8);
    function mkdirsSync(p, opts, made) {
      if (!opts || typeof opts !== "object") {
        opts = { mode: opts };
      }
      let mode = opts.mode;
      const xfs = opts.fs || fs;
      if (process.platform === "win32" && invalidWin32Path(p)) {
        const errInval = new Error(p + " contains invalid WIN32 path characters.");
        errInval.code = "EINVAL";
        throw errInval;
      }
      if (mode === void 0) {
        mode = o777 & ~process.umask();
      }
      if (!made)
        made = null;
      p = path.resolve(p);
      try {
        xfs.mkdirSync(p, mode);
        made = made || p;
      } catch (err0) {
        if (err0.code === "ENOENT") {
          if (path.dirname(p) === p)
            throw err0;
          made = mkdirsSync(path.dirname(p), opts, made);
          mkdirsSync(p, opts, made);
        } else {
          let stat;
          try {
            stat = xfs.statSync(p);
          } catch (err1) {
            throw err0;
          }
          if (!stat.isDirectory())
            throw err0;
        }
      }
      return made;
    }
    module2.exports = mkdirsSync;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/mkdirs/index.js
var require_mkdirs2 = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/mkdirs/index.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromCallback;
    var mkdirs = u(require_mkdirs());
    var mkdirsSync = require_mkdirs_sync();
    module2.exports = {
      mkdirs,
      mkdirsSync,
      mkdirp: mkdirs,
      mkdirpSync: mkdirsSync,
      ensureDir: mkdirs,
      ensureDirSync: mkdirsSync
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/util/utimes.js
var require_utimes = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/util/utimes.js"(exports, module2) {
    "use strict";
    var fs = require_graceful_fs();
    var os = require("os");
    var path = require("path");
    function hasMillisResSync() {
      let tmpfile = path.join("millis-test-sync" + Date.now().toString() + Math.random().toString().slice(2));
      tmpfile = path.join(os.tmpdir(), tmpfile);
      const d = new Date(1435410243862);
      fs.writeFileSync(tmpfile, "https://github.com/jprichardson/node-fs-extra/pull/141");
      const fd = fs.openSync(tmpfile, "r+");
      fs.futimesSync(fd, d, d);
      fs.closeSync(fd);
      return fs.statSync(tmpfile).mtime > 1435410243e3;
    }
    function hasMillisRes(callback) {
      let tmpfile = path.join("millis-test" + Date.now().toString() + Math.random().toString().slice(2));
      tmpfile = path.join(os.tmpdir(), tmpfile);
      const d = new Date(1435410243862);
      fs.writeFile(tmpfile, "https://github.com/jprichardson/node-fs-extra/pull/141", (err) => {
        if (err)
          return callback(err);
        fs.open(tmpfile, "r+", (err2, fd) => {
          if (err2)
            return callback(err2);
          fs.futimes(fd, d, d, (err3) => {
            if (err3)
              return callback(err3);
            fs.close(fd, (err4) => {
              if (err4)
                return callback(err4);
              fs.stat(tmpfile, (err5, stats) => {
                if (err5)
                  return callback(err5);
                callback(null, stats.mtime > 1435410243e3);
              });
            });
          });
        });
      });
    }
    function timeRemoveMillis(timestamp) {
      if (typeof timestamp === "number") {
        return Math.floor(timestamp / 1e3) * 1e3;
      } else if (timestamp instanceof Date) {
        return new Date(Math.floor(timestamp.getTime() / 1e3) * 1e3);
      } else {
        throw new Error("fs-extra: timeRemoveMillis() unknown parameter type");
      }
    }
    function utimesMillis(path2, atime, mtime, callback) {
      fs.open(path2, "r+", (err, fd) => {
        if (err)
          return callback(err);
        fs.futimes(fd, atime, mtime, (futimesErr) => {
          fs.close(fd, (closeErr) => {
            if (callback)
              callback(futimesErr || closeErr);
          });
        });
      });
    }
    function utimesMillisSync(path2, atime, mtime) {
      const fd = fs.openSync(path2, "r+");
      fs.futimesSync(fd, atime, mtime);
      return fs.closeSync(fd);
    }
    module2.exports = {
      hasMillisRes,
      hasMillisResSync,
      timeRemoveMillis,
      utimesMillis,
      utimesMillisSync
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/util/buffer.js
var require_buffer = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/util/buffer.js"(exports, module2) {
    "use strict";
    module2.exports = function(size) {
      if (typeof Buffer.allocUnsafe === "function") {
        try {
          return Buffer.allocUnsafe(size);
        } catch (e) {
          return new Buffer(size);
        }
      }
      return new Buffer(size);
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/copy-sync/copy-sync.js
var require_copy_sync = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/copy-sync/copy-sync.js"(exports, module2) {
    "use strict";
    var fs = require_graceful_fs();
    var path = require("path");
    var mkdirpSync = require_mkdirs2().mkdirsSync;
    var utimesSync = require_utimes().utimesMillisSync;
    var notExist = Symbol("notExist");
    function copySync(src, dest, opts) {
      if (typeof opts === "function") {
        opts = { filter: opts };
      }
      opts = opts || {};
      opts.clobber = "clobber" in opts ? !!opts.clobber : true;
      opts.overwrite = "overwrite" in opts ? !!opts.overwrite : opts.clobber;
      if (opts.preserveTimestamps && process.arch === "ia32") {
        console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;

    see https://github.com/jprichardson/node-fs-extra/issues/269`);
      }
      const destStat = checkPaths(src, dest);
      if (opts.filter && !opts.filter(src, dest))
        return;
      const destParent = path.dirname(dest);
      if (!fs.existsSync(destParent))
        mkdirpSync(destParent);
      return startCopy(destStat, src, dest, opts);
    }
    function startCopy(destStat, src, dest, opts) {
      if (opts.filter && !opts.filter(src, dest))
        return;
      return getStats(destStat, src, dest, opts);
    }
    function getStats(destStat, src, dest, opts) {
      const statSync = opts.dereference ? fs.statSync : fs.lstatSync;
      const srcStat = statSync(src);
      if (srcStat.isDirectory())
        return onDir(srcStat, destStat, src, dest, opts);
      else if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice())
        return onFile(srcStat, destStat, src, dest, opts);
      else if (srcStat.isSymbolicLink())
        return onLink(destStat, src, dest, opts);
    }
    function onFile(srcStat, destStat, src, dest, opts) {
      if (destStat === notExist)
        return copyFile(srcStat, src, dest, opts);
      return mayCopyFile(srcStat, src, dest, opts);
    }
    function mayCopyFile(srcStat, src, dest, opts) {
      if (opts.overwrite) {
        fs.unlinkSync(dest);
        return copyFile(srcStat, src, dest, opts);
      } else if (opts.errorOnExist) {
        throw new Error(`'${dest}' already exists`);
      }
    }
    function copyFile(srcStat, src, dest, opts) {
      if (typeof fs.copyFileSync === "function") {
        fs.copyFileSync(src, dest);
        fs.chmodSync(dest, srcStat.mode);
        if (opts.preserveTimestamps) {
          return utimesSync(dest, srcStat.atime, srcStat.mtime);
        }
        return;
      }
      return copyFileFallback(srcStat, src, dest, opts);
    }
    function copyFileFallback(srcStat, src, dest, opts) {
      const BUF_LENGTH = 64 * 1024;
      const _buff = require_buffer()(BUF_LENGTH);
      const fdr = fs.openSync(src, "r");
      const fdw = fs.openSync(dest, "w", srcStat.mode);
      let pos = 0;
      while (pos < srcStat.size) {
        const bytesRead = fs.readSync(fdr, _buff, 0, BUF_LENGTH, pos);
        fs.writeSync(fdw, _buff, 0, bytesRead);
        pos += bytesRead;
      }
      if (opts.preserveTimestamps)
        fs.futimesSync(fdw, srcStat.atime, srcStat.mtime);
      fs.closeSync(fdr);
      fs.closeSync(fdw);
    }
    function onDir(srcStat, destStat, src, dest, opts) {
      if (destStat === notExist)
        return mkDirAndCopy(srcStat, src, dest, opts);
      if (destStat && !destStat.isDirectory()) {
        throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
      }
      return copyDir(src, dest, opts);
    }
    function mkDirAndCopy(srcStat, src, dest, opts) {
      fs.mkdirSync(dest);
      copyDir(src, dest, opts);
      return fs.chmodSync(dest, srcStat.mode);
    }
    function copyDir(src, dest, opts) {
      fs.readdirSync(src).forEach((item) => copyDirItem(item, src, dest, opts));
    }
    function copyDirItem(item, src, dest, opts) {
      const srcItem = path.join(src, item);
      const destItem = path.join(dest, item);
      const destStat = checkPaths(srcItem, destItem);
      return startCopy(destStat, srcItem, destItem, opts);
    }
    function onLink(destStat, src, dest, opts) {
      let resolvedSrc = fs.readlinkSync(src);
      if (opts.dereference) {
        resolvedSrc = path.resolve(process.cwd(), resolvedSrc);
      }
      if (destStat === notExist) {
        return fs.symlinkSync(resolvedSrc, dest);
      } else {
        let resolvedDest;
        try {
          resolvedDest = fs.readlinkSync(dest);
        } catch (err) {
          if (err.code === "EINVAL" || err.code === "UNKNOWN")
            return fs.symlinkSync(resolvedSrc, dest);
          throw err;
        }
        if (opts.dereference) {
          resolvedDest = path.resolve(process.cwd(), resolvedDest);
        }
        if (isSrcSubdir(resolvedSrc, resolvedDest)) {
          throw new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`);
        }
        if (fs.statSync(dest).isDirectory() && isSrcSubdir(resolvedDest, resolvedSrc)) {
          throw new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`);
        }
        return copyLink(resolvedSrc, dest);
      }
    }
    function copyLink(resolvedSrc, dest) {
      fs.unlinkSync(dest);
      return fs.symlinkSync(resolvedSrc, dest);
    }
    function isSrcSubdir(src, dest) {
      const srcArray = path.resolve(src).split(path.sep);
      const destArray = path.resolve(dest).split(path.sep);
      return srcArray.reduce((acc, current, i) => acc && destArray[i] === current, true);
    }
    function checkStats(src, dest) {
      const srcStat = fs.statSync(src);
      let destStat;
      try {
        destStat = fs.statSync(dest);
      } catch (err) {
        if (err.code === "ENOENT")
          return { srcStat, destStat: notExist };
        throw err;
      }
      return { srcStat, destStat };
    }
    function checkPaths(src, dest) {
      const { srcStat, destStat } = checkStats(src, dest);
      if (destStat.ino && destStat.ino === srcStat.ino) {
        throw new Error("Source and destination must not be the same.");
      }
      if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
        throw new Error(`Cannot copy '${src}' to a subdirectory of itself, '${dest}'.`);
      }
      return destStat;
    }
    module2.exports = copySync;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/copy-sync/index.js
var require_copy_sync2 = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/copy-sync/index.js"(exports, module2) {
    "use strict";
    module2.exports = {
      copySync: require_copy_sync()
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/path-exists/index.js
var require_path_exists = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/path-exists/index.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromPromise;
    var fs = require_fs();
    function pathExists(path) {
      return fs.access(path).then(() => true).catch(() => false);
    }
    module2.exports = {
      pathExists: u(pathExists),
      pathExistsSync: fs.existsSync
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/copy/copy.js
var require_copy = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/copy/copy.js"(exports, module2) {
    "use strict";
    var fs = require_graceful_fs();
    var path = require("path");
    var mkdirp = require_mkdirs2().mkdirs;
    var pathExists = require_path_exists().pathExists;
    var utimes = require_utimes().utimesMillis;
    var notExist = Symbol("notExist");
    function copy(src, dest, opts, cb) {
      if (typeof opts === "function" && !cb) {
        cb = opts;
        opts = {};
      } else if (typeof opts === "function") {
        opts = { filter: opts };
      }
      cb = cb || function() {
      };
      opts = opts || {};
      opts.clobber = "clobber" in opts ? !!opts.clobber : true;
      opts.overwrite = "overwrite" in opts ? !!opts.overwrite : opts.clobber;
      if (opts.preserveTimestamps && process.arch === "ia32") {
        console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;

    see https://github.com/jprichardson/node-fs-extra/issues/269`);
      }
      checkPaths(src, dest, (err, destStat) => {
        if (err)
          return cb(err);
        if (opts.filter)
          return handleFilter(checkParentDir, destStat, src, dest, opts, cb);
        return checkParentDir(destStat, src, dest, opts, cb);
      });
    }
    function checkParentDir(destStat, src, dest, opts, cb) {
      const destParent = path.dirname(dest);
      pathExists(destParent, (err, dirExists) => {
        if (err)
          return cb(err);
        if (dirExists)
          return startCopy(destStat, src, dest, opts, cb);
        mkdirp(destParent, (err2) => {
          if (err2)
            return cb(err2);
          return startCopy(destStat, src, dest, opts, cb);
        });
      });
    }
    function handleFilter(onInclude, destStat, src, dest, opts, cb) {
      Promise.resolve(opts.filter(src, dest)).then((include) => {
        if (include) {
          if (destStat)
            return onInclude(destStat, src, dest, opts, cb);
          return onInclude(src, dest, opts, cb);
        }
        return cb();
      }, (error) => cb(error));
    }
    function startCopy(destStat, src, dest, opts, cb) {
      if (opts.filter)
        return handleFilter(getStats, destStat, src, dest, opts, cb);
      return getStats(destStat, src, dest, opts, cb);
    }
    function getStats(destStat, src, dest, opts, cb) {
      const stat = opts.dereference ? fs.stat : fs.lstat;
      stat(src, (err, srcStat) => {
        if (err)
          return cb(err);
        if (srcStat.isDirectory())
          return onDir(srcStat, destStat, src, dest, opts, cb);
        else if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice())
          return onFile(srcStat, destStat, src, dest, opts, cb);
        else if (srcStat.isSymbolicLink())
          return onLink(destStat, src, dest, opts, cb);
      });
    }
    function onFile(srcStat, destStat, src, dest, opts, cb) {
      if (destStat === notExist)
        return copyFile(srcStat, src, dest, opts, cb);
      return mayCopyFile(srcStat, src, dest, opts, cb);
    }
    function mayCopyFile(srcStat, src, dest, opts, cb) {
      if (opts.overwrite) {
        fs.unlink(dest, (err) => {
          if (err)
            return cb(err);
          return copyFile(srcStat, src, dest, opts, cb);
        });
      } else if (opts.errorOnExist) {
        return cb(new Error(`'${dest}' already exists`));
      } else
        return cb();
    }
    function copyFile(srcStat, src, dest, opts, cb) {
      if (typeof fs.copyFile === "function") {
        return fs.copyFile(src, dest, (err) => {
          if (err)
            return cb(err);
          return setDestModeAndTimestamps(srcStat, dest, opts, cb);
        });
      }
      return copyFileFallback(srcStat, src, dest, opts, cb);
    }
    function copyFileFallback(srcStat, src, dest, opts, cb) {
      const rs = fs.createReadStream(src);
      rs.on("error", (err) => cb(err)).once("open", () => {
        const ws = fs.createWriteStream(dest, { mode: srcStat.mode });
        ws.on("error", (err) => cb(err)).on("open", () => rs.pipe(ws)).once("close", () => setDestModeAndTimestamps(srcStat, dest, opts, cb));
      });
    }
    function setDestModeAndTimestamps(srcStat, dest, opts, cb) {
      fs.chmod(dest, srcStat.mode, (err) => {
        if (err)
          return cb(err);
        if (opts.preserveTimestamps) {
          return utimes(dest, srcStat.atime, srcStat.mtime, cb);
        }
        return cb();
      });
    }
    function onDir(srcStat, destStat, src, dest, opts, cb) {
      if (destStat === notExist)
        return mkDirAndCopy(srcStat, src, dest, opts, cb);
      if (destStat && !destStat.isDirectory()) {
        return cb(new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`));
      }
      return copyDir(src, dest, opts, cb);
    }
    function mkDirAndCopy(srcStat, src, dest, opts, cb) {
      fs.mkdir(dest, (err) => {
        if (err)
          return cb(err);
        copyDir(src, dest, opts, (err2) => {
          if (err2)
            return cb(err2);
          return fs.chmod(dest, srcStat.mode, cb);
        });
      });
    }
    function copyDir(src, dest, opts, cb) {
      fs.readdir(src, (err, items) => {
        if (err)
          return cb(err);
        return copyDirItems(items, src, dest, opts, cb);
      });
    }
    function copyDirItems(items, src, dest, opts, cb) {
      const item = items.pop();
      if (!item)
        return cb();
      return copyDirItem(items, item, src, dest, opts, cb);
    }
    function copyDirItem(items, item, src, dest, opts, cb) {
      const srcItem = path.join(src, item);
      const destItem = path.join(dest, item);
      checkPaths(srcItem, destItem, (err, destStat) => {
        if (err)
          return cb(err);
        startCopy(destStat, srcItem, destItem, opts, (err2) => {
          if (err2)
            return cb(err2);
          return copyDirItems(items, src, dest, opts, cb);
        });
      });
    }
    function onLink(destStat, src, dest, opts, cb) {
      fs.readlink(src, (err, resolvedSrc) => {
        if (err)
          return cb(err);
        if (opts.dereference) {
          resolvedSrc = path.resolve(process.cwd(), resolvedSrc);
        }
        if (destStat === notExist) {
          return fs.symlink(resolvedSrc, dest, cb);
        } else {
          fs.readlink(dest, (err2, resolvedDest) => {
            if (err2) {
              if (err2.code === "EINVAL" || err2.code === "UNKNOWN")
                return fs.symlink(resolvedSrc, dest, cb);
              return cb(err2);
            }
            if (opts.dereference) {
              resolvedDest = path.resolve(process.cwd(), resolvedDest);
            }
            if (isSrcSubdir(resolvedSrc, resolvedDest)) {
              return cb(new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`));
            }
            if (destStat.isDirectory() && isSrcSubdir(resolvedDest, resolvedSrc)) {
              return cb(new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`));
            }
            return copyLink(resolvedSrc, dest, cb);
          });
        }
      });
    }
    function copyLink(resolvedSrc, dest, cb) {
      fs.unlink(dest, (err) => {
        if (err)
          return cb(err);
        return fs.symlink(resolvedSrc, dest, cb);
      });
    }
    function isSrcSubdir(src, dest) {
      const srcArray = path.resolve(src).split(path.sep);
      const destArray = path.resolve(dest).split(path.sep);
      return srcArray.reduce((acc, current, i) => acc && destArray[i] === current, true);
    }
    function checkStats(src, dest, cb) {
      fs.stat(src, (err, srcStat) => {
        if (err)
          return cb(err);
        fs.stat(dest, (err2, destStat) => {
          if (err2) {
            if (err2.code === "ENOENT")
              return cb(null, { srcStat, destStat: notExist });
            return cb(err2);
          }
          return cb(null, { srcStat, destStat });
        });
      });
    }
    function checkPaths(src, dest, cb) {
      checkStats(src, dest, (err, stats) => {
        if (err)
          return cb(err);
        const { srcStat, destStat } = stats;
        if (destStat.ino && destStat.ino === srcStat.ino) {
          return cb(new Error("Source and destination must not be the same."));
        }
        if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
          return cb(new Error(`Cannot copy '${src}' to a subdirectory of itself, '${dest}'.`));
        }
        return cb(null, destStat);
      });
    }
    module2.exports = copy;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/copy/index.js
var require_copy2 = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/copy/index.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromCallback;
    module2.exports = {
      copy: u(require_copy())
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/remove/rimraf.js
var require_rimraf = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/remove/rimraf.js"(exports, module2) {
    "use strict";
    var fs = require_graceful_fs();
    var path = require("path");
    var assert = require("assert");
    var isWindows = process.platform === "win32";
    function defaults(options) {
      const methods = [
        "unlink",
        "chmod",
        "stat",
        "lstat",
        "rmdir",
        "readdir"
      ];
      methods.forEach((m) => {
        options[m] = options[m] || fs[m];
        m = m + "Sync";
        options[m] = options[m] || fs[m];
      });
      options.maxBusyTries = options.maxBusyTries || 3;
    }
    function rimraf(p, options, cb) {
      let busyTries = 0;
      if (typeof options === "function") {
        cb = options;
        options = {};
      }
      assert(p, "rimraf: missing path");
      assert.strictEqual(typeof p, "string", "rimraf: path should be a string");
      assert.strictEqual(typeof cb, "function", "rimraf: callback function required");
      assert(options, "rimraf: invalid options argument provided");
      assert.strictEqual(typeof options, "object", "rimraf: options should be object");
      defaults(options);
      rimraf_(p, options, function CB(er) {
        if (er) {
          if ((er.code === "EBUSY" || er.code === "ENOTEMPTY" || er.code === "EPERM") && busyTries < options.maxBusyTries) {
            busyTries++;
            const time = busyTries * 100;
            return setTimeout(() => rimraf_(p, options, CB), time);
          }
          if (er.code === "ENOENT")
            er = null;
        }
        cb(er);
      });
    }
    function rimraf_(p, options, cb) {
      assert(p);
      assert(options);
      assert(typeof cb === "function");
      options.lstat(p, (er, st) => {
        if (er && er.code === "ENOENT") {
          return cb(null);
        }
        if (er && er.code === "EPERM" && isWindows) {
          return fixWinEPERM(p, options, er, cb);
        }
        if (st && st.isDirectory()) {
          return rmdir(p, options, er, cb);
        }
        options.unlink(p, (er2) => {
          if (er2) {
            if (er2.code === "ENOENT") {
              return cb(null);
            }
            if (er2.code === "EPERM") {
              return isWindows ? fixWinEPERM(p, options, er2, cb) : rmdir(p, options, er2, cb);
            }
            if (er2.code === "EISDIR") {
              return rmdir(p, options, er2, cb);
            }
          }
          return cb(er2);
        });
      });
    }
    function fixWinEPERM(p, options, er, cb) {
      assert(p);
      assert(options);
      assert(typeof cb === "function");
      if (er) {
        assert(er instanceof Error);
      }
      options.chmod(p, 438, (er2) => {
        if (er2) {
          cb(er2.code === "ENOENT" ? null : er);
        } else {
          options.stat(p, (er3, stats) => {
            if (er3) {
              cb(er3.code === "ENOENT" ? null : er);
            } else if (stats.isDirectory()) {
              rmdir(p, options, er, cb);
            } else {
              options.unlink(p, cb);
            }
          });
        }
      });
    }
    function fixWinEPERMSync(p, options, er) {
      let stats;
      assert(p);
      assert(options);
      if (er) {
        assert(er instanceof Error);
      }
      try {
        options.chmodSync(p, 438);
      } catch (er2) {
        if (er2.code === "ENOENT") {
          return;
        } else {
          throw er;
        }
      }
      try {
        stats = options.statSync(p);
      } catch (er3) {
        if (er3.code === "ENOENT") {
          return;
        } else {
          throw er;
        }
      }
      if (stats.isDirectory()) {
        rmdirSync(p, options, er);
      } else {
        options.unlinkSync(p);
      }
    }
    function rmdir(p, options, originalEr, cb) {
      assert(p);
      assert(options);
      if (originalEr) {
        assert(originalEr instanceof Error);
      }
      assert(typeof cb === "function");
      options.rmdir(p, (er) => {
        if (er && (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM")) {
          rmkids(p, options, cb);
        } else if (er && er.code === "ENOTDIR") {
          cb(originalEr);
        } else {
          cb(er);
        }
      });
    }
    function rmkids(p, options, cb) {
      assert(p);
      assert(options);
      assert(typeof cb === "function");
      options.readdir(p, (er, files) => {
        if (er)
          return cb(er);
        let n = files.length;
        let errState;
        if (n === 0)
          return options.rmdir(p, cb);
        files.forEach((f) => {
          rimraf(path.join(p, f), options, (er2) => {
            if (errState) {
              return;
            }
            if (er2)
              return cb(errState = er2);
            if (--n === 0) {
              options.rmdir(p, cb);
            }
          });
        });
      });
    }
    function rimrafSync(p, options) {
      let st;
      options = options || {};
      defaults(options);
      assert(p, "rimraf: missing path");
      assert.strictEqual(typeof p, "string", "rimraf: path should be a string");
      assert(options, "rimraf: missing options");
      assert.strictEqual(typeof options, "object", "rimraf: options should be object");
      try {
        st = options.lstatSync(p);
      } catch (er) {
        if (er.code === "ENOENT") {
          return;
        }
        if (er.code === "EPERM" && isWindows) {
          fixWinEPERMSync(p, options, er);
        }
      }
      try {
        if (st && st.isDirectory()) {
          rmdirSync(p, options, null);
        } else {
          options.unlinkSync(p);
        }
      } catch (er) {
        if (er.code === "ENOENT") {
          return;
        } else if (er.code === "EPERM") {
          return isWindows ? fixWinEPERMSync(p, options, er) : rmdirSync(p, options, er);
        } else if (er.code !== "EISDIR") {
          throw er;
        }
        rmdirSync(p, options, er);
      }
    }
    function rmdirSync(p, options, originalEr) {
      assert(p);
      assert(options);
      if (originalEr) {
        assert(originalEr instanceof Error);
      }
      try {
        options.rmdirSync(p);
      } catch (er) {
        if (er.code === "ENOTDIR") {
          throw originalEr;
        } else if (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM") {
          rmkidsSync(p, options);
        } else if (er.code !== "ENOENT") {
          throw er;
        }
      }
    }
    function rmkidsSync(p, options) {
      assert(p);
      assert(options);
      options.readdirSync(p).forEach((f) => rimrafSync(path.join(p, f), options));
      if (isWindows) {
        const startTime = Date.now();
        do {
          try {
            const ret = options.rmdirSync(p, options);
            return ret;
          } catch (er) {
          }
        } while (Date.now() - startTime < 500);
      } else {
        const ret = options.rmdirSync(p, options);
        return ret;
      }
    }
    module2.exports = rimraf;
    rimraf.sync = rimrafSync;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/remove/index.js
var require_remove = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/remove/index.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromCallback;
    var rimraf = require_rimraf();
    module2.exports = {
      remove: u(rimraf),
      removeSync: rimraf.sync
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/empty/index.js
var require_empty = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/empty/index.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromCallback;
    var fs = require("fs");
    var path = require("path");
    var mkdir = require_mkdirs2();
    var remove = require_remove();
    var emptyDir = u(function emptyDir2(dir, callback) {
      callback = callback || function() {
      };
      fs.readdir(dir, (err, items) => {
        if (err)
          return mkdir.mkdirs(dir, callback);
        items = items.map((item) => path.join(dir, item));
        deleteItem();
        function deleteItem() {
          const item = items.pop();
          if (!item)
            return callback();
          remove.remove(item, (err2) => {
            if (err2)
              return callback(err2);
            deleteItem();
          });
        }
      });
    });
    function emptyDirSync(dir) {
      let items;
      try {
        items = fs.readdirSync(dir);
      } catch (err) {
        return mkdir.mkdirsSync(dir);
      }
      items.forEach((item) => {
        item = path.join(dir, item);
        remove.removeSync(item);
      });
    }
    module2.exports = {
      emptyDirSync,
      emptydirSync: emptyDirSync,
      emptyDir,
      emptydir: emptyDir
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/ensure/file.js
var require_file = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/ensure/file.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromCallback;
    var path = require("path");
    var fs = require_graceful_fs();
    var mkdir = require_mkdirs2();
    var pathExists = require_path_exists().pathExists;
    function createFile(file, callback) {
      function makeFile() {
        fs.writeFile(file, "", (err) => {
          if (err)
            return callback(err);
          callback();
        });
      }
      fs.stat(file, (err, stats) => {
        if (!err && stats.isFile())
          return callback();
        const dir = path.dirname(file);
        pathExists(dir, (err2, dirExists) => {
          if (err2)
            return callback(err2);
          if (dirExists)
            return makeFile();
          mkdir.mkdirs(dir, (err3) => {
            if (err3)
              return callback(err3);
            makeFile();
          });
        });
      });
    }
    function createFileSync(file) {
      let stats;
      try {
        stats = fs.statSync(file);
      } catch (e) {
      }
      if (stats && stats.isFile())
        return;
      const dir = path.dirname(file);
      if (!fs.existsSync(dir)) {
        mkdir.mkdirsSync(dir);
      }
      fs.writeFileSync(file, "");
    }
    module2.exports = {
      createFile: u(createFile),
      createFileSync
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/ensure/link.js
var require_link = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/ensure/link.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromCallback;
    var path = require("path");
    var fs = require_graceful_fs();
    var mkdir = require_mkdirs2();
    var pathExists = require_path_exists().pathExists;
    function createLink(srcpath, dstpath, callback) {
      function makeLink(srcpath2, dstpath2) {
        fs.link(srcpath2, dstpath2, (err) => {
          if (err)
            return callback(err);
          callback(null);
        });
      }
      pathExists(dstpath, (err, destinationExists) => {
        if (err)
          return callback(err);
        if (destinationExists)
          return callback(null);
        fs.lstat(srcpath, (err2) => {
          if (err2) {
            err2.message = err2.message.replace("lstat", "ensureLink");
            return callback(err2);
          }
          const dir = path.dirname(dstpath);
          pathExists(dir, (err3, dirExists) => {
            if (err3)
              return callback(err3);
            if (dirExists)
              return makeLink(srcpath, dstpath);
            mkdir.mkdirs(dir, (err4) => {
              if (err4)
                return callback(err4);
              makeLink(srcpath, dstpath);
            });
          });
        });
      });
    }
    function createLinkSync(srcpath, dstpath) {
      const destinationExists = fs.existsSync(dstpath);
      if (destinationExists)
        return void 0;
      try {
        fs.lstatSync(srcpath);
      } catch (err) {
        err.message = err.message.replace("lstat", "ensureLink");
        throw err;
      }
      const dir = path.dirname(dstpath);
      const dirExists = fs.existsSync(dir);
      if (dirExists)
        return fs.linkSync(srcpath, dstpath);
      mkdir.mkdirsSync(dir);
      return fs.linkSync(srcpath, dstpath);
    }
    module2.exports = {
      createLink: u(createLink),
      createLinkSync
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/ensure/symlink-paths.js
var require_symlink_paths = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/ensure/symlink-paths.js"(exports, module2) {
    "use strict";
    var path = require("path");
    var fs = require_graceful_fs();
    var pathExists = require_path_exists().pathExists;
    function symlinkPaths(srcpath, dstpath, callback) {
      if (path.isAbsolute(srcpath)) {
        return fs.lstat(srcpath, (err) => {
          if (err) {
            err.message = err.message.replace("lstat", "ensureSymlink");
            return callback(err);
          }
          return callback(null, {
            "toCwd": srcpath,
            "toDst": srcpath
          });
        });
      } else {
        const dstdir = path.dirname(dstpath);
        const relativeToDst = path.join(dstdir, srcpath);
        return pathExists(relativeToDst, (err, exists) => {
          if (err)
            return callback(err);
          if (exists) {
            return callback(null, {
              "toCwd": relativeToDst,
              "toDst": srcpath
            });
          } else {
            return fs.lstat(srcpath, (err2) => {
              if (err2) {
                err2.message = err2.message.replace("lstat", "ensureSymlink");
                return callback(err2);
              }
              return callback(null, {
                "toCwd": srcpath,
                "toDst": path.relative(dstdir, srcpath)
              });
            });
          }
        });
      }
    }
    function symlinkPathsSync(srcpath, dstpath) {
      let exists;
      if (path.isAbsolute(srcpath)) {
        exists = fs.existsSync(srcpath);
        if (!exists)
          throw new Error("absolute srcpath does not exist");
        return {
          "toCwd": srcpath,
          "toDst": srcpath
        };
      } else {
        const dstdir = path.dirname(dstpath);
        const relativeToDst = path.join(dstdir, srcpath);
        exists = fs.existsSync(relativeToDst);
        if (exists) {
          return {
            "toCwd": relativeToDst,
            "toDst": srcpath
          };
        } else {
          exists = fs.existsSync(srcpath);
          if (!exists)
            throw new Error("relative srcpath does not exist");
          return {
            "toCwd": srcpath,
            "toDst": path.relative(dstdir, srcpath)
          };
        }
      }
    }
    module2.exports = {
      symlinkPaths,
      symlinkPathsSync
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/ensure/symlink-type.js
var require_symlink_type = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/ensure/symlink-type.js"(exports, module2) {
    "use strict";
    var fs = require_graceful_fs();
    function symlinkType(srcpath, type, callback) {
      callback = typeof type === "function" ? type : callback;
      type = typeof type === "function" ? false : type;
      if (type)
        return callback(null, type);
      fs.lstat(srcpath, (err, stats) => {
        if (err)
          return callback(null, "file");
        type = stats && stats.isDirectory() ? "dir" : "file";
        callback(null, type);
      });
    }
    function symlinkTypeSync(srcpath, type) {
      let stats;
      if (type)
        return type;
      try {
        stats = fs.lstatSync(srcpath);
      } catch (e) {
        return "file";
      }
      return stats && stats.isDirectory() ? "dir" : "file";
    }
    module2.exports = {
      symlinkType,
      symlinkTypeSync
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/ensure/symlink.js
var require_symlink = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/ensure/symlink.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromCallback;
    var path = require("path");
    var fs = require_graceful_fs();
    var _mkdirs = require_mkdirs2();
    var mkdirs = _mkdirs.mkdirs;
    var mkdirsSync = _mkdirs.mkdirsSync;
    var _symlinkPaths = require_symlink_paths();
    var symlinkPaths = _symlinkPaths.symlinkPaths;
    var symlinkPathsSync = _symlinkPaths.symlinkPathsSync;
    var _symlinkType = require_symlink_type();
    var symlinkType = _symlinkType.symlinkType;
    var symlinkTypeSync = _symlinkType.symlinkTypeSync;
    var pathExists = require_path_exists().pathExists;
    function createSymlink(srcpath, dstpath, type, callback) {
      callback = typeof type === "function" ? type : callback;
      type = typeof type === "function" ? false : type;
      pathExists(dstpath, (err, destinationExists) => {
        if (err)
          return callback(err);
        if (destinationExists)
          return callback(null);
        symlinkPaths(srcpath, dstpath, (err2, relative) => {
          if (err2)
            return callback(err2);
          srcpath = relative.toDst;
          symlinkType(relative.toCwd, type, (err3, type2) => {
            if (err3)
              return callback(err3);
            const dir = path.dirname(dstpath);
            pathExists(dir, (err4, dirExists) => {
              if (err4)
                return callback(err4);
              if (dirExists)
                return fs.symlink(srcpath, dstpath, type2, callback);
              mkdirs(dir, (err5) => {
                if (err5)
                  return callback(err5);
                fs.symlink(srcpath, dstpath, type2, callback);
              });
            });
          });
        });
      });
    }
    function createSymlinkSync(srcpath, dstpath, type) {
      const destinationExists = fs.existsSync(dstpath);
      if (destinationExists)
        return void 0;
      const relative = symlinkPathsSync(srcpath, dstpath);
      srcpath = relative.toDst;
      type = symlinkTypeSync(relative.toCwd, type);
      const dir = path.dirname(dstpath);
      const exists = fs.existsSync(dir);
      if (exists)
        return fs.symlinkSync(srcpath, dstpath, type);
      mkdirsSync(dir);
      return fs.symlinkSync(srcpath, dstpath, type);
    }
    module2.exports = {
      createSymlink: u(createSymlink),
      createSymlinkSync
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/ensure/index.js
var require_ensure = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/ensure/index.js"(exports, module2) {
    "use strict";
    var file = require_file();
    var link = require_link();
    var symlink = require_symlink();
    module2.exports = {
      createFile: file.createFile,
      createFileSync: file.createFileSync,
      ensureFile: file.createFile,
      ensureFileSync: file.createFileSync,
      createLink: link.createLink,
      createLinkSync: link.createLinkSync,
      ensureLink: link.createLink,
      ensureLinkSync: link.createLinkSync,
      createSymlink: symlink.createSymlink,
      createSymlinkSync: symlink.createSymlinkSync,
      ensureSymlink: symlink.createSymlink,
      ensureSymlinkSync: symlink.createSymlinkSync
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/jsonfile@4.0.0/node_modules/jsonfile/index.js
var require_jsonfile = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/jsonfile@4.0.0/node_modules/jsonfile/index.js"(exports, module2) {
    var _fs;
    try {
      _fs = require_graceful_fs();
    } catch (_) {
      _fs = require("fs");
    }
    function readFile(file, options, callback) {
      if (callback == null) {
        callback = options;
        options = {};
      }
      if (typeof options === "string") {
        options = { encoding: options };
      }
      options = options || {};
      var fs = options.fs || _fs;
      var shouldThrow = true;
      if ("throws" in options) {
        shouldThrow = options.throws;
      }
      fs.readFile(file, options, function(err, data) {
        if (err)
          return callback(err);
        data = stripBom(data);
        var obj;
        try {
          obj = JSON.parse(data, options ? options.reviver : null);
        } catch (err2) {
          if (shouldThrow) {
            err2.message = file + ": " + err2.message;
            return callback(err2);
          } else {
            return callback(null, null);
          }
        }
        callback(null, obj);
      });
    }
    function readFileSync(file, options) {
      options = options || {};
      if (typeof options === "string") {
        options = { encoding: options };
      }
      var fs = options.fs || _fs;
      var shouldThrow = true;
      if ("throws" in options) {
        shouldThrow = options.throws;
      }
      try {
        var content = fs.readFileSync(file, options);
        content = stripBom(content);
        return JSON.parse(content, options.reviver);
      } catch (err) {
        if (shouldThrow) {
          err.message = file + ": " + err.message;
          throw err;
        } else {
          return null;
        }
      }
    }
    function stringify(obj, options) {
      var spaces;
      var EOL = "\n";
      if (typeof options === "object" && options !== null) {
        if (options.spaces) {
          spaces = options.spaces;
        }
        if (options.EOL) {
          EOL = options.EOL;
        }
      }
      var str = JSON.stringify(obj, options ? options.replacer : null, spaces);
      return str.replace(/\n/g, EOL) + EOL;
    }
    function writeFile(file, obj, options, callback) {
      if (callback == null) {
        callback = options;
        options = {};
      }
      options = options || {};
      var fs = options.fs || _fs;
      var str = "";
      try {
        str = stringify(obj, options);
      } catch (err) {
        if (callback)
          callback(err, null);
        return;
      }
      fs.writeFile(file, str, options, callback);
    }
    function writeFileSync(file, obj, options) {
      options = options || {};
      var fs = options.fs || _fs;
      var str = stringify(obj, options);
      return fs.writeFileSync(file, str, options);
    }
    function stripBom(content) {
      if (Buffer.isBuffer(content))
        content = content.toString("utf8");
      content = content.replace(/^\uFEFF/, "");
      return content;
    }
    var jsonfile = {
      readFile,
      readFileSync,
      writeFile,
      writeFileSync
    };
    module2.exports = jsonfile;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/json/jsonfile.js
var require_jsonfile2 = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/json/jsonfile.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromCallback;
    var jsonFile = require_jsonfile();
    module2.exports = {
      readJson: u(jsonFile.readFile),
      readJsonSync: jsonFile.readFileSync,
      writeJson: u(jsonFile.writeFile),
      writeJsonSync: jsonFile.writeFileSync
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/json/output-json.js
var require_output_json = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/json/output-json.js"(exports, module2) {
    "use strict";
    var path = require("path");
    var mkdir = require_mkdirs2();
    var pathExists = require_path_exists().pathExists;
    var jsonFile = require_jsonfile2();
    function outputJson(file, data, options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      const dir = path.dirname(file);
      pathExists(dir, (err, itDoes) => {
        if (err)
          return callback(err);
        if (itDoes)
          return jsonFile.writeJson(file, data, options, callback);
        mkdir.mkdirs(dir, (err2) => {
          if (err2)
            return callback(err2);
          jsonFile.writeJson(file, data, options, callback);
        });
      });
    }
    module2.exports = outputJson;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/json/output-json-sync.js
var require_output_json_sync = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/json/output-json-sync.js"(exports, module2) {
    "use strict";
    var fs = require_graceful_fs();
    var path = require("path");
    var mkdir = require_mkdirs2();
    var jsonFile = require_jsonfile2();
    function outputJsonSync(file, data, options) {
      const dir = path.dirname(file);
      if (!fs.existsSync(dir)) {
        mkdir.mkdirsSync(dir);
      }
      jsonFile.writeJsonSync(file, data, options);
    }
    module2.exports = outputJsonSync;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/json/index.js
var require_json = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/json/index.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromCallback;
    var jsonFile = require_jsonfile2();
    jsonFile.outputJson = u(require_output_json());
    jsonFile.outputJsonSync = require_output_json_sync();
    jsonFile.outputJSON = jsonFile.outputJson;
    jsonFile.outputJSONSync = jsonFile.outputJsonSync;
    jsonFile.writeJSON = jsonFile.writeJson;
    jsonFile.writeJSONSync = jsonFile.writeJsonSync;
    jsonFile.readJSON = jsonFile.readJson;
    jsonFile.readJSONSync = jsonFile.readJsonSync;
    module2.exports = jsonFile;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/move-sync/index.js
var require_move_sync = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/move-sync/index.js"(exports, module2) {
    "use strict";
    var fs = require_graceful_fs();
    var path = require("path");
    var copySync = require_copy_sync2().copySync;
    var removeSync = require_remove().removeSync;
    var mkdirpSync = require_mkdirs2().mkdirsSync;
    var buffer = require_buffer();
    function moveSync(src, dest, options) {
      options = options || {};
      const overwrite = options.overwrite || options.clobber || false;
      src = path.resolve(src);
      dest = path.resolve(dest);
      if (src === dest)
        return fs.accessSync(src);
      if (isSrcSubdir(src, dest))
        throw new Error(`Cannot move '${src}' into itself '${dest}'.`);
      mkdirpSync(path.dirname(dest));
      tryRenameSync();
      function tryRenameSync() {
        if (overwrite) {
          try {
            return fs.renameSync(src, dest);
          } catch (err) {
            if (err.code === "ENOTEMPTY" || err.code === "EEXIST" || err.code === "EPERM") {
              removeSync(dest);
              options.overwrite = false;
              return moveSync(src, dest, options);
            }
            if (err.code !== "EXDEV")
              throw err;
            return moveSyncAcrossDevice(src, dest, overwrite);
          }
        } else {
          try {
            fs.linkSync(src, dest);
            return fs.unlinkSync(src);
          } catch (err) {
            if (err.code === "EXDEV" || err.code === "EISDIR" || err.code === "EPERM" || err.code === "ENOTSUP") {
              return moveSyncAcrossDevice(src, dest, overwrite);
            }
            throw err;
          }
        }
      }
    }
    function moveSyncAcrossDevice(src, dest, overwrite) {
      const stat = fs.statSync(src);
      if (stat.isDirectory()) {
        return moveDirSyncAcrossDevice(src, dest, overwrite);
      } else {
        return moveFileSyncAcrossDevice(src, dest, overwrite);
      }
    }
    function moveFileSyncAcrossDevice(src, dest, overwrite) {
      const BUF_LENGTH = 64 * 1024;
      const _buff = buffer(BUF_LENGTH);
      const flags = overwrite ? "w" : "wx";
      const fdr = fs.openSync(src, "r");
      const stat = fs.fstatSync(fdr);
      const fdw = fs.openSync(dest, flags, stat.mode);
      let pos = 0;
      while (pos < stat.size) {
        const bytesRead = fs.readSync(fdr, _buff, 0, BUF_LENGTH, pos);
        fs.writeSync(fdw, _buff, 0, bytesRead);
        pos += bytesRead;
      }
      fs.closeSync(fdr);
      fs.closeSync(fdw);
      return fs.unlinkSync(src);
    }
    function moveDirSyncAcrossDevice(src, dest, overwrite) {
      const options = {
        overwrite: false
      };
      if (overwrite) {
        removeSync(dest);
        tryCopySync();
      } else {
        tryCopySync();
      }
      function tryCopySync() {
        copySync(src, dest, options);
        return removeSync(src);
      }
    }
    function isSrcSubdir(src, dest) {
      try {
        return fs.statSync(src).isDirectory() && src !== dest && dest.indexOf(src) > -1 && dest.split(path.dirname(src) + path.sep)[1].split(path.sep)[0] === path.basename(src);
      } catch (e) {
        return false;
      }
    }
    module2.exports = {
      moveSync
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/move/index.js
var require_move = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/move/index.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromCallback;
    var fs = require_graceful_fs();
    var path = require("path");
    var copy = require_copy2().copy;
    var remove = require_remove().remove;
    var mkdirp = require_mkdirs2().mkdirp;
    var pathExists = require_path_exists().pathExists;
    function move(src, dest, opts, cb) {
      if (typeof opts === "function") {
        cb = opts;
        opts = {};
      }
      const overwrite = opts.overwrite || opts.clobber || false;
      src = path.resolve(src);
      dest = path.resolve(dest);
      if (src === dest)
        return fs.access(src, cb);
      fs.stat(src, (err, st) => {
        if (err)
          return cb(err);
        if (st.isDirectory() && isSrcSubdir(src, dest)) {
          return cb(new Error(`Cannot move '${src}' to a subdirectory of itself, '${dest}'.`));
        }
        mkdirp(path.dirname(dest), (err2) => {
          if (err2)
            return cb(err2);
          return doRename(src, dest, overwrite, cb);
        });
      });
    }
    function doRename(src, dest, overwrite, cb) {
      if (overwrite) {
        return remove(dest, (err) => {
          if (err)
            return cb(err);
          return rename(src, dest, overwrite, cb);
        });
      }
      pathExists(dest, (err, destExists) => {
        if (err)
          return cb(err);
        if (destExists)
          return cb(new Error("dest already exists."));
        return rename(src, dest, overwrite, cb);
      });
    }
    function rename(src, dest, overwrite, cb) {
      fs.rename(src, dest, (err) => {
        if (!err)
          return cb();
        if (err.code !== "EXDEV")
          return cb(err);
        return moveAcrossDevice(src, dest, overwrite, cb);
      });
    }
    function moveAcrossDevice(src, dest, overwrite, cb) {
      const opts = {
        overwrite,
        errorOnExist: true
      };
      copy(src, dest, opts, (err) => {
        if (err)
          return cb(err);
        return remove(src, cb);
      });
    }
    function isSrcSubdir(src, dest) {
      const srcArray = src.split(path.sep);
      const destArray = dest.split(path.sep);
      return srcArray.reduce((acc, current, i) => {
        return acc && destArray[i] === current;
      }, true);
    }
    module2.exports = {
      move: u(move)
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/output/index.js
var require_output = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/output/index.js"(exports, module2) {
    "use strict";
    var u = require_universalify().fromCallback;
    var fs = require_graceful_fs();
    var path = require("path");
    var mkdir = require_mkdirs2();
    var pathExists = require_path_exists().pathExists;
    function outputFile(file, data, encoding, callback) {
      if (typeof encoding === "function") {
        callback = encoding;
        encoding = "utf8";
      }
      const dir = path.dirname(file);
      pathExists(dir, (err, itDoes) => {
        if (err)
          return callback(err);
        if (itDoes)
          return fs.writeFile(file, data, encoding, callback);
        mkdir.mkdirs(dir, (err2) => {
          if (err2)
            return callback(err2);
          fs.writeFile(file, data, encoding, callback);
        });
      });
    }
    function outputFileSync(file, ...args) {
      const dir = path.dirname(file);
      if (fs.existsSync(dir)) {
        return fs.writeFileSync(file, ...args);
      }
      mkdir.mkdirsSync(dir);
      fs.writeFileSync(file, ...args);
    }
    module2.exports = {
      outputFile: u(outputFile),
      outputFileSync
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/index.js
var require_lib = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/fs-extra@7.0.1/node_modules/fs-extra/lib/index.js"(exports, module2) {
    "use strict";
    module2.exports = Object.assign(
      {},
      require_fs(),
      require_copy_sync2(),
      require_copy2(),
      require_empty(),
      require_ensure(),
      require_json(),
      require_mkdirs2(),
      require_move_sync(),
      require_move(),
      require_output(),
      require_path_exists(),
      require_remove()
    );
    var fs = require("fs");
    if (Object.getOwnPropertyDescriptor(fs, "promises")) {
      Object.defineProperty(module2.exports, "promises", {
        get() {
          return fs.promises;
        }
      });
    }
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Text.js
var require_Text = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Text.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Text = exports.NewlineKind = exports.Encoding = void 0;
    var os = __importStar(require("os"));
    var Encoding;
    (function(Encoding2) {
      Encoding2["Utf8"] = "utf8";
    })(Encoding = exports.Encoding || (exports.Encoding = {}));
    var NewlineKind;
    (function(NewlineKind2) {
      NewlineKind2["CrLf"] = "\r\n";
      NewlineKind2["Lf"] = "\n";
      NewlineKind2["OsDefault"] = "os";
    })(NewlineKind = exports.NewlineKind || (exports.NewlineKind = {}));
    var Text = class {
      static replaceAll(input, searchValue, replaceValue) {
        return input.split(searchValue).join(replaceValue);
      }
      static convertToCrLf(input) {
        return input.replace(Text._newLineRegEx, "\r\n");
      }
      static convertToLf(input) {
        return input.replace(Text._newLineRegEx, "\n");
      }
      static convertTo(input, newlineKind) {
        return input.replace(Text._newLineRegEx, Text.getNewline(newlineKind));
      }
      static getNewline(newlineKind) {
        switch (newlineKind) {
          case NewlineKind.CrLf:
            return "\r\n";
          case NewlineKind.Lf:
            return "\n";
          case NewlineKind.OsDefault:
            return os.EOL;
          default:
            throw new Error("Unsupported newline kind");
        }
      }
      static padEnd(s, minimumLength, paddingCharacter = " ") {
        if (paddingCharacter.length !== 1) {
          throw new Error("The paddingCharacter parameter must be a single character.");
        }
        if (s.length < minimumLength) {
          const paddingArray = new Array(minimumLength - s.length);
          paddingArray.unshift(s);
          return paddingArray.join(paddingCharacter);
        } else {
          return s;
        }
      }
      static padStart(s, minimumLength, paddingCharacter = " ") {
        if (paddingCharacter.length !== 1) {
          throw new Error("The paddingCharacter parameter must be a single character.");
        }
        if (s.length < minimumLength) {
          const paddingArray = new Array(minimumLength - s.length);
          paddingArray.push(s);
          return paddingArray.join(paddingCharacter);
        } else {
          return s;
        }
      }
      static truncateWithEllipsis(s, maximumLength) {
        if (maximumLength < 0) {
          throw new Error("The maximumLength cannot be a negative number");
        }
        if (s.length <= maximumLength) {
          return s;
        }
        if (s.length <= 3) {
          return s.substring(0, maximumLength);
        }
        return s.substring(0, maximumLength - 3) + "...";
      }
      static ensureTrailingNewline(s, newlineKind = NewlineKind.Lf) {
        if (Text._newLineAtEndRegEx.test(s)) {
          return s;
        }
        return s + newlineKind;
      }
    };
    exports.Text = Text;
    Text._newLineRegEx = /\r\n|\n\r|\r|\n/g;
    Text._newLineAtEndRegEx = /(\r\n|\n\r|\r|\n)$/;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/PosixModeBits.js
var require_PosixModeBits = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/PosixModeBits.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PosixModeBits = void 0;
    var PosixModeBits;
    (function(PosixModeBits2) {
      PosixModeBits2[PosixModeBits2["UserRead"] = 256] = "UserRead";
      PosixModeBits2[PosixModeBits2["UserWrite"] = 128] = "UserWrite";
      PosixModeBits2[PosixModeBits2["UserExecute"] = 64] = "UserExecute";
      PosixModeBits2[PosixModeBits2["GroupRead"] = 32] = "GroupRead";
      PosixModeBits2[PosixModeBits2["GroupWrite"] = 16] = "GroupWrite";
      PosixModeBits2[PosixModeBits2["GroupExecute"] = 8] = "GroupExecute";
      PosixModeBits2[PosixModeBits2["OthersRead"] = 4] = "OthersRead";
      PosixModeBits2[PosixModeBits2["OthersWrite"] = 2] = "OthersWrite";
      PosixModeBits2[PosixModeBits2["OthersExecute"] = 1] = "OthersExecute";
      PosixModeBits2[PosixModeBits2["None"] = 0] = "None";
      PosixModeBits2[PosixModeBits2["AllRead"] = 292] = "AllRead";
      PosixModeBits2[PosixModeBits2["AllWrite"] = 146] = "AllWrite";
      PosixModeBits2[PosixModeBits2["AllExecute"] = 73] = "AllExecute";
    })(PosixModeBits = exports.PosixModeBits || (exports.PosixModeBits = {}));
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/LegacyAdapters.js
var require_LegacyAdapters = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/LegacyAdapters.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LegacyAdapters = void 0;
    var LegacyAdapters = class {
      static convertCallbackToPromise(fn, arg1, arg2, arg3, arg4) {
        return new Promise((resolve, reject) => {
          const cb = (error, result) => {
            if (error) {
              reject(LegacyAdapters.scrubError(error));
            } else {
              resolve(result);
            }
          };
          try {
            if (arg1 !== void 0 && arg2 !== void 0 && arg3 !== void 0 && arg4 !== void 0) {
              fn(arg1, arg2, arg3, arg4, cb);
            } else if (arg1 !== void 0 && arg2 !== void 0 && arg3 !== void 0) {
              fn(arg1, arg2, arg3, cb);
            } else if (arg1 !== void 0 && arg2 !== void 0) {
              fn(arg1, arg2, cb);
            } else if (arg1 !== void 0) {
              fn(arg1, cb);
            } else {
              fn(cb);
            }
          } catch (e) {
            reject(e);
          }
        });
      }
      static scrubError(error) {
        if (error instanceof Error) {
          return error;
        } else if (typeof error === "string") {
          return new Error(error);
        } else {
          const errorObject = new Error("An error occurred.");
          errorObject.errorData = error;
          return errorObject;
        }
      }
      static sortStable(array, compare) {
        Array.prototype.sort.call(array, compare);
      }
    };
    exports.LegacyAdapters = LegacyAdapters;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/FileSystem.js
var require_FileSystem = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/FileSystem.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileSystem = exports.AlreadyExistsBehavior = void 0;
    var nodeJsPath = __importStar(require("path"));
    var fs = __importStar(require("fs"));
    var fsx = __importStar(require_lib());
    var Text_1 = require_Text();
    var PosixModeBits_1 = require_PosixModeBits();
    var LegacyAdapters_1 = require_LegacyAdapters();
    var AlreadyExistsBehavior;
    (function(AlreadyExistsBehavior2) {
      AlreadyExistsBehavior2["Overwrite"] = "overwrite";
      AlreadyExistsBehavior2["Error"] = "error";
      AlreadyExistsBehavior2["Ignore"] = "ignore";
    })(AlreadyExistsBehavior = exports.AlreadyExistsBehavior || (exports.AlreadyExistsBehavior = {}));
    var MOVE_DEFAULT_OPTIONS = {
      overwrite: true,
      ensureFolderExists: false
    };
    var READ_FOLDER_DEFAULT_OPTIONS = {
      absolutePaths: false
    };
    var WRITE_FILE_DEFAULT_OPTIONS = {
      ensureFolderExists: false,
      convertLineEndings: void 0,
      encoding: Text_1.Encoding.Utf8
    };
    var APPEND_TO_FILE_DEFAULT_OPTIONS = Object.assign({}, WRITE_FILE_DEFAULT_OPTIONS);
    var READ_FILE_DEFAULT_OPTIONS = {
      encoding: Text_1.Encoding.Utf8,
      convertLineEndings: void 0
    };
    var COPY_FILE_DEFAULT_OPTIONS = {
      alreadyExistsBehavior: AlreadyExistsBehavior.Overwrite
    };
    var COPY_FILES_DEFAULT_OPTIONS = {
      alreadyExistsBehavior: AlreadyExistsBehavior.Overwrite
    };
    var DELETE_FILE_DEFAULT_OPTIONS = {
      throwIfNotExists: false
    };
    var FileSystem = class {
      static exists(path) {
        return FileSystem._wrapException(() => {
          return fsx.existsSync(path);
        });
      }
      static async existsAsync(path) {
        return await FileSystem._wrapExceptionAsync(() => {
          return new Promise((resolve) => {
            fsx.exists(path, resolve);
          });
        });
      }
      static getStatistics(path) {
        return FileSystem._wrapException(() => {
          return fsx.statSync(path);
        });
      }
      static async getStatisticsAsync(path) {
        return await FileSystem._wrapExceptionAsync(() => {
          return fsx.stat(path);
        });
      }
      static updateTimes(path, times) {
        return FileSystem._wrapException(() => {
          fsx.utimesSync(path, times.accessedTime, times.modifiedTime);
        });
      }
      static async updateTimesAsync(path, times) {
        await FileSystem._wrapExceptionAsync(() => {
          return fsx.utimes(path, times.accessedTime, times.modifiedTime);
        });
      }
      static changePosixModeBits(path, mode) {
        FileSystem._wrapException(() => {
          fs.chmodSync(path, mode);
        });
      }
      static async changePosixModeBitsAsync(path, mode) {
        await FileSystem._wrapExceptionAsync(() => {
          return fsx.chmod(path, mode);
        });
      }
      static getPosixModeBits(path) {
        return FileSystem._wrapException(() => {
          return FileSystem.getStatistics(path).mode;
        });
      }
      static async getPosixModeBitsAsync(path) {
        return await FileSystem._wrapExceptionAsync(async () => {
          return (await FileSystem.getStatisticsAsync(path)).mode;
        });
      }
      static formatPosixModeBits(modeBits) {
        let result = "-";
        result += modeBits & PosixModeBits_1.PosixModeBits.UserRead ? "r" : "-";
        result += modeBits & PosixModeBits_1.PosixModeBits.UserWrite ? "w" : "-";
        result += modeBits & PosixModeBits_1.PosixModeBits.UserExecute ? "x" : "-";
        result += modeBits & PosixModeBits_1.PosixModeBits.GroupRead ? "r" : "-";
        result += modeBits & PosixModeBits_1.PosixModeBits.GroupWrite ? "w" : "-";
        result += modeBits & PosixModeBits_1.PosixModeBits.GroupExecute ? "x" : "-";
        result += modeBits & PosixModeBits_1.PosixModeBits.OthersRead ? "r" : "-";
        result += modeBits & PosixModeBits_1.PosixModeBits.OthersWrite ? "w" : "-";
        result += modeBits & PosixModeBits_1.PosixModeBits.OthersExecute ? "x" : "-";
        return result;
      }
      static move(options) {
        FileSystem._wrapException(() => {
          options = Object.assign(Object.assign({}, MOVE_DEFAULT_OPTIONS), options);
          try {
            fsx.moveSync(options.sourcePath, options.destinationPath, { overwrite: options.overwrite });
          } catch (error) {
            if (options.ensureFolderExists) {
              if (!FileSystem.isNotExistError(error)) {
                throw error;
              }
              const folderPath = nodeJsPath.dirname(options.destinationPath);
              FileSystem.ensureFolder(folderPath);
              fsx.moveSync(options.sourcePath, options.destinationPath, { overwrite: options.overwrite });
            } else {
              throw error;
            }
          }
        });
      }
      static async moveAsync(options) {
        await FileSystem._wrapExceptionAsync(async () => {
          options = Object.assign(Object.assign({}, MOVE_DEFAULT_OPTIONS), options);
          try {
            await fsx.move(options.sourcePath, options.destinationPath, { overwrite: options.overwrite });
          } catch (error) {
            if (options.ensureFolderExists) {
              if (!FileSystem.isNotExistError(error)) {
                throw error;
              }
              const folderPath = nodeJsPath.dirname(options.destinationPath);
              await FileSystem.ensureFolderAsync(nodeJsPath.dirname(folderPath));
              await fsx.move(options.sourcePath, options.destinationPath, { overwrite: options.overwrite });
            } else {
              throw error;
            }
          }
        });
      }
      static ensureFolder(folderPath) {
        FileSystem._wrapException(() => {
          fsx.ensureDirSync(folderPath);
        });
      }
      static async ensureFolderAsync(folderPath) {
        await FileSystem._wrapExceptionAsync(() => {
          return fsx.ensureDir(folderPath);
        });
      }
      static readFolder(folderPath, options) {
        return FileSystem.readFolderItemNames(folderPath, options);
      }
      static async readFolderAsync(folderPath, options) {
        return await FileSystem.readFolderItemNamesAsync(folderPath, options);
      }
      static readFolderItemNames(folderPath, options) {
        return FileSystem._wrapException(() => {
          options = Object.assign(Object.assign({}, READ_FOLDER_DEFAULT_OPTIONS), options);
          const fileNames = fsx.readdirSync(folderPath);
          if (options.absolutePaths) {
            return fileNames.map((fileName) => nodeJsPath.resolve(folderPath, fileName));
          } else {
            return fileNames;
          }
        });
      }
      static async readFolderItemNamesAsync(folderPath, options) {
        return await FileSystem._wrapExceptionAsync(async () => {
          options = Object.assign(Object.assign({}, READ_FOLDER_DEFAULT_OPTIONS), options);
          const fileNames = await fsx.readdir(folderPath);
          if (options.absolutePaths) {
            return fileNames.map((fileName) => nodeJsPath.resolve(folderPath, fileName));
          } else {
            return fileNames;
          }
        });
      }
      static readFolderItems(folderPath, options) {
        return FileSystem._wrapException(() => {
          options = Object.assign(Object.assign({}, READ_FOLDER_DEFAULT_OPTIONS), options);
          const folderEntries = fsx.readdirSync(folderPath, { withFileTypes: true });
          if (options.absolutePaths) {
            return folderEntries.map((folderEntry) => {
              folderEntry.name = nodeJsPath.resolve(folderPath, folderEntry.name);
              return folderEntry;
            });
          } else {
            return folderEntries;
          }
        });
      }
      static async readFolderItemsAsync(folderPath, options) {
        return await FileSystem._wrapExceptionAsync(async () => {
          options = Object.assign(Object.assign({}, READ_FOLDER_DEFAULT_OPTIONS), options);
          const folderEntries = await LegacyAdapters_1.LegacyAdapters.convertCallbackToPromise(fs.readdir, folderPath, { withFileTypes: true });
          if (options.absolutePaths) {
            return folderEntries.map((folderEntry) => {
              folderEntry.name = nodeJsPath.resolve(folderPath, folderEntry.name);
              return folderEntry;
            });
          } else {
            return folderEntries;
          }
        });
      }
      static deleteFolder(folderPath) {
        FileSystem._wrapException(() => {
          fsx.removeSync(folderPath);
        });
      }
      static async deleteFolderAsync(folderPath) {
        await FileSystem._wrapExceptionAsync(() => {
          return fsx.remove(folderPath);
        });
      }
      static ensureEmptyFolder(folderPath) {
        FileSystem._wrapException(() => {
          fsx.emptyDirSync(folderPath);
        });
      }
      static async ensureEmptyFolderAsync(folderPath) {
        await FileSystem._wrapExceptionAsync(() => {
          return fsx.emptyDir(folderPath);
        });
      }
      static writeFile(filePath, contents, options) {
        FileSystem._wrapException(() => {
          options = Object.assign(Object.assign({}, WRITE_FILE_DEFAULT_OPTIONS), options);
          if (options.convertLineEndings) {
            contents = Text_1.Text.convertTo(contents.toString(), options.convertLineEndings);
          }
          try {
            fsx.writeFileSync(filePath, contents, { encoding: options.encoding });
          } catch (error) {
            if (options.ensureFolderExists) {
              if (!FileSystem.isNotExistError(error)) {
                throw error;
              }
              const folderPath = nodeJsPath.dirname(filePath);
              FileSystem.ensureFolder(folderPath);
              fsx.writeFileSync(filePath, contents, { encoding: options.encoding });
            } else {
              throw error;
            }
          }
        });
      }
      static async writeFileAsync(filePath, contents, options) {
        await FileSystem._wrapExceptionAsync(async () => {
          options = Object.assign(Object.assign({}, WRITE_FILE_DEFAULT_OPTIONS), options);
          if (options.convertLineEndings) {
            contents = Text_1.Text.convertTo(contents.toString(), options.convertLineEndings);
          }
          try {
            await fsx.writeFile(filePath, contents, { encoding: options.encoding });
          } catch (error) {
            if (options.ensureFolderExists) {
              if (!FileSystem.isNotExistError(error)) {
                throw error;
              }
              const folderPath = nodeJsPath.dirname(filePath);
              await FileSystem.ensureFolderAsync(folderPath);
              await fsx.writeFile(filePath, contents, { encoding: options.encoding });
            } else {
              throw error;
            }
          }
        });
      }
      static appendToFile(filePath, contents, options) {
        FileSystem._wrapException(() => {
          options = Object.assign(Object.assign({}, APPEND_TO_FILE_DEFAULT_OPTIONS), options);
          if (options.convertLineEndings) {
            contents = Text_1.Text.convertTo(contents.toString(), options.convertLineEndings);
          }
          try {
            fsx.appendFileSync(filePath, contents, { encoding: options.encoding });
          } catch (error) {
            if (options.ensureFolderExists) {
              if (!FileSystem.isNotExistError(error)) {
                throw error;
              }
              const folderPath = nodeJsPath.dirname(filePath);
              FileSystem.ensureFolder(folderPath);
              fsx.appendFileSync(filePath, contents, { encoding: options.encoding });
            } else {
              throw error;
            }
          }
        });
      }
      static async appendToFileAsync(filePath, contents, options) {
        await FileSystem._wrapExceptionAsync(async () => {
          options = Object.assign(Object.assign({}, APPEND_TO_FILE_DEFAULT_OPTIONS), options);
          if (options.convertLineEndings) {
            contents = Text_1.Text.convertTo(contents.toString(), options.convertLineEndings);
          }
          try {
            await fsx.appendFile(filePath, contents, { encoding: options.encoding });
          } catch (error) {
            if (options.ensureFolderExists) {
              if (!FileSystem.isNotExistError(error)) {
                throw error;
              }
              const folderPath = nodeJsPath.dirname(filePath);
              await FileSystem.ensureFolderAsync(folderPath);
              await fsx.appendFile(filePath, contents, { encoding: options.encoding });
            } else {
              throw error;
            }
          }
        });
      }
      static readFile(filePath, options) {
        return FileSystem._wrapException(() => {
          options = Object.assign(Object.assign({}, READ_FILE_DEFAULT_OPTIONS), options);
          let contents = FileSystem.readFileToBuffer(filePath).toString(options.encoding);
          if (options.convertLineEndings) {
            contents = Text_1.Text.convertTo(contents, options.convertLineEndings);
          }
          return contents;
        });
      }
      static async readFileAsync(filePath, options) {
        return await FileSystem._wrapExceptionAsync(async () => {
          options = Object.assign(Object.assign({}, READ_FILE_DEFAULT_OPTIONS), options);
          let contents = (await FileSystem.readFileToBufferAsync(filePath)).toString(options.encoding);
          if (options.convertLineEndings) {
            contents = Text_1.Text.convertTo(contents, options.convertLineEndings);
          }
          return contents;
        });
      }
      static readFileToBuffer(filePath) {
        return FileSystem._wrapException(() => {
          return fsx.readFileSync(filePath);
        });
      }
      static async readFileToBufferAsync(filePath) {
        return await FileSystem._wrapExceptionAsync(() => {
          return fsx.readFile(filePath);
        });
      }
      static copyFile(options) {
        options = Object.assign(Object.assign({}, COPY_FILE_DEFAULT_OPTIONS), options);
        if (FileSystem.getStatistics(options.sourcePath).isDirectory()) {
          throw new Error("The specified path refers to a folder; this operation expects a file object:\n" + options.sourcePath);
        }
        FileSystem._wrapException(() => {
          fsx.copySync(options.sourcePath, options.destinationPath, {
            errorOnExist: options.alreadyExistsBehavior === AlreadyExistsBehavior.Error,
            overwrite: options.alreadyExistsBehavior === AlreadyExistsBehavior.Overwrite
          });
        });
      }
      static async copyFileAsync(options) {
        options = Object.assign(Object.assign({}, COPY_FILE_DEFAULT_OPTIONS), options);
        if ((await FileSystem.getStatisticsAsync(options.sourcePath)).isDirectory()) {
          throw new Error("The specified path refers to a folder; this operation expects a file object:\n" + options.sourcePath);
        }
        await FileSystem._wrapExceptionAsync(() => {
          return fsx.copy(options.sourcePath, options.destinationPath, {
            errorOnExist: options.alreadyExistsBehavior === AlreadyExistsBehavior.Error,
            overwrite: options.alreadyExistsBehavior === AlreadyExistsBehavior.Overwrite
          });
        });
      }
      static copyFiles(options) {
        options = Object.assign(Object.assign({}, COPY_FILES_DEFAULT_OPTIONS), options);
        FileSystem._wrapException(() => {
          fsx.copySync(options.sourcePath, options.destinationPath, {
            dereference: !!options.dereferenceSymlinks,
            errorOnExist: options.alreadyExistsBehavior === AlreadyExistsBehavior.Error,
            overwrite: options.alreadyExistsBehavior === AlreadyExistsBehavior.Overwrite,
            preserveTimestamps: !!options.preserveTimestamps,
            filter: options.filter
          });
        });
      }
      static async copyFilesAsync(options) {
        options = Object.assign(Object.assign({}, COPY_FILES_DEFAULT_OPTIONS), options);
        await FileSystem._wrapExceptionAsync(async () => {
          await fsx.copy(options.sourcePath, options.destinationPath, {
            dereference: !!options.dereferenceSymlinks,
            errorOnExist: options.alreadyExistsBehavior === AlreadyExistsBehavior.Error,
            overwrite: options.alreadyExistsBehavior === AlreadyExistsBehavior.Overwrite,
            preserveTimestamps: !!options.preserveTimestamps,
            filter: options.filter
          });
        });
      }
      static deleteFile(filePath, options) {
        FileSystem._wrapException(() => {
          options = Object.assign(Object.assign({}, DELETE_FILE_DEFAULT_OPTIONS), options);
          try {
            fsx.unlinkSync(filePath);
          } catch (error) {
            if (options.throwIfNotExists || !FileSystem.isNotExistError(error)) {
              throw error;
            }
          }
        });
      }
      static async deleteFileAsync(filePath, options) {
        await FileSystem._wrapExceptionAsync(async () => {
          options = Object.assign(Object.assign({}, DELETE_FILE_DEFAULT_OPTIONS), options);
          try {
            await fsx.unlink(filePath);
          } catch (error) {
            if (options.throwIfNotExists || !FileSystem.isNotExistError(error)) {
              throw error;
            }
          }
        });
      }
      static getLinkStatistics(path) {
        return FileSystem._wrapException(() => {
          return fsx.lstatSync(path);
        });
      }
      static async getLinkStatisticsAsync(path) {
        return await FileSystem._wrapExceptionAsync(() => {
          return fsx.lstat(path);
        });
      }
      static readLink(path) {
        return FileSystem._wrapException(() => {
          return fsx.readlinkSync(path);
        });
      }
      static async readLinkAsync(path) {
        return await FileSystem._wrapExceptionAsync(() => {
          return fsx.readlink(path);
        });
      }
      static createSymbolicLinkJunction(options) {
        FileSystem._wrapException(() => {
          return FileSystem._handleLink(() => {
            return fsx.symlinkSync(options.linkTargetPath, options.newLinkPath, "junction");
          }, options);
        });
      }
      static async createSymbolicLinkJunctionAsync(options) {
        await FileSystem._wrapExceptionAsync(() => {
          return FileSystem._handleLinkAsync(() => {
            return fsx.symlink(options.linkTargetPath, options.newLinkPath, "junction");
          }, options);
        });
      }
      static createSymbolicLinkFile(options) {
        FileSystem._wrapException(() => {
          return FileSystem._handleLink(() => {
            return fsx.symlinkSync(options.linkTargetPath, options.newLinkPath, "file");
          }, options);
        });
      }
      static async createSymbolicLinkFileAsync(options) {
        await FileSystem._wrapExceptionAsync(() => {
          return FileSystem._handleLinkAsync(() => {
            return fsx.symlink(options.linkTargetPath, options.newLinkPath, "file");
          }, options);
        });
      }
      static createSymbolicLinkFolder(options) {
        FileSystem._wrapException(() => {
          return FileSystem._handleLink(() => {
            return fsx.symlinkSync(options.linkTargetPath, options.newLinkPath, "dir");
          }, options);
        });
      }
      static async createSymbolicLinkFolderAsync(options) {
        await FileSystem._wrapExceptionAsync(() => {
          return FileSystem._handleLinkAsync(() => {
            return fsx.symlink(options.linkTargetPath, options.newLinkPath, "dir");
          }, options);
        });
      }
      static createHardLink(options) {
        FileSystem._wrapException(() => {
          return FileSystem._handleLink(() => {
            return fsx.linkSync(options.linkTargetPath, options.newLinkPath);
          }, Object.assign(Object.assign({}, options), { linkTargetMustExist: true }));
        });
      }
      static async createHardLinkAsync(options) {
        await FileSystem._wrapExceptionAsync(() => {
          return FileSystem._handleLinkAsync(() => {
            return fsx.link(options.linkTargetPath, options.newLinkPath);
          }, Object.assign(Object.assign({}, options), { linkTargetMustExist: true }));
        });
      }
      static getRealPath(linkPath) {
        return FileSystem._wrapException(() => {
          return fsx.realpathSync(linkPath);
        });
      }
      static async getRealPathAsync(linkPath) {
        return await FileSystem._wrapExceptionAsync(() => {
          return fsx.realpath(linkPath);
        });
      }
      static isExistError(error) {
        return FileSystem.isErrnoException(error) && error.code === "EEXIST";
      }
      static isNotExistError(error) {
        return FileSystem.isFileDoesNotExistError(error) || FileSystem.isFolderDoesNotExistError(error);
      }
      static isFileDoesNotExistError(error) {
        return FileSystem.isErrnoException(error) && error.code === "ENOENT";
      }
      static isFolderDoesNotExistError(error) {
        return FileSystem.isErrnoException(error) && error.code === "ENOTDIR";
      }
      static isDirectoryError(error) {
        return FileSystem.isErrnoException(error) && error.code === "EISDIR";
      }
      static isNotDirectoryError(error) {
        return FileSystem.isErrnoException(error) && error.code === "ENOTDIR";
      }
      static isUnlinkNotPermittedError(error) {
        return FileSystem.isErrnoException(error) && error.code === "EPERM" && error.syscall === "unlink";
      }
      static isErrnoException(error) {
        const typedError = error;
        return typeof typedError.code === "string" && typeof typedError.errno === "number" && typeof typedError.path === "string" && typeof typedError.syscall === "string";
      }
      static _handleLink(linkFn, options) {
        try {
          linkFn();
        } catch (error) {
          if (FileSystem.isExistError(error)) {
            switch (options.alreadyExistsBehavior) {
              case AlreadyExistsBehavior.Ignore:
                break;
              case AlreadyExistsBehavior.Overwrite:
                this.deleteFile(options.newLinkPath);
                linkFn();
                break;
              case AlreadyExistsBehavior.Error:
              default:
                throw error;
            }
          } else {
            if (FileSystem.isNotExistError(error) && (!options.linkTargetMustExist || FileSystem.exists(options.linkTargetPath))) {
              this.ensureFolder(nodeJsPath.dirname(options.newLinkPath));
              linkFn();
            } else {
              throw error;
            }
          }
        }
      }
      static async _handleLinkAsync(linkFn, options) {
        try {
          await linkFn();
        } catch (error) {
          if (FileSystem.isExistError(error)) {
            switch (options.alreadyExistsBehavior) {
              case AlreadyExistsBehavior.Ignore:
                break;
              case AlreadyExistsBehavior.Overwrite:
                await this.deleteFileAsync(options.newLinkPath);
                await linkFn();
                break;
              case AlreadyExistsBehavior.Error:
              default:
                throw error;
            }
          } else {
            if (FileSystem.isNotExistError(error) && (!options.linkTargetMustExist || await FileSystem.existsAsync(options.linkTargetPath))) {
              await this.ensureFolderAsync(nodeJsPath.dirname(options.newLinkPath));
              await linkFn();
            } else {
              throw error;
            }
          }
        }
      }
      static _wrapException(fn) {
        try {
          return fn();
        } catch (error) {
          FileSystem._updateErrorMessage(error);
          throw error;
        }
      }
      static async _wrapExceptionAsync(fn) {
        try {
          return await fn();
        } catch (error) {
          FileSystem._updateErrorMessage(error);
          throw error;
        }
      }
      static _updateErrorMessage(error) {
        if (FileSystem.isErrnoException(error)) {
          if (FileSystem.isFileDoesNotExistError(error)) {
            error.message = `File does not exist: ${error.path}
${error.message}`;
          } else if (FileSystem.isFolderDoesNotExistError(error)) {
            error.message = `Folder does not exist: ${error.path}
${error.message}`;
          } else if (FileSystem.isExistError(error)) {
            const extendedError = error;
            error.message = `File or folder already exists: ${extendedError.dest}
${error.message}`;
          } else if (FileSystem.isUnlinkNotPermittedError(error)) {
            error.message = `File or folder could not be deleted: ${error.path}
${error.message}`;
          } else if (FileSystem.isDirectoryError(error)) {
            error.message = `Target is a folder, not a file: ${error.path}
${error.message}`;
          } else if (FileSystem.isNotDirectoryError(error)) {
            error.message = `Target is not a folder: ${error.path}
${error.message}`;
          }
        }
      }
    };
    exports.FileSystem = FileSystem;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Executable.js
var require_Executable = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Executable.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Executable = void 0;
    var child_process = __importStar(require("child_process"));
    var os = __importStar(require("os"));
    var path = __importStar(require("path"));
    var EnvironmentMap_1 = require_EnvironmentMap();
    var FileSystem_1 = require_FileSystem();
    var PosixModeBits_1 = require_PosixModeBits();
    var Executable = class {
      static spawnSync(filename, args, options) {
        if (!options) {
          options = {};
        }
        const context = Executable._getExecutableContext(options);
        const resolvedPath = Executable._tryResolve(filename, options, context);
        if (!resolvedPath) {
          throw new Error(`The executable file was not found: "${filename}"`);
        }
        const spawnOptions = {
          cwd: context.currentWorkingDirectory,
          env: context.environmentMap.toObject(),
          input: options.input,
          stdio: options.stdio,
          timeout: options.timeoutMs,
          maxBuffer: options.maxBuffer,
          encoding: "utf8",
          shell: false
        };
        const normalizedCommandLine = Executable._buildCommandLineFixup(resolvedPath, args, context);
        return child_process.spawnSync(normalizedCommandLine.path, normalizedCommandLine.args, spawnOptions);
      }
      static spawn(filename, args, options) {
        if (!options) {
          options = {};
        }
        const context = Executable._getExecutableContext(options);
        const resolvedPath = Executable._tryResolve(filename, options, context);
        if (!resolvedPath) {
          throw new Error(`The executable file was not found: "${filename}"`);
        }
        const spawnOptions = {
          cwd: context.currentWorkingDirectory,
          env: context.environmentMap.toObject(),
          stdio: options.stdio,
          shell: false
        };
        const normalizedCommandLine = Executable._buildCommandLineFixup(resolvedPath, args, context);
        return child_process.spawn(normalizedCommandLine.path, normalizedCommandLine.args, spawnOptions);
      }
      static _buildCommandLineFixup(resolvedPath, args, context) {
        const fileExtension = path.extname(resolvedPath);
        if (os.platform() === "win32") {
          switch (fileExtension.toUpperCase()) {
            case ".EXE":
            case ".COM":
              break;
            case ".BAT":
            case ".CMD": {
              Executable._validateArgsForWindowsShell(args);
              let shellPath = context.environmentMap.get("COMSPEC");
              if (!shellPath || !Executable._canExecute(shellPath, context)) {
                shellPath = Executable.tryResolve("cmd.exe");
              }
              if (!shellPath) {
                throw new Error(`Unable to execute "${path.basename(resolvedPath)}" because CMD.exe was not found in the PATH`);
              }
              const shellArgs = [];
              shellArgs.push("/d");
              shellArgs.push("/s");
              shellArgs.push("/c");
              shellArgs.push(Executable._getEscapedForWindowsShell(resolvedPath));
              shellArgs.push(...args);
              return { path: shellPath, args: shellArgs };
            }
            default:
              throw new Error(`Cannot execute "${path.basename(resolvedPath)}" because the file type is not supported`);
          }
        }
        return {
          path: resolvedPath,
          args
        };
      }
      static tryResolve(filename, options) {
        return Executable._tryResolve(filename, options || {}, Executable._getExecutableContext(options));
      }
      static _tryResolve(filename, options, context) {
        const hasPathSeparators = filename.indexOf("/") >= 0 || os.platform() === "win32" && filename.indexOf("\\") >= 0;
        if (hasPathSeparators) {
          const resolvedPath = path.resolve(context.currentWorkingDirectory, filename);
          return Executable._tryResolveFileExtension(resolvedPath, context);
        } else {
          const pathsToSearch = Executable._getSearchFolders(context);
          for (const pathToSearch of pathsToSearch) {
            const resolvedPath = path.join(pathToSearch, filename);
            const result = Executable._tryResolveFileExtension(resolvedPath, context);
            if (result) {
              return result;
            }
          }
          return void 0;
        }
      }
      static _tryResolveFileExtension(resolvedPath, context) {
        if (Executable._canExecute(resolvedPath, context)) {
          return resolvedPath;
        }
        for (const shellExtension of context.windowsExecutableExtensions) {
          const resolvedNameWithExtension = resolvedPath + shellExtension;
          if (Executable._canExecute(resolvedNameWithExtension, context)) {
            return resolvedNameWithExtension;
          }
        }
        return void 0;
      }
      static _buildEnvironmentMap(options) {
        const environmentMap = new EnvironmentMap_1.EnvironmentMap();
        if (options.environment !== void 0 && options.environmentMap !== void 0) {
          throw new Error("IExecutableResolveOptions.environment and IExecutableResolveOptions.environmentMap cannot both be specified");
        }
        if (options.environment !== void 0) {
          environmentMap.mergeFromObject(options.environment);
        } else if (options.environmentMap !== void 0) {
          environmentMap.mergeFrom(options.environmentMap);
        } else {
          environmentMap.mergeFromObject(process.env);
        }
        return environmentMap;
      }
      static _canExecute(filePath, context) {
        if (!FileSystem_1.FileSystem.exists(filePath)) {
          return false;
        }
        if (os.platform() === "win32") {
          if (path.extname(filePath) === "") {
            return false;
          }
        } else {
          try {
            if ((FileSystem_1.FileSystem.getPosixModeBits(filePath) & PosixModeBits_1.PosixModeBits.AllExecute) === 0) {
              return false;
            }
          } catch (error) {
          }
        }
        return true;
      }
      static _getSearchFolders(context) {
        const pathList = context.environmentMap.get("PATH") || "";
        const folders = [];
        const seenPaths = /* @__PURE__ */ new Set();
        for (const splitPath of pathList.split(path.delimiter)) {
          const trimmedPath = splitPath.trim();
          if (trimmedPath !== "") {
            if (!seenPaths.has(trimmedPath)) {
              const resolvedPath = path.resolve(context.currentWorkingDirectory, trimmedPath);
              if (!seenPaths.has(resolvedPath)) {
                if (FileSystem_1.FileSystem.exists(resolvedPath)) {
                  folders.push(resolvedPath);
                }
                seenPaths.add(resolvedPath);
              }
              seenPaths.add(trimmedPath);
            }
          }
        }
        return folders;
      }
      static _getExecutableContext(options) {
        if (!options) {
          options = {};
        }
        const environment = Executable._buildEnvironmentMap(options);
        let currentWorkingDirectory;
        if (options.currentWorkingDirectory) {
          currentWorkingDirectory = path.resolve(options.currentWorkingDirectory);
        } else {
          currentWorkingDirectory = process.cwd();
        }
        const windowsExecutableExtensions = [];
        if (os.platform() === "win32") {
          const pathExtVariable = environment.get("PATHEXT") || "";
          for (const splitValue of pathExtVariable.split(";")) {
            const trimmed = splitValue.trim().toLowerCase();
            if (/^\.[a-z0-9\.]*[a-z0-9]$/i.test(trimmed)) {
              if (windowsExecutableExtensions.indexOf(trimmed) < 0) {
                windowsExecutableExtensions.push(trimmed);
              }
            }
          }
        }
        return {
          environmentMap: environment,
          currentWorkingDirectory,
          windowsExecutableExtensions
        };
      }
      static _getEscapedForWindowsShell(text) {
        const escapableCharRegExp = /[%\^&|<> ]/g;
        return text.replace(escapableCharRegExp, (value) => "^" + value);
      }
      static _validateArgsForWindowsShell(args) {
        const specialCharRegExp = /[%\^&|<>\r\n]/g;
        for (const arg of args) {
          const match = arg.match(specialCharRegExp);
          if (match) {
            throw new Error(`The command line argument ${JSON.stringify(arg)} contains a special character ${JSON.stringify(match[0])} that cannot be escaped for the Windows shell`);
          }
        }
      }
    };
    exports.Executable = Executable;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Path.js
var require_Path = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Path.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Path = void 0;
    var path = __importStar(require("path"));
    var Path = class {
      static isUnder(childPath, parentFolderPath) {
        const relativePath = path.relative(childPath, parentFolderPath);
        return Path._relativePathRegex.test(relativePath);
      }
      static isUnderOrEqual(childPath, parentFolderPath) {
        const relativePath = path.relative(childPath, parentFolderPath);
        return relativePath === "" || Path._relativePathRegex.test(relativePath);
      }
      static isEqual(path1, path2) {
        return path.relative(path1, path2) === "";
      }
      static formatConcisely(options) {
        const relativePath = path.relative(options.pathToConvert, options.baseFolder);
        const isUnderOrEqual = relativePath === "" || Path._relativePathRegex.test(relativePath);
        if (isUnderOrEqual) {
          const convertedPath = Path.convertToSlashes(path.relative(options.baseFolder, options.pathToConvert));
          if (options.trimLeadingDotSlash) {
            return convertedPath;
          } else {
            return `./${convertedPath}`;
          }
        }
        const absolutePath = path.resolve(options.pathToConvert);
        return absolutePath;
      }
      static formatFileLocation(options) {
        const { message, format, pathToFormat, baseFolder, line, column } = options;
        const filePath = baseFolder ? Path.formatConcisely({
          pathToConvert: pathToFormat,
          baseFolder,
          trimLeadingDotSlash: true
        }) : path.resolve(pathToFormat);
        let formattedFileLocation;
        switch (format) {
          case "Unix": {
            if (line !== void 0 && column !== void 0) {
              formattedFileLocation = `:${line}:${column}`;
            } else if (line !== void 0) {
              formattedFileLocation = `:${line}`;
            } else {
              formattedFileLocation = "";
            }
            break;
          }
          case "VisualStudio": {
            if (line !== void 0 && column !== void 0) {
              formattedFileLocation = `(${line},${column})`;
            } else if (line !== void 0) {
              formattedFileLocation = `(${line})`;
            } else {
              formattedFileLocation = "";
            }
            break;
          }
          default: {
            throw new Error(`Unknown format: ${format}`);
          }
        }
        return `${filePath}${formattedFileLocation} - ${message}`;
      }
      static convertToSlashes(inputPath) {
        return inputPath.replace(/\\/g, "/");
      }
      static convertToBackslashes(inputPath) {
        return inputPath.replace(/\//g, "\\");
      }
      static convertToPlatformDefault(inputPath) {
        return path.sep === "/" ? Path.convertToSlashes(inputPath) : Path.convertToBackslashes(inputPath);
      }
      static isDownwardRelative(inputPath) {
        if (path.isAbsolute(inputPath)) {
          return false;
        }
        if (Path._upwardPathSegmentRegex.test(inputPath)) {
          return false;
        }
        return true;
      }
    };
    exports.Path = Path;
    Path._relativePathRegex = /^[.\/\\]+$/;
    Path._upwardPathSegmentRegex = /([\/\\]|^)\.\.([\/\\]|$)/;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/FileError.js
var require_FileError = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/FileError.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileError = void 0;
    var Path_1 = require_Path();
    var TypeUuid_1 = require_TypeUuid();
    var uuidFileError = "37a4c772-2dc8-4c66-89ae-262f8cc1f0c1";
    var baseFolderEnvVar = "RUSHSTACK_FILE_ERROR_BASE_FOLDER";
    var FileError = class extends Error {
      constructor(message, options) {
        super(message);
        this.absolutePath = options.absolutePath;
        this.projectFolder = options.projectFolder;
        this.line = options.line;
        this.column = options.column;
        this.__proto__ = FileError.prototype;
      }
      toString() {
        return this.getFormattedErrorMessage();
      }
      getFormattedErrorMessage(options) {
        return Path_1.Path.formatFileLocation({
          format: (options === null || options === void 0 ? void 0 : options.format) || "Unix",
          baseFolder: this._evaluateBaseFolder(),
          pathToFormat: this.absolutePath,
          message: this.message,
          line: this.line,
          column: this.column
        });
      }
      _evaluateBaseFolder() {
        if (!FileError._sanitizedEnvironmentVariable && process.env[baseFolderEnvVar]) {
          FileError._sanitizedEnvironmentVariable = process.env[baseFolderEnvVar].replace(/^("|')|("|')$/g, "");
        }
        if (FileError._environmentVariableIsAbsolutePath) {
          return FileError._sanitizedEnvironmentVariable;
        }
        const baseFolderFn = FileError._environmentVariableBasePathFnMap.get(FileError._sanitizedEnvironmentVariable);
        if (baseFolderFn) {
          return baseFolderFn(this);
        }
        const baseFolderTokenRegex = /{([^}]+)}/g;
        const result = baseFolderTokenRegex.exec(FileError._sanitizedEnvironmentVariable);
        if (!result) {
          FileError._environmentVariableIsAbsolutePath = true;
          return FileError._sanitizedEnvironmentVariable;
        } else if (result.index !== 0) {
          throw new Error(`The ${baseFolderEnvVar} environment variable contains text before the token "${result[0]}".`);
        } else if (result[0].length !== FileError._sanitizedEnvironmentVariable.length) {
          throw new Error(`The ${baseFolderEnvVar} environment variable contains text after the token "${result[0]}".`);
        } else {
          throw new Error(`The ${baseFolderEnvVar} environment variable contains a token "${result[0]}", which is not supported.`);
        }
      }
      static [Symbol.hasInstance](instance) {
        return TypeUuid_1.TypeUuid.isInstanceOf(instance, uuidFileError);
      }
    };
    exports.FileError = FileError;
    FileError._environmentVariableIsAbsolutePath = false;
    FileError._environmentVariableBasePathFnMap = /* @__PURE__ */ new Map([
      [void 0, (fileError) => fileError.projectFolder],
      ["{PROJECT_FOLDER}", (fileError) => fileError.projectFolder],
      ["{ABSOLUTE_PATH}", (fileError) => void 0]
    ]);
    TypeUuid_1.TypeUuid.registerClass(FileError, uuidFileError);
  }
});

// ../../../common/temp/default/node_modules/.pnpm/import-lazy@4.0.0/node_modules/import-lazy/index.js
var require_import_lazy = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/import-lazy@4.0.0/node_modules/import-lazy/index.js"(exports, module2) {
    "use strict";
    var lazy = (importedModule, importFn, moduleId) => importedModule === void 0 ? importFn(moduleId) : importedModule;
    module2.exports = (importFn) => {
      return (moduleId) => {
        let importedModule;
        const handler = {
          get: (target, property) => {
            importedModule = lazy(importedModule, importFn, moduleId);
            return Reflect.get(importedModule, property);
          },
          apply: (target, thisArgument, argumentsList) => {
            importedModule = lazy(importedModule, importFn, moduleId);
            return Reflect.apply(importedModule, thisArgument, argumentsList);
          },
          construct: (target, argumentsList) => {
            importedModule = lazy(importedModule, importFn, moduleId);
            return Reflect.construct(importedModule, argumentsList);
          }
        };
        return new Proxy(function() {
        }, handler);
      };
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/homedir.js
var require_homedir = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/homedir.js"(exports, module2) {
    "use strict";
    var os = require("os");
    module2.exports = os.homedir || function homedir() {
      var home = process.env.HOME;
      var user = process.env.LOGNAME || process.env.USER || process.env.LNAME || process.env.USERNAME;
      if (process.platform === "win32") {
        return process.env.USERPROFILE || process.env.HOMEDRIVE + process.env.HOMEPATH || home || null;
      }
      if (process.platform === "darwin") {
        return home || (user ? "/Users/" + user : null);
      }
      if (process.platform === "linux") {
        return home || (process.getuid() === 0 ? "/root" : user ? "/home/" + user : null);
      }
      return home || null;
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/caller.js
var require_caller = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/caller.js"(exports, module2) {
    module2.exports = function() {
      var origPrepareStackTrace = Error.prepareStackTrace;
      Error.prepareStackTrace = function(_, stack2) {
        return stack2;
      };
      var stack = new Error().stack;
      Error.prepareStackTrace = origPrepareStackTrace;
      return stack[2].getFileName();
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/path-parse@1.0.7/node_modules/path-parse/index.js
var require_path_parse = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/path-parse@1.0.7/node_modules/path-parse/index.js"(exports, module2) {
    "use strict";
    var isWindows = process.platform === "win32";
    var splitWindowsRe = /^(((?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?[\\\/]?)(?:[^\\\/]*[\\\/])*)((\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))[\\\/]*$/;
    var win32 = {};
    function win32SplitPath(filename) {
      return splitWindowsRe.exec(filename).slice(1);
    }
    win32.parse = function(pathString) {
      if (typeof pathString !== "string") {
        throw new TypeError(
          "Parameter 'pathString' must be a string, not " + typeof pathString
        );
      }
      var allParts = win32SplitPath(pathString);
      if (!allParts || allParts.length !== 5) {
        throw new TypeError("Invalid path '" + pathString + "'");
      }
      return {
        root: allParts[1],
        dir: allParts[0] === allParts[1] ? allParts[0] : allParts[0].slice(0, -1),
        base: allParts[2],
        ext: allParts[4],
        name: allParts[3]
      };
    };
    var splitPathRe = /^((\/?)(?:[^\/]*\/)*)((\.{1,2}|[^\/]+?|)(\.[^.\/]*|))[\/]*$/;
    var posix = {};
    function posixSplitPath(filename) {
      return splitPathRe.exec(filename).slice(1);
    }
    posix.parse = function(pathString) {
      if (typeof pathString !== "string") {
        throw new TypeError(
          "Parameter 'pathString' must be a string, not " + typeof pathString
        );
      }
      var allParts = posixSplitPath(pathString);
      if (!allParts || allParts.length !== 5) {
        throw new TypeError("Invalid path '" + pathString + "'");
      }
      return {
        root: allParts[1],
        dir: allParts[0].slice(0, -1),
        base: allParts[2],
        ext: allParts[4],
        name: allParts[3]
      };
    };
    if (isWindows)
      module2.exports = win32.parse;
    else
      module2.exports = posix.parse;
    module2.exports.posix = posix.parse;
    module2.exports.win32 = win32.parse;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/node-modules-paths.js
var require_node_modules_paths = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/node-modules-paths.js"(exports, module2) {
    var path = require("path");
    var parse = path.parse || require_path_parse();
    var getNodeModulesDirs = function getNodeModulesDirs2(absoluteStart, modules) {
      var prefix = "/";
      if (/^([A-Za-z]:)/.test(absoluteStart)) {
        prefix = "";
      } else if (/^\\\\/.test(absoluteStart)) {
        prefix = "\\\\";
      }
      var paths = [absoluteStart];
      var parsed = parse(absoluteStart);
      while (parsed.dir !== paths[paths.length - 1]) {
        paths.push(parsed.dir);
        parsed = parse(parsed.dir);
      }
      return paths.reduce(function(dirs, aPath) {
        return dirs.concat(modules.map(function(moduleDir) {
          return path.resolve(prefix, aPath, moduleDir);
        }));
      }, []);
    };
    module2.exports = function nodeModulesPaths(start, opts, request) {
      var modules = opts && opts.moduleDirectory ? [].concat(opts.moduleDirectory) : ["node_modules"];
      if (opts && typeof opts.paths === "function") {
        return opts.paths(
          request,
          start,
          function() {
            return getNodeModulesDirs(start, modules);
          },
          opts
        );
      }
      var dirs = getNodeModulesDirs(start, modules);
      return opts && opts.paths ? dirs.concat(opts.paths) : dirs;
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/normalize-options.js
var require_normalize_options = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/normalize-options.js"(exports, module2) {
    module2.exports = function(x, opts) {
      return opts || {};
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/function-bind@1.1.2/node_modules/function-bind/implementation.js
var require_implementation = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/function-bind@1.1.2/node_modules/function-bind/implementation.js"(exports, module2) {
    "use strict";
    var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
    var toStr = Object.prototype.toString;
    var max = Math.max;
    var funcType = "[object Function]";
    var concatty = function concatty2(a, b) {
      var arr = [];
      for (var i = 0; i < a.length; i += 1) {
        arr[i] = a[i];
      }
      for (var j = 0; j < b.length; j += 1) {
        arr[j + a.length] = b[j];
      }
      return arr;
    };
    var slicy = function slicy2(arrLike, offset) {
      var arr = [];
      for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
        arr[j] = arrLike[i];
      }
      return arr;
    };
    var joiny = function(arr, joiner) {
      var str = "";
      for (var i = 0; i < arr.length; i += 1) {
        str += arr[i];
        if (i + 1 < arr.length) {
          str += joiner;
        }
      }
      return str;
    };
    module2.exports = function bind(that) {
      var target = this;
      if (typeof target !== "function" || toStr.apply(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
      }
      var args = slicy(arguments, 1);
      var bound;
      var binder = function() {
        if (this instanceof bound) {
          var result = target.apply(
            this,
            concatty(args, arguments)
          );
          if (Object(result) === result) {
            return result;
          }
          return this;
        }
        return target.apply(
          that,
          concatty(args, arguments)
        );
      };
      var boundLength = max(0, target.length - args.length);
      var boundArgs = [];
      for (var i = 0; i < boundLength; i++) {
        boundArgs[i] = "$" + i;
      }
      bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
      if (target.prototype) {
        var Empty = function Empty2() {
        };
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
      }
      return bound;
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/function-bind@1.1.2/node_modules/function-bind/index.js
var require_function_bind = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/function-bind@1.1.2/node_modules/function-bind/index.js"(exports, module2) {
    "use strict";
    var implementation = require_implementation();
    module2.exports = Function.prototype.bind || implementation;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/hasown@2.0.2/node_modules/hasown/index.js
var require_hasown = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/hasown@2.0.2/node_modules/hasown/index.js"(exports, module2) {
    "use strict";
    var call = Function.prototype.call;
    var $hasOwn = Object.prototype.hasOwnProperty;
    var bind = require_function_bind();
    module2.exports = bind.call(call, $hasOwn);
  }
});

// ../../../common/temp/default/node_modules/.pnpm/is-core-module@2.13.1/node_modules/is-core-module/core.json
var require_core = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/is-core-module@2.13.1/node_modules/is-core-module/core.json"(exports, module2) {
    module2.exports = {
      assert: true,
      "node:assert": [">= 14.18 && < 15", ">= 16"],
      "assert/strict": ">= 15",
      "node:assert/strict": ">= 16",
      async_hooks: ">= 8",
      "node:async_hooks": [">= 14.18 && < 15", ">= 16"],
      buffer_ieee754: ">= 0.5 && < 0.9.7",
      buffer: true,
      "node:buffer": [">= 14.18 && < 15", ">= 16"],
      child_process: true,
      "node:child_process": [">= 14.18 && < 15", ">= 16"],
      cluster: ">= 0.5",
      "node:cluster": [">= 14.18 && < 15", ">= 16"],
      console: true,
      "node:console": [">= 14.18 && < 15", ">= 16"],
      constants: true,
      "node:constants": [">= 14.18 && < 15", ">= 16"],
      crypto: true,
      "node:crypto": [">= 14.18 && < 15", ">= 16"],
      _debug_agent: ">= 1 && < 8",
      _debugger: "< 8",
      dgram: true,
      "node:dgram": [">= 14.18 && < 15", ">= 16"],
      diagnostics_channel: [">= 14.17 && < 15", ">= 15.1"],
      "node:diagnostics_channel": [">= 14.18 && < 15", ">= 16"],
      dns: true,
      "node:dns": [">= 14.18 && < 15", ">= 16"],
      "dns/promises": ">= 15",
      "node:dns/promises": ">= 16",
      domain: ">= 0.7.12",
      "node:domain": [">= 14.18 && < 15", ">= 16"],
      events: true,
      "node:events": [">= 14.18 && < 15", ">= 16"],
      freelist: "< 6",
      fs: true,
      "node:fs": [">= 14.18 && < 15", ">= 16"],
      "fs/promises": [">= 10 && < 10.1", ">= 14"],
      "node:fs/promises": [">= 14.18 && < 15", ">= 16"],
      _http_agent: ">= 0.11.1",
      "node:_http_agent": [">= 14.18 && < 15", ">= 16"],
      _http_client: ">= 0.11.1",
      "node:_http_client": [">= 14.18 && < 15", ">= 16"],
      _http_common: ">= 0.11.1",
      "node:_http_common": [">= 14.18 && < 15", ">= 16"],
      _http_incoming: ">= 0.11.1",
      "node:_http_incoming": [">= 14.18 && < 15", ">= 16"],
      _http_outgoing: ">= 0.11.1",
      "node:_http_outgoing": [">= 14.18 && < 15", ">= 16"],
      _http_server: ">= 0.11.1",
      "node:_http_server": [">= 14.18 && < 15", ">= 16"],
      http: true,
      "node:http": [">= 14.18 && < 15", ">= 16"],
      http2: ">= 8.8",
      "node:http2": [">= 14.18 && < 15", ">= 16"],
      https: true,
      "node:https": [">= 14.18 && < 15", ">= 16"],
      inspector: ">= 8",
      "node:inspector": [">= 14.18 && < 15", ">= 16"],
      "inspector/promises": [">= 19"],
      "node:inspector/promises": [">= 19"],
      _linklist: "< 8",
      module: true,
      "node:module": [">= 14.18 && < 15", ">= 16"],
      net: true,
      "node:net": [">= 14.18 && < 15", ">= 16"],
      "node-inspect/lib/_inspect": ">= 7.6 && < 12",
      "node-inspect/lib/internal/inspect_client": ">= 7.6 && < 12",
      "node-inspect/lib/internal/inspect_repl": ">= 7.6 && < 12",
      os: true,
      "node:os": [">= 14.18 && < 15", ">= 16"],
      path: true,
      "node:path": [">= 14.18 && < 15", ">= 16"],
      "path/posix": ">= 15.3",
      "node:path/posix": ">= 16",
      "path/win32": ">= 15.3",
      "node:path/win32": ">= 16",
      perf_hooks: ">= 8.5",
      "node:perf_hooks": [">= 14.18 && < 15", ">= 16"],
      process: ">= 1",
      "node:process": [">= 14.18 && < 15", ">= 16"],
      punycode: ">= 0.5",
      "node:punycode": [">= 14.18 && < 15", ">= 16"],
      querystring: true,
      "node:querystring": [">= 14.18 && < 15", ">= 16"],
      readline: true,
      "node:readline": [">= 14.18 && < 15", ">= 16"],
      "readline/promises": ">= 17",
      "node:readline/promises": ">= 17",
      repl: true,
      "node:repl": [">= 14.18 && < 15", ">= 16"],
      smalloc: ">= 0.11.5 && < 3",
      _stream_duplex: ">= 0.9.4",
      "node:_stream_duplex": [">= 14.18 && < 15", ">= 16"],
      _stream_transform: ">= 0.9.4",
      "node:_stream_transform": [">= 14.18 && < 15", ">= 16"],
      _stream_wrap: ">= 1.4.1",
      "node:_stream_wrap": [">= 14.18 && < 15", ">= 16"],
      _stream_passthrough: ">= 0.9.4",
      "node:_stream_passthrough": [">= 14.18 && < 15", ">= 16"],
      _stream_readable: ">= 0.9.4",
      "node:_stream_readable": [">= 14.18 && < 15", ">= 16"],
      _stream_writable: ">= 0.9.4",
      "node:_stream_writable": [">= 14.18 && < 15", ">= 16"],
      stream: true,
      "node:stream": [">= 14.18 && < 15", ">= 16"],
      "stream/consumers": ">= 16.7",
      "node:stream/consumers": ">= 16.7",
      "stream/promises": ">= 15",
      "node:stream/promises": ">= 16",
      "stream/web": ">= 16.5",
      "node:stream/web": ">= 16.5",
      string_decoder: true,
      "node:string_decoder": [">= 14.18 && < 15", ">= 16"],
      sys: [">= 0.4 && < 0.7", ">= 0.8"],
      "node:sys": [">= 14.18 && < 15", ">= 16"],
      "test/reporters": ">= 19.9 && < 20.2",
      "node:test/reporters": [">= 18.17 && < 19", ">= 19.9", ">= 20"],
      "node:test": [">= 16.17 && < 17", ">= 18"],
      timers: true,
      "node:timers": [">= 14.18 && < 15", ">= 16"],
      "timers/promises": ">= 15",
      "node:timers/promises": ">= 16",
      _tls_common: ">= 0.11.13",
      "node:_tls_common": [">= 14.18 && < 15", ">= 16"],
      _tls_legacy: ">= 0.11.3 && < 10",
      _tls_wrap: ">= 0.11.3",
      "node:_tls_wrap": [">= 14.18 && < 15", ">= 16"],
      tls: true,
      "node:tls": [">= 14.18 && < 15", ">= 16"],
      trace_events: ">= 10",
      "node:trace_events": [">= 14.18 && < 15", ">= 16"],
      tty: true,
      "node:tty": [">= 14.18 && < 15", ">= 16"],
      url: true,
      "node:url": [">= 14.18 && < 15", ">= 16"],
      util: true,
      "node:util": [">= 14.18 && < 15", ">= 16"],
      "util/types": ">= 15.3",
      "node:util/types": ">= 16",
      "v8/tools/arguments": ">= 10 && < 12",
      "v8/tools/codemap": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/consarray": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/csvparser": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/logreader": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/profile_view": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/splaytree": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      v8: ">= 1",
      "node:v8": [">= 14.18 && < 15", ">= 16"],
      vm: true,
      "node:vm": [">= 14.18 && < 15", ">= 16"],
      wasi: [">= 13.4 && < 13.5", ">= 18.17 && < 19", ">= 20"],
      "node:wasi": [">= 18.17 && < 19", ">= 20"],
      worker_threads: ">= 11.7",
      "node:worker_threads": [">= 14.18 && < 15", ">= 16"],
      zlib: ">= 0.5",
      "node:zlib": [">= 14.18 && < 15", ">= 16"]
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/is-core-module@2.13.1/node_modules/is-core-module/index.js
var require_is_core_module = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/is-core-module@2.13.1/node_modules/is-core-module/index.js"(exports, module2) {
    "use strict";
    var hasOwn = require_hasown();
    function specifierIncluded(current, specifier) {
      var nodeParts = current.split(".");
      var parts = specifier.split(" ");
      var op = parts.length > 1 ? parts[0] : "=";
      var versionParts = (parts.length > 1 ? parts[1] : parts[0]).split(".");
      for (var i = 0; i < 3; ++i) {
        var cur = parseInt(nodeParts[i] || 0, 10);
        var ver = parseInt(versionParts[i] || 0, 10);
        if (cur === ver) {
          continue;
        }
        if (op === "<") {
          return cur < ver;
        }
        if (op === ">=") {
          return cur >= ver;
        }
        return false;
      }
      return op === ">=";
    }
    function matchesRange(current, range) {
      var specifiers = range.split(/ ?&& ?/);
      if (specifiers.length === 0) {
        return false;
      }
      for (var i = 0; i < specifiers.length; ++i) {
        if (!specifierIncluded(current, specifiers[i])) {
          return false;
        }
      }
      return true;
    }
    function versionIncluded(nodeVersion, specifierValue) {
      if (typeof specifierValue === "boolean") {
        return specifierValue;
      }
      var current = typeof nodeVersion === "undefined" ? process.versions && process.versions.node : nodeVersion;
      if (typeof current !== "string") {
        throw new TypeError(typeof nodeVersion === "undefined" ? "Unable to determine current node version" : "If provided, a valid node version is required");
      }
      if (specifierValue && typeof specifierValue === "object") {
        for (var i = 0; i < specifierValue.length; ++i) {
          if (matchesRange(current, specifierValue[i])) {
            return true;
          }
        }
        return false;
      }
      return matchesRange(current, specifierValue);
    }
    var data = require_core();
    module2.exports = function isCore(x, nodeVersion) {
      return hasOwn(data, x) && versionIncluded(nodeVersion, data[x]);
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/async.js
var require_async = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/async.js"(exports, module2) {
    var fs = require("fs");
    var getHomedir = require_homedir();
    var path = require("path");
    var caller = require_caller();
    var nodeModulesPaths = require_node_modules_paths();
    var normalizeOptions = require_normalize_options();
    var isCore = require_is_core_module();
    var realpathFS = process.platform !== "win32" && fs.realpath && typeof fs.realpath.native === "function" ? fs.realpath.native : fs.realpath;
    var homedir = getHomedir();
    var defaultPaths = function() {
      return [
        path.join(homedir, ".node_modules"),
        path.join(homedir, ".node_libraries")
      ];
    };
    var defaultIsFile = function isFile(file, cb) {
      fs.stat(file, function(err, stat) {
        if (!err) {
          return cb(null, stat.isFile() || stat.isFIFO());
        }
        if (err.code === "ENOENT" || err.code === "ENOTDIR")
          return cb(null, false);
        return cb(err);
      });
    };
    var defaultIsDir = function isDirectory(dir, cb) {
      fs.stat(dir, function(err, stat) {
        if (!err) {
          return cb(null, stat.isDirectory());
        }
        if (err.code === "ENOENT" || err.code === "ENOTDIR")
          return cb(null, false);
        return cb(err);
      });
    };
    var defaultRealpath = function realpath(x, cb) {
      realpathFS(x, function(realpathErr, realPath) {
        if (realpathErr && realpathErr.code !== "ENOENT")
          cb(realpathErr);
        else
          cb(null, realpathErr ? x : realPath);
      });
    };
    var maybeRealpath = function maybeRealpath2(realpath, x, opts, cb) {
      if (opts && opts.preserveSymlinks === false) {
        realpath(x, cb);
      } else {
        cb(null, x);
      }
    };
    var defaultReadPackage = function defaultReadPackage2(readFile, pkgfile, cb) {
      readFile(pkgfile, function(readFileErr, body) {
        if (readFileErr)
          cb(readFileErr);
        else {
          try {
            var pkg = JSON.parse(body);
            cb(null, pkg);
          } catch (jsonErr) {
            cb(null);
          }
        }
      });
    };
    var getPackageCandidates = function getPackageCandidates2(x, start, opts) {
      var dirs = nodeModulesPaths(start, opts, x);
      for (var i = 0; i < dirs.length; i++) {
        dirs[i] = path.join(dirs[i], x);
      }
      return dirs;
    };
    module2.exports = function resolve(x, options, callback) {
      var cb = callback;
      var opts = options;
      if (typeof options === "function") {
        cb = opts;
        opts = {};
      }
      if (typeof x !== "string") {
        var err = new TypeError("Path must be a string.");
        return process.nextTick(function() {
          cb(err);
        });
      }
      opts = normalizeOptions(x, opts);
      var isFile = opts.isFile || defaultIsFile;
      var isDirectory = opts.isDirectory || defaultIsDir;
      var readFile = opts.readFile || fs.readFile;
      var realpath = opts.realpath || defaultRealpath;
      var readPackage = opts.readPackage || defaultReadPackage;
      if (opts.readFile && opts.readPackage) {
        var conflictErr = new TypeError("`readFile` and `readPackage` are mutually exclusive.");
        return process.nextTick(function() {
          cb(conflictErr);
        });
      }
      var packageIterator = opts.packageIterator;
      var extensions = opts.extensions || [".js"];
      var includeCoreModules = opts.includeCoreModules !== false;
      var basedir = opts.basedir || path.dirname(caller());
      var parent = opts.filename || basedir;
      opts.paths = opts.paths || defaultPaths();
      var absoluteStart = path.resolve(basedir);
      maybeRealpath(
        realpath,
        absoluteStart,
        opts,
        function(err2, realStart) {
          if (err2)
            cb(err2);
          else
            init(realStart);
        }
      );
      var res;
      function init(basedir2) {
        if (/^(?:\.\.?(?:\/|$)|\/|([A-Za-z]:)?[/\\])/.test(x)) {
          res = path.resolve(basedir2, x);
          if (x === "." || x === ".." || x.slice(-1) === "/")
            res += "/";
          if (/\/$/.test(x) && res === basedir2) {
            loadAsDirectory(res, opts.package, onfile);
          } else
            loadAsFile(res, opts.package, onfile);
        } else if (includeCoreModules && isCore(x)) {
          return cb(null, x);
        } else
          loadNodeModules(x, basedir2, function(err2, n, pkg) {
            if (err2)
              cb(err2);
            else if (n) {
              return maybeRealpath(realpath, n, opts, function(err3, realN) {
                if (err3) {
                  cb(err3);
                } else {
                  cb(null, realN, pkg);
                }
              });
            } else {
              var moduleError = new Error("Cannot find module '" + x + "' from '" + parent + "'");
              moduleError.code = "MODULE_NOT_FOUND";
              cb(moduleError);
            }
          });
      }
      function onfile(err2, m, pkg) {
        if (err2)
          cb(err2);
        else if (m)
          cb(null, m, pkg);
        else
          loadAsDirectory(res, function(err3, d, pkg2) {
            if (err3)
              cb(err3);
            else if (d) {
              maybeRealpath(realpath, d, opts, function(err4, realD) {
                if (err4) {
                  cb(err4);
                } else {
                  cb(null, realD, pkg2);
                }
              });
            } else {
              var moduleError = new Error("Cannot find module '" + x + "' from '" + parent + "'");
              moduleError.code = "MODULE_NOT_FOUND";
              cb(moduleError);
            }
          });
      }
      function loadAsFile(x2, thePackage, callback2) {
        var loadAsFilePackage = thePackage;
        var cb2 = callback2;
        if (typeof loadAsFilePackage === "function") {
          cb2 = loadAsFilePackage;
          loadAsFilePackage = void 0;
        }
        var exts = [""].concat(extensions);
        load(exts, x2, loadAsFilePackage);
        function load(exts2, x3, loadPackage) {
          if (exts2.length === 0)
            return cb2(null, void 0, loadPackage);
          var file = x3 + exts2[0];
          var pkg = loadPackage;
          if (pkg)
            onpkg(null, pkg);
          else
            loadpkg(path.dirname(file), onpkg);
          function onpkg(err2, pkg_, dir) {
            pkg = pkg_;
            if (err2)
              return cb2(err2);
            if (dir && pkg && opts.pathFilter) {
              var rfile = path.relative(dir, file);
              var rel = rfile.slice(0, rfile.length - exts2[0].length);
              var r = opts.pathFilter(pkg, x3, rel);
              if (r)
                return load(
                  [""].concat(extensions.slice()),
                  path.resolve(dir, r),
                  pkg
                );
            }
            isFile(file, onex);
          }
          function onex(err2, ex) {
            if (err2)
              return cb2(err2);
            if (ex)
              return cb2(null, file, pkg);
            load(exts2.slice(1), x3, pkg);
          }
        }
      }
      function loadpkg(dir, cb2) {
        if (dir === "" || dir === "/")
          return cb2(null);
        if (process.platform === "win32" && /^\w:[/\\]*$/.test(dir)) {
          return cb2(null);
        }
        if (/[/\\]node_modules[/\\]*$/.test(dir))
          return cb2(null);
        maybeRealpath(realpath, dir, opts, function(unwrapErr, pkgdir) {
          if (unwrapErr)
            return loadpkg(path.dirname(dir), cb2);
          var pkgfile = path.join(pkgdir, "package.json");
          isFile(pkgfile, function(err2, ex) {
            if (!ex)
              return loadpkg(path.dirname(dir), cb2);
            readPackage(readFile, pkgfile, function(err3, pkgParam) {
              if (err3)
                cb2(err3);
              var pkg = pkgParam;
              if (pkg && opts.packageFilter) {
                pkg = opts.packageFilter(pkg, pkgfile);
              }
              cb2(null, pkg, dir);
            });
          });
        });
      }
      function loadAsDirectory(x2, loadAsDirectoryPackage, callback2) {
        var cb2 = callback2;
        var fpkg = loadAsDirectoryPackage;
        if (typeof fpkg === "function") {
          cb2 = fpkg;
          fpkg = opts.package;
        }
        maybeRealpath(realpath, x2, opts, function(unwrapErr, pkgdir) {
          if (unwrapErr)
            return cb2(unwrapErr);
          var pkgfile = path.join(pkgdir, "package.json");
          isFile(pkgfile, function(err2, ex) {
            if (err2)
              return cb2(err2);
            if (!ex)
              return loadAsFile(path.join(x2, "index"), fpkg, cb2);
            readPackage(readFile, pkgfile, function(err3, pkgParam) {
              if (err3)
                return cb2(err3);
              var pkg = pkgParam;
              if (pkg && opts.packageFilter) {
                pkg = opts.packageFilter(pkg, pkgfile);
              }
              if (pkg && pkg.main) {
                if (typeof pkg.main !== "string") {
                  var mainError = new TypeError("package \u201C" + pkg.name + "\u201D `main` must be a string");
                  mainError.code = "INVALID_PACKAGE_MAIN";
                  return cb2(mainError);
                }
                if (pkg.main === "." || pkg.main === "./") {
                  pkg.main = "index";
                }
                loadAsFile(path.resolve(x2, pkg.main), pkg, function(err4, m, pkg2) {
                  if (err4)
                    return cb2(err4);
                  if (m)
                    return cb2(null, m, pkg2);
                  if (!pkg2)
                    return loadAsFile(path.join(x2, "index"), pkg2, cb2);
                  var dir = path.resolve(x2, pkg2.main);
                  loadAsDirectory(dir, pkg2, function(err5, n, pkg3) {
                    if (err5)
                      return cb2(err5);
                    if (n)
                      return cb2(null, n, pkg3);
                    loadAsFile(path.join(x2, "index"), pkg3, cb2);
                  });
                });
                return;
              }
              loadAsFile(path.join(x2, "/index"), pkg, cb2);
            });
          });
        });
      }
      function processDirs(cb2, dirs) {
        if (dirs.length === 0)
          return cb2(null, void 0);
        var dir = dirs[0];
        isDirectory(path.dirname(dir), isdir);
        function isdir(err2, isdir2) {
          if (err2)
            return cb2(err2);
          if (!isdir2)
            return processDirs(cb2, dirs.slice(1));
          loadAsFile(dir, opts.package, onfile2);
        }
        function onfile2(err2, m, pkg) {
          if (err2)
            return cb2(err2);
          if (m)
            return cb2(null, m, pkg);
          loadAsDirectory(dir, opts.package, ondir);
        }
        function ondir(err2, n, pkg) {
          if (err2)
            return cb2(err2);
          if (n)
            return cb2(null, n, pkg);
          processDirs(cb2, dirs.slice(1));
        }
      }
      function loadNodeModules(x2, start, cb2) {
        var thunk = function() {
          return getPackageCandidates(x2, start, opts);
        };
        processDirs(
          cb2,
          packageIterator ? packageIterator(x2, start, thunk, opts) : thunk()
        );
      }
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/core.json
var require_core2 = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/core.json"(exports, module2) {
    module2.exports = {
      assert: true,
      "node:assert": [">= 14.18 && < 15", ">= 16"],
      "assert/strict": ">= 15",
      "node:assert/strict": ">= 16",
      async_hooks: ">= 8",
      "node:async_hooks": [">= 14.18 && < 15", ">= 16"],
      buffer_ieee754: ">= 0.5 && < 0.9.7",
      buffer: true,
      "node:buffer": [">= 14.18 && < 15", ">= 16"],
      child_process: true,
      "node:child_process": [">= 14.18 && < 15", ">= 16"],
      cluster: ">= 0.5",
      "node:cluster": [">= 14.18 && < 15", ">= 16"],
      console: true,
      "node:console": [">= 14.18 && < 15", ">= 16"],
      constants: true,
      "node:constants": [">= 14.18 && < 15", ">= 16"],
      crypto: true,
      "node:crypto": [">= 14.18 && < 15", ">= 16"],
      _debug_agent: ">= 1 && < 8",
      _debugger: "< 8",
      dgram: true,
      "node:dgram": [">= 14.18 && < 15", ">= 16"],
      diagnostics_channel: [">= 14.17 && < 15", ">= 15.1"],
      "node:diagnostics_channel": [">= 14.18 && < 15", ">= 16"],
      dns: true,
      "node:dns": [">= 14.18 && < 15", ">= 16"],
      "dns/promises": ">= 15",
      "node:dns/promises": ">= 16",
      domain: ">= 0.7.12",
      "node:domain": [">= 14.18 && < 15", ">= 16"],
      events: true,
      "node:events": [">= 14.18 && < 15", ">= 16"],
      freelist: "< 6",
      fs: true,
      "node:fs": [">= 14.18 && < 15", ">= 16"],
      "fs/promises": [">= 10 && < 10.1", ">= 14"],
      "node:fs/promises": [">= 14.18 && < 15", ">= 16"],
      _http_agent: ">= 0.11.1",
      "node:_http_agent": [">= 14.18 && < 15", ">= 16"],
      _http_client: ">= 0.11.1",
      "node:_http_client": [">= 14.18 && < 15", ">= 16"],
      _http_common: ">= 0.11.1",
      "node:_http_common": [">= 14.18 && < 15", ">= 16"],
      _http_incoming: ">= 0.11.1",
      "node:_http_incoming": [">= 14.18 && < 15", ">= 16"],
      _http_outgoing: ">= 0.11.1",
      "node:_http_outgoing": [">= 14.18 && < 15", ">= 16"],
      _http_server: ">= 0.11.1",
      "node:_http_server": [">= 14.18 && < 15", ">= 16"],
      http: true,
      "node:http": [">= 14.18 && < 15", ">= 16"],
      http2: ">= 8.8",
      "node:http2": [">= 14.18 && < 15", ">= 16"],
      https: true,
      "node:https": [">= 14.18 && < 15", ">= 16"],
      inspector: ">= 8",
      "node:inspector": [">= 14.18 && < 15", ">= 16"],
      "inspector/promises": [">= 19"],
      "node:inspector/promises": [">= 19"],
      _linklist: "< 8",
      module: true,
      "node:module": [">= 14.18 && < 15", ">= 16"],
      net: true,
      "node:net": [">= 14.18 && < 15", ">= 16"],
      "node-inspect/lib/_inspect": ">= 7.6 && < 12",
      "node-inspect/lib/internal/inspect_client": ">= 7.6 && < 12",
      "node-inspect/lib/internal/inspect_repl": ">= 7.6 && < 12",
      os: true,
      "node:os": [">= 14.18 && < 15", ">= 16"],
      path: true,
      "node:path": [">= 14.18 && < 15", ">= 16"],
      "path/posix": ">= 15.3",
      "node:path/posix": ">= 16",
      "path/win32": ">= 15.3",
      "node:path/win32": ">= 16",
      perf_hooks: ">= 8.5",
      "node:perf_hooks": [">= 14.18 && < 15", ">= 16"],
      process: ">= 1",
      "node:process": [">= 14.18 && < 15", ">= 16"],
      punycode: ">= 0.5",
      "node:punycode": [">= 14.18 && < 15", ">= 16"],
      querystring: true,
      "node:querystring": [">= 14.18 && < 15", ">= 16"],
      readline: true,
      "node:readline": [">= 14.18 && < 15", ">= 16"],
      "readline/promises": ">= 17",
      "node:readline/promises": ">= 17",
      repl: true,
      "node:repl": [">= 14.18 && < 15", ">= 16"],
      smalloc: ">= 0.11.5 && < 3",
      _stream_duplex: ">= 0.9.4",
      "node:_stream_duplex": [">= 14.18 && < 15", ">= 16"],
      _stream_transform: ">= 0.9.4",
      "node:_stream_transform": [">= 14.18 && < 15", ">= 16"],
      _stream_wrap: ">= 1.4.1",
      "node:_stream_wrap": [">= 14.18 && < 15", ">= 16"],
      _stream_passthrough: ">= 0.9.4",
      "node:_stream_passthrough": [">= 14.18 && < 15", ">= 16"],
      _stream_readable: ">= 0.9.4",
      "node:_stream_readable": [">= 14.18 && < 15", ">= 16"],
      _stream_writable: ">= 0.9.4",
      "node:_stream_writable": [">= 14.18 && < 15", ">= 16"],
      stream: true,
      "node:stream": [">= 14.18 && < 15", ">= 16"],
      "stream/consumers": ">= 16.7",
      "node:stream/consumers": ">= 16.7",
      "stream/promises": ">= 15",
      "node:stream/promises": ">= 16",
      "stream/web": ">= 16.5",
      "node:stream/web": ">= 16.5",
      string_decoder: true,
      "node:string_decoder": [">= 14.18 && < 15", ">= 16"],
      sys: [">= 0.4 && < 0.7", ">= 0.8"],
      "node:sys": [">= 14.18 && < 15", ">= 16"],
      "test/reporters": ">= 19.9 && < 20.2",
      "node:test/reporters": [">= 18.17 && < 19", ">= 19.9", ">= 20"],
      "node:test": [">= 16.17 && < 17", ">= 18"],
      timers: true,
      "node:timers": [">= 14.18 && < 15", ">= 16"],
      "timers/promises": ">= 15",
      "node:timers/promises": ">= 16",
      _tls_common: ">= 0.11.13",
      "node:_tls_common": [">= 14.18 && < 15", ">= 16"],
      _tls_legacy: ">= 0.11.3 && < 10",
      _tls_wrap: ">= 0.11.3",
      "node:_tls_wrap": [">= 14.18 && < 15", ">= 16"],
      tls: true,
      "node:tls": [">= 14.18 && < 15", ">= 16"],
      trace_events: ">= 10",
      "node:trace_events": [">= 14.18 && < 15", ">= 16"],
      tty: true,
      "node:tty": [">= 14.18 && < 15", ">= 16"],
      url: true,
      "node:url": [">= 14.18 && < 15", ">= 16"],
      util: true,
      "node:util": [">= 14.18 && < 15", ">= 16"],
      "util/types": ">= 15.3",
      "node:util/types": ">= 16",
      "v8/tools/arguments": ">= 10 && < 12",
      "v8/tools/codemap": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/consarray": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/csvparser": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/logreader": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/profile_view": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/splaytree": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      v8: ">= 1",
      "node:v8": [">= 14.18 && < 15", ">= 16"],
      vm: true,
      "node:vm": [">= 14.18 && < 15", ">= 16"],
      wasi: [">= 13.4 && < 13.5", ">= 18.17 && < 19", ">= 20"],
      "node:wasi": [">= 18.17 && < 19", ">= 20"],
      worker_threads: ">= 11.7",
      "node:worker_threads": [">= 14.18 && < 15", ">= 16"],
      zlib: ">= 0.5",
      "node:zlib": [">= 14.18 && < 15", ">= 16"]
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/core.js
var require_core3 = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/core.js"(exports, module2) {
    "use strict";
    var isCoreModule = require_is_core_module();
    var data = require_core2();
    var core = {};
    for (mod in data) {
      if (Object.prototype.hasOwnProperty.call(data, mod)) {
        core[mod] = isCoreModule(mod);
      }
    }
    var mod;
    module2.exports = core;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/is-core.js
var require_is_core = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/is-core.js"(exports, module2) {
    var isCoreModule = require_is_core_module();
    module2.exports = function isCore(x) {
      return isCoreModule(x);
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/sync.js
var require_sync = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/sync.js"(exports, module2) {
    var isCore = require_is_core_module();
    var fs = require("fs");
    var path = require("path");
    var getHomedir = require_homedir();
    var caller = require_caller();
    var nodeModulesPaths = require_node_modules_paths();
    var normalizeOptions = require_normalize_options();
    var realpathFS = process.platform !== "win32" && fs.realpathSync && typeof fs.realpathSync.native === "function" ? fs.realpathSync.native : fs.realpathSync;
    var homedir = getHomedir();
    var defaultPaths = function() {
      return [
        path.join(homedir, ".node_modules"),
        path.join(homedir, ".node_libraries")
      ];
    };
    var defaultIsFile = function isFile(file) {
      try {
        var stat = fs.statSync(file, { throwIfNoEntry: false });
      } catch (e) {
        if (e && (e.code === "ENOENT" || e.code === "ENOTDIR"))
          return false;
        throw e;
      }
      return !!stat && (stat.isFile() || stat.isFIFO());
    };
    var defaultIsDir = function isDirectory(dir) {
      try {
        var stat = fs.statSync(dir, { throwIfNoEntry: false });
      } catch (e) {
        if (e && (e.code === "ENOENT" || e.code === "ENOTDIR"))
          return false;
        throw e;
      }
      return !!stat && stat.isDirectory();
    };
    var defaultRealpathSync = function realpathSync(x) {
      try {
        return realpathFS(x);
      } catch (realpathErr) {
        if (realpathErr.code !== "ENOENT") {
          throw realpathErr;
        }
      }
      return x;
    };
    var maybeRealpathSync = function maybeRealpathSync2(realpathSync, x, opts) {
      if (opts && opts.preserveSymlinks === false) {
        return realpathSync(x);
      }
      return x;
    };
    var defaultReadPackageSync = function defaultReadPackageSync2(readFileSync, pkgfile) {
      var body = readFileSync(pkgfile);
      try {
        var pkg = JSON.parse(body);
        return pkg;
      } catch (jsonErr) {
      }
    };
    var getPackageCandidates = function getPackageCandidates2(x, start, opts) {
      var dirs = nodeModulesPaths(start, opts, x);
      for (var i = 0; i < dirs.length; i++) {
        dirs[i] = path.join(dirs[i], x);
      }
      return dirs;
    };
    module2.exports = function resolveSync(x, options) {
      if (typeof x !== "string") {
        throw new TypeError("Path must be a string.");
      }
      var opts = normalizeOptions(x, options);
      var isFile = opts.isFile || defaultIsFile;
      var readFileSync = opts.readFileSync || fs.readFileSync;
      var isDirectory = opts.isDirectory || defaultIsDir;
      var realpathSync = opts.realpathSync || defaultRealpathSync;
      var readPackageSync = opts.readPackageSync || defaultReadPackageSync;
      if (opts.readFileSync && opts.readPackageSync) {
        throw new TypeError("`readFileSync` and `readPackageSync` are mutually exclusive.");
      }
      var packageIterator = opts.packageIterator;
      var extensions = opts.extensions || [".js"];
      var includeCoreModules = opts.includeCoreModules !== false;
      var basedir = opts.basedir || path.dirname(caller());
      var parent = opts.filename || basedir;
      opts.paths = opts.paths || defaultPaths();
      var absoluteStart = maybeRealpathSync(realpathSync, path.resolve(basedir), opts);
      if (/^(?:\.\.?(?:\/|$)|\/|([A-Za-z]:)?[/\\])/.test(x)) {
        var res = path.resolve(absoluteStart, x);
        if (x === "." || x === ".." || x.slice(-1) === "/")
          res += "/";
        var m = loadAsFileSync(res) || loadAsDirectorySync(res);
        if (m)
          return maybeRealpathSync(realpathSync, m, opts);
      } else if (includeCoreModules && isCore(x)) {
        return x;
      } else {
        var n = loadNodeModulesSync(x, absoluteStart);
        if (n)
          return maybeRealpathSync(realpathSync, n, opts);
      }
      var err = new Error("Cannot find module '" + x + "' from '" + parent + "'");
      err.code = "MODULE_NOT_FOUND";
      throw err;
      function loadAsFileSync(x2) {
        var pkg = loadpkg(path.dirname(x2));
        if (pkg && pkg.dir && pkg.pkg && opts.pathFilter) {
          var rfile = path.relative(pkg.dir, x2);
          var r = opts.pathFilter(pkg.pkg, x2, rfile);
          if (r) {
            x2 = path.resolve(pkg.dir, r);
          }
        }
        if (isFile(x2)) {
          return x2;
        }
        for (var i = 0; i < extensions.length; i++) {
          var file = x2 + extensions[i];
          if (isFile(file)) {
            return file;
          }
        }
      }
      function loadpkg(dir) {
        if (dir === "" || dir === "/")
          return;
        if (process.platform === "win32" && /^\w:[/\\]*$/.test(dir)) {
          return;
        }
        if (/[/\\]node_modules[/\\]*$/.test(dir))
          return;
        var pkgfile = path.join(maybeRealpathSync(realpathSync, dir, opts), "package.json");
        if (!isFile(pkgfile)) {
          return loadpkg(path.dirname(dir));
        }
        var pkg = readPackageSync(readFileSync, pkgfile);
        if (pkg && opts.packageFilter) {
          pkg = opts.packageFilter(pkg, dir);
        }
        return { pkg, dir };
      }
      function loadAsDirectorySync(x2) {
        var pkgfile = path.join(maybeRealpathSync(realpathSync, x2, opts), "/package.json");
        if (isFile(pkgfile)) {
          try {
            var pkg = readPackageSync(readFileSync, pkgfile);
          } catch (e) {
          }
          if (pkg && opts.packageFilter) {
            pkg = opts.packageFilter(pkg, x2);
          }
          if (pkg && pkg.main) {
            if (typeof pkg.main !== "string") {
              var mainError = new TypeError("package \u201C" + pkg.name + "\u201D `main` must be a string");
              mainError.code = "INVALID_PACKAGE_MAIN";
              throw mainError;
            }
            if (pkg.main === "." || pkg.main === "./") {
              pkg.main = "index";
            }
            try {
              var m2 = loadAsFileSync(path.resolve(x2, pkg.main));
              if (m2)
                return m2;
              var n2 = loadAsDirectorySync(path.resolve(x2, pkg.main));
              if (n2)
                return n2;
            } catch (e) {
            }
          }
        }
        return loadAsFileSync(path.join(x2, "/index"));
      }
      function loadNodeModulesSync(x2, start) {
        var thunk = function() {
          return getPackageCandidates(x2, start, opts);
        };
        var dirs = packageIterator ? packageIterator(x2, start, thunk, opts) : thunk();
        for (var i = 0; i < dirs.length; i++) {
          var dir = dirs[i];
          if (isDirectory(path.dirname(dir))) {
            var m2 = loadAsFileSync(dir);
            if (m2)
              return m2;
            var n2 = loadAsDirectorySync(dir);
            if (n2)
              return n2;
          }
        }
      }
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/index.js
var require_resolve = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/index.js"(exports, module2) {
    var async = require_async();
    async.core = require_core3();
    async.isCore = require_is_core();
    async.sync = require_sync();
    module2.exports = async;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/jju@1.4.0/node_modules/jju/lib/unicode.js
var require_unicode = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/jju@1.4.0/node_modules/jju/lib/unicode.js"(exports, module2) {
    var Uni = module2.exports;
    module2.exports.isWhiteSpace = function isWhiteSpace(x) {
      return x === " " || x === "\xA0" || x === "\uFEFF" || x >= "	" && x <= "\r" || x === "\u1680" || x >= "\u2000" && x <= "\u200A" || x === "\u2028" || x === "\u2029" || x === "\u202F" || x === "\u205F" || x === "\u3000";
    };
    module2.exports.isWhiteSpaceJSON = function isWhiteSpaceJSON(x) {
      return x === " " || x === "	" || x === "\n" || x === "\r";
    };
    module2.exports.isLineTerminator = function isLineTerminator(x) {
      return x === "\n" || x === "\r" || x === "\u2028" || x === "\u2029";
    };
    module2.exports.isLineTerminatorJSON = function isLineTerminatorJSON(x) {
      return x === "\n" || x === "\r";
    };
    module2.exports.isIdentifierStart = function isIdentifierStart(x) {
      return x === "$" || x === "_" || x >= "A" && x <= "Z" || x >= "a" && x <= "z" || x >= "\x80" && Uni.NonAsciiIdentifierStart.test(x);
    };
    module2.exports.isIdentifierPart = function isIdentifierPart(x) {
      return x === "$" || x === "_" || x >= "A" && x <= "Z" || x >= "a" && x <= "z" || x >= "0" && x <= "9" || x >= "\x80" && Uni.NonAsciiIdentifierPart.test(x);
    };
    module2.exports.NonAsciiIdentifierStart = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/;
    module2.exports.NonAsciiIdentifierPart = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0\u08A2-\u08AC\u08E4-\u08FE\u0900-\u0963\u0966-\u096F\u0971-\u0977\u0979-\u097F\u0981-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C01-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C82\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D02\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191C\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1D00-\u1DE6\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA697\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7B\uAA80-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE26\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/jju@1.4.0/node_modules/jju/lib/parse.js
var require_parse = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/jju@1.4.0/node_modules/jju/lib/parse.js"(exports, module2) {
    var Uni = require_unicode();
    function isHexDigit(x) {
      return x >= "0" && x <= "9" || x >= "A" && x <= "F" || x >= "a" && x <= "f";
    }
    function isOctDigit(x) {
      return x >= "0" && x <= "7";
    }
    function isDecDigit(x) {
      return x >= "0" && x <= "9";
    }
    var unescapeMap = {
      "'": "'",
      '"': '"',
      "\\": "\\",
      "b": "\b",
      "f": "\f",
      "n": "\n",
      "r": "\r",
      "t": "	",
      "v": "\v",
      "/": "/"
    };
    function formatError(input, msg, position, lineno, column, json5) {
      var result = msg + " at " + (lineno + 1) + ":" + (column + 1), tmppos = position - column - 1, srcline = "", underline = "";
      var isLineTerminator = json5 ? Uni.isLineTerminator : Uni.isLineTerminatorJSON;
      if (tmppos < position - 70) {
        tmppos = position - 70;
      }
      while (1) {
        var chr = input[++tmppos];
        if (isLineTerminator(chr) || tmppos === input.length) {
          if (position >= tmppos) {
            underline += "^";
          }
          break;
        }
        srcline += chr;
        if (position === tmppos) {
          underline += "^";
        } else if (position > tmppos) {
          underline += input[tmppos] === "	" ? "	" : " ";
        }
        if (srcline.length > 78)
          break;
      }
      return result + "\n" + srcline + "\n" + underline;
    }
    function parse(input, options) {
      var json5 = false;
      var cjson = false;
      if (options.legacy || options.mode === "json") {
      } else if (options.mode === "cjson") {
        cjson = true;
      } else if (options.mode === "json5") {
        json5 = true;
      } else {
        json5 = true;
      }
      var isLineTerminator = json5 ? Uni.isLineTerminator : Uni.isLineTerminatorJSON;
      var isWhiteSpace = json5 ? Uni.isWhiteSpace : Uni.isWhiteSpaceJSON;
      var length = input.length, lineno = 0, linestart = 0, position = 0, stack = [];
      var tokenStart = function() {
      };
      var tokenEnd = function(v) {
        return v;
      };
      if (options._tokenize) {
        ;
        (function() {
          var start = null;
          tokenStart = function() {
            if (start !== null)
              throw Error("internal error, token overlap");
            start = position;
          };
          tokenEnd = function(v, type) {
            if (start != position) {
              var hash = {
                raw: input.substr(start, position - start),
                type,
                stack: stack.slice(0)
              };
              if (v !== void 0)
                hash.value = v;
              options._tokenize.call(null, hash);
            }
            start = null;
            return v;
          };
        })();
      }
      function fail(msg) {
        var column = position - linestart;
        if (!msg) {
          if (position < length) {
            var token = "'" + JSON.stringify(input[position]).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
            if (!msg)
              msg = "Unexpected token " + token;
          } else {
            if (!msg)
              msg = "Unexpected end of input";
          }
        }
        var error = SyntaxError(formatError(input, msg, position, lineno, column, json5));
        error.row = lineno + 1;
        error.column = column + 1;
        throw error;
      }
      function newline(chr) {
        if (chr === "\r" && input[position] === "\n")
          position++;
        linestart = position;
        lineno++;
      }
      function parseGeneric() {
        var result;
        while (position < length) {
          tokenStart();
          var chr = input[position++];
          if (chr === '"' || chr === "'" && json5) {
            return tokenEnd(parseString(chr), "literal");
          } else if (chr === "{") {
            tokenEnd(void 0, "separator");
            return parseObject();
          } else if (chr === "[") {
            tokenEnd(void 0, "separator");
            return parseArray();
          } else if (chr === "-" || chr === "." || isDecDigit(chr) || json5 && (chr === "+" || chr === "I" || chr === "N")) {
            return tokenEnd(parseNumber(), "literal");
          } else if (chr === "n") {
            parseKeyword("null");
            return tokenEnd(null, "literal");
          } else if (chr === "t") {
            parseKeyword("true");
            return tokenEnd(true, "literal");
          } else if (chr === "f") {
            parseKeyword("false");
            return tokenEnd(false, "literal");
          } else {
            position--;
            return tokenEnd(void 0);
          }
        }
      }
      function parseKey() {
        var result;
        while (position < length) {
          tokenStart();
          var chr = input[position++];
          if (chr === '"' || chr === "'" && json5) {
            return tokenEnd(parseString(chr), "key");
          } else if (chr === "{") {
            tokenEnd(void 0, "separator");
            return parseObject();
          } else if (chr === "[") {
            tokenEnd(void 0, "separator");
            return parseArray();
          } else if (chr === "." || isDecDigit(chr)) {
            return tokenEnd(parseNumber(true), "key");
          } else if (json5 && Uni.isIdentifierStart(chr) || chr === "\\" && input[position] === "u") {
            var rollback = position - 1;
            var result = parseIdentifier();
            if (result === void 0) {
              position = rollback;
              return tokenEnd(void 0);
            } else {
              return tokenEnd(result, "key");
            }
          } else {
            position--;
            return tokenEnd(void 0);
          }
        }
      }
      function skipWhiteSpace() {
        tokenStart();
        while (position < length) {
          var chr = input[position++];
          if (isLineTerminator(chr)) {
            position--;
            tokenEnd(void 0, "whitespace");
            tokenStart();
            position++;
            newline(chr);
            tokenEnd(void 0, "newline");
            tokenStart();
          } else if (isWhiteSpace(chr)) {
          } else if (chr === "/" && (json5 || cjson) && (input[position] === "/" || input[position] === "*")) {
            position--;
            tokenEnd(void 0, "whitespace");
            tokenStart();
            position++;
            skipComment(input[position++] === "*");
            tokenEnd(void 0, "comment");
            tokenStart();
          } else {
            position--;
            break;
          }
        }
        return tokenEnd(void 0, "whitespace");
      }
      function skipComment(multi) {
        while (position < length) {
          var chr = input[position++];
          if (isLineTerminator(chr)) {
            if (!multi) {
              position--;
              return;
            }
            newline(chr);
          } else if (chr === "*" && multi) {
            if (input[position] === "/") {
              position++;
              return;
            }
          } else {
          }
        }
        if (multi) {
          fail("Unclosed multiline comment");
        }
      }
      function parseKeyword(keyword) {
        var _pos = position;
        var len = keyword.length;
        for (var i = 1; i < len; i++) {
          if (position >= length || keyword[i] != input[position]) {
            position = _pos - 1;
            fail();
          }
          position++;
        }
      }
      function parseObject() {
        var result = options.null_prototype ? /* @__PURE__ */ Object.create(null) : {}, empty_object = {}, is_non_empty = false;
        while (position < length) {
          skipWhiteSpace();
          var item1 = parseKey();
          skipWhiteSpace();
          tokenStart();
          var chr = input[position++];
          tokenEnd(void 0, "separator");
          if (chr === "}" && item1 === void 0) {
            if (!json5 && is_non_empty) {
              position--;
              fail("Trailing comma in object");
            }
            return result;
          } else if (chr === ":" && item1 !== void 0) {
            skipWhiteSpace();
            stack.push(item1);
            var item2 = parseGeneric();
            stack.pop();
            if (item2 === void 0)
              fail("No value found for key " + item1);
            if (typeof item1 !== "string") {
              if (!json5 || typeof item1 !== "number") {
                fail("Wrong key type: " + item1);
              }
            }
            if ((item1 in empty_object || empty_object[item1] != null) && options.reserved_keys !== "replace") {
              if (options.reserved_keys === "throw") {
                fail("Reserved key: " + item1);
              } else {
              }
            } else {
              if (typeof options.reviver === "function") {
                item2 = options.reviver.call(null, item1, item2);
              }
              if (item2 !== void 0) {
                is_non_empty = true;
                Object.defineProperty(result, item1, {
                  value: item2,
                  enumerable: true,
                  configurable: true,
                  writable: true
                });
              }
            }
            skipWhiteSpace();
            tokenStart();
            var chr = input[position++];
            tokenEnd(void 0, "separator");
            if (chr === ",") {
              continue;
            } else if (chr === "}") {
              return result;
            } else {
              fail();
            }
          } else {
            position--;
            fail();
          }
        }
        fail();
      }
      function parseArray() {
        var result = [];
        while (position < length) {
          skipWhiteSpace();
          stack.push(result.length);
          var item = parseGeneric();
          stack.pop();
          skipWhiteSpace();
          tokenStart();
          var chr = input[position++];
          tokenEnd(void 0, "separator");
          if (item !== void 0) {
            if (typeof options.reviver === "function") {
              item = options.reviver.call(null, String(result.length), item);
            }
            if (item === void 0) {
              result.length++;
              item = true;
            } else {
              result.push(item);
            }
          }
          if (chr === ",") {
            if (item === void 0) {
              fail("Elisions are not supported");
            }
          } else if (chr === "]") {
            if (!json5 && item === void 0 && result.length) {
              position--;
              fail("Trailing comma in array");
            }
            return result;
          } else {
            position--;
            fail();
          }
        }
      }
      function parseNumber() {
        position--;
        var start = position, chr = input[position++], t;
        var to_num = function(is_octal2) {
          var str = input.substr(start, position - start);
          if (is_octal2) {
            var result = parseInt(str.replace(/^0o?/, ""), 8);
          } else {
            var result = Number(str);
          }
          if (Number.isNaN(result)) {
            position--;
            fail('Bad numeric literal - "' + input.substr(start, position - start + 1) + '"');
          } else if (!json5 && !str.match(/^-?(0|[1-9][0-9]*)(\.[0-9]+)?(e[+-]?[0-9]+)?$/i)) {
            position--;
            fail('Non-json numeric literal - "' + input.substr(start, position - start + 1) + '"');
          } else {
            return result;
          }
        };
        if (chr === "-" || chr === "+" && json5)
          chr = input[position++];
        if (chr === "N" && json5) {
          parseKeyword("NaN");
          return NaN;
        }
        if (chr === "I" && json5) {
          parseKeyword("Infinity");
          return to_num();
        }
        if (chr >= "1" && chr <= "9") {
          while (position < length && isDecDigit(input[position]))
            position++;
          chr = input[position++];
        }
        if (chr === "0") {
          chr = input[position++];
          var is_octal = chr === "o" || chr === "O" || isOctDigit(chr);
          var is_hex = chr === "x" || chr === "X";
          if (json5 && (is_octal || is_hex)) {
            while (position < length && (is_hex ? isHexDigit : isOctDigit)(input[position]))
              position++;
            var sign = 1;
            if (input[start] === "-") {
              sign = -1;
              start++;
            } else if (input[start] === "+") {
              start++;
            }
            return sign * to_num(is_octal);
          }
        }
        if (chr === ".") {
          while (position < length && isDecDigit(input[position]))
            position++;
          chr = input[position++];
        }
        if (chr === "e" || chr === "E") {
          chr = input[position++];
          if (chr === "-" || chr === "+")
            position++;
          while (position < length && isDecDigit(input[position]))
            position++;
          chr = input[position++];
        }
        position--;
        return to_num();
      }
      function parseIdentifier() {
        position--;
        var result = "";
        while (position < length) {
          var chr = input[position++];
          if (chr === "\\" && input[position] === "u" && isHexDigit(input[position + 1]) && isHexDigit(input[position + 2]) && isHexDigit(input[position + 3]) && isHexDigit(input[position + 4])) {
            chr = String.fromCharCode(parseInt(input.substr(position + 1, 4), 16));
            position += 5;
          }
          if (result.length) {
            if (Uni.isIdentifierPart(chr)) {
              result += chr;
            } else {
              position--;
              return result;
            }
          } else {
            if (Uni.isIdentifierStart(chr)) {
              result += chr;
            } else {
              return void 0;
            }
          }
        }
        fail();
      }
      function parseString(endChar) {
        var result = "";
        while (position < length) {
          var chr = input[position++];
          if (chr === endChar) {
            return result;
          } else if (chr === "\\") {
            if (position >= length)
              fail();
            chr = input[position++];
            if (unescapeMap[chr] && (json5 || chr != "v" && chr != "'")) {
              result += unescapeMap[chr];
            } else if (json5 && isLineTerminator(chr)) {
              newline(chr);
            } else if (chr === "u" || chr === "x" && json5) {
              var off = chr === "u" ? 4 : 2;
              for (var i = 0; i < off; i++) {
                if (position >= length)
                  fail();
                if (!isHexDigit(input[position]))
                  fail("Bad escape sequence");
                position++;
              }
              result += String.fromCharCode(parseInt(input.substr(position - off, off), 16));
            } else if (json5 && isOctDigit(chr)) {
              if (chr < "4" && isOctDigit(input[position]) && isOctDigit(input[position + 1])) {
                var digits = 3;
              } else if (isOctDigit(input[position])) {
                var digits = 2;
              } else {
                var digits = 1;
              }
              position += digits - 1;
              result += String.fromCharCode(parseInt(input.substr(position - digits, digits), 8));
            } else if (json5) {
              result += chr;
            } else {
              position--;
              fail();
            }
          } else if (isLineTerminator(chr)) {
            fail();
          } else {
            if (!json5 && chr.charCodeAt(0) < 32) {
              position--;
              fail("Unexpected control character");
            }
            result += chr;
          }
        }
        fail();
      }
      skipWhiteSpace();
      var return_value = parseGeneric();
      if (return_value !== void 0 || position < length) {
        skipWhiteSpace();
        if (position >= length) {
          if (typeof options.reviver === "function") {
            return_value = options.reviver.call(null, "", return_value);
          }
          return return_value;
        } else {
          fail();
        }
      } else {
        if (position) {
          fail("No data, only a whitespace");
        } else {
          fail("No data, empty input");
        }
      }
    }
    module2.exports.parse = function parseJSON(input, options) {
      if (typeof options === "function") {
        options = {
          reviver: options
        };
      }
      if (input === void 0) {
        return void 0;
      }
      if (typeof input !== "string")
        input = String(input);
      if (options == null)
        options = {};
      if (options.reserved_keys == null)
        options.reserved_keys = "ignore";
      if (options.reserved_keys === "throw" || options.reserved_keys === "ignore") {
        if (options.null_prototype == null) {
          options.null_prototype = true;
        }
      }
      try {
        return parse(input, options);
      } catch (err) {
        if (err instanceof SyntaxError && err.row != null && err.column != null) {
          var old_err = err;
          err = SyntaxError(old_err.message);
          err.column = old_err.column;
          err.row = old_err.row;
        }
        throw err;
      }
    };
    module2.exports.tokenize = function tokenizeJSON(input, options) {
      if (options == null)
        options = {};
      options._tokenize = function(smth) {
        if (options._addstack)
          smth.stack.unshift.apply(smth.stack, options._addstack);
        tokens.push(smth);
      };
      var tokens = [];
      tokens.data = module2.exports.parse(input, options);
      return tokens;
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/jju@1.4.0/node_modules/jju/lib/stringify.js
var require_stringify = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/jju@1.4.0/node_modules/jju/lib/stringify.js"(exports, module2) {
    var Uni = require_unicode();
    if (!function f() {
    }.name) {
      Object.defineProperty(function() {
      }.constructor.prototype, "name", {
        get: function() {
          var name = this.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];
          Object.defineProperty(this, "name", { value: name });
          return name;
        }
      });
    }
    var special_chars = {
      0: "\\0",
      8: "\\b",
      9: "\\t",
      10: "\\n",
      11: "\\v",
      12: "\\f",
      13: "\\r",
      92: "\\\\"
    };
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var escapable = /[\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/;
    function _stringify(object, options, recursiveLvl, currentKey) {
      var json5 = options.mode === "json5" || !options.mode;
      function indent(str2, add) {
        var prefix = options._prefix ? options._prefix : "";
        if (!options.indent)
          return prefix + str2;
        var result = "";
        var count = recursiveLvl + (add || 0);
        for (var i = 0; i < count; i++)
          result += options.indent;
        return prefix + result + str2 + (add ? "\n" : "");
      }
      function _stringify_key(key) {
        if (options.quote_keys)
          return _stringify_str(key);
        if (String(Number(key)) == key && key[0] != "-")
          return key;
        if (key == "")
          return _stringify_str(key);
        var result = "";
        for (var i = 0; i < key.length; i++) {
          if (i > 0) {
            if (!Uni.isIdentifierPart(key[i]))
              return _stringify_str(key);
          } else {
            if (!Uni.isIdentifierStart(key[i]))
              return _stringify_str(key);
          }
          var chr = key.charCodeAt(i);
          if (options.ascii) {
            if (chr < 128) {
              result += key[i];
            } else {
              result += "\\u" + ("0000" + chr.toString(16)).slice(-4);
            }
          } else {
            if (escapable.exec(key[i])) {
              result += "\\u" + ("0000" + chr.toString(16)).slice(-4);
            } else {
              result += key[i];
            }
          }
        }
        return result;
      }
      function _stringify_str(key) {
        var quote = options.quote;
        var quoteChr = quote.charCodeAt(0);
        var result = "";
        for (var i = 0; i < key.length; i++) {
          var chr = key.charCodeAt(i);
          if (chr < 16) {
            if (chr === 0 && json5) {
              result += "\\0";
            } else if (chr >= 8 && chr <= 13 && (json5 || chr !== 11)) {
              result += special_chars[chr];
            } else if (json5) {
              result += "\\x0" + chr.toString(16);
            } else {
              result += "\\u000" + chr.toString(16);
            }
          } else if (chr < 32) {
            if (json5) {
              result += "\\x" + chr.toString(16);
            } else {
              result += "\\u00" + chr.toString(16);
            }
          } else if (chr >= 32 && chr < 128) {
            if (chr === 47 && i && key[i - 1] === "<") {
              result += "\\" + key[i];
            } else if (chr === 92) {
              result += "\\\\";
            } else if (chr === quoteChr) {
              result += "\\" + quote;
            } else {
              result += key[i];
            }
          } else if (options.ascii || Uni.isLineTerminator(key[i]) || escapable.exec(key[i])) {
            if (chr < 256) {
              if (json5) {
                result += "\\x" + chr.toString(16);
              } else {
                result += "\\u00" + chr.toString(16);
              }
            } else if (chr < 4096) {
              result += "\\u0" + chr.toString(16);
            } else if (chr < 65536) {
              result += "\\u" + chr.toString(16);
            } else {
              throw Error("weird codepoint");
            }
          } else {
            result += key[i];
          }
        }
        return quote + result + quote;
      }
      function _stringify_object() {
        if (object === null)
          return "null";
        var result = [], len = 0, braces;
        if (Array.isArray(object)) {
          braces = "[]";
          for (var i = 0; i < object.length; i++) {
            var s = _stringify(object[i], options, recursiveLvl + 1, String(i));
            if (s === void 0)
              s = "null";
            len += s.length + 2;
            result.push(s + ",");
          }
        } else {
          braces = "{}";
          var fn = function(key) {
            var t = _stringify(object[key], options, recursiveLvl + 1, key);
            if (t !== void 0) {
              t = _stringify_key(key) + ":" + (options.indent ? " " : "") + t + ",";
              len += t.length + 1;
              result.push(t);
            }
          };
          if (Array.isArray(options.replacer)) {
            for (var i = 0; i < options.replacer.length; i++)
              if (hasOwnProperty.call(object, options.replacer[i]))
                fn(options.replacer[i]);
          } else {
            var keys = Object.keys(object);
            if (options.sort_keys)
              keys = keys.sort(typeof options.sort_keys === "function" ? options.sort_keys : void 0);
            keys.forEach(fn);
          }
        }
        len -= 2;
        if (options.indent && (len > options._splitMax - recursiveLvl * options.indent.length || len > options._splitMin)) {
          if (options.no_trailing_comma && result.length) {
            result[result.length - 1] = result[result.length - 1].substring(0, result[result.length - 1].length - 1);
          }
          var innerStuff = result.map(function(x) {
            return indent(x, 1);
          }).join("");
          return braces[0] + (options.indent ? "\n" : "") + innerStuff + indent(braces[1]);
        } else {
          if (result.length) {
            result[result.length - 1] = result[result.length - 1].substring(0, result[result.length - 1].length - 1);
          }
          var innerStuff = result.join(options.indent ? " " : "");
          return braces[0] + innerStuff + braces[1];
        }
      }
      function _stringify_nonobject(object2) {
        if (typeof options.replacer === "function") {
          object2 = options.replacer.call(null, currentKey, object2);
        }
        switch (typeof object2) {
          case "string":
            return _stringify_str(object2);
          case "number":
            if (object2 === 0 && 1 / object2 < 0) {
              return "-0";
            }
            if (!json5 && !Number.isFinite(object2)) {
              return "null";
            }
            return object2.toString();
          case "boolean":
            return object2.toString();
          case "undefined":
            return void 0;
          case "function":
          default:
            return JSON.stringify(object2);
        }
      }
      if (options._stringify_key) {
        return _stringify_key(object);
      }
      if (typeof object === "object") {
        if (object === null)
          return "null";
        var str;
        if (typeof (str = object.toJSON5) === "function" && options.mode !== "json") {
          object = str.call(object, currentKey);
        } else if (typeof (str = object.toJSON) === "function") {
          object = str.call(object, currentKey);
        }
        if (object === null)
          return "null";
        if (typeof object !== "object")
          return _stringify_nonobject(object);
        if (object.constructor === Number || object.constructor === Boolean || object.constructor === String) {
          object = object.valueOf();
          return _stringify_nonobject(object);
        } else if (object.constructor === Date) {
          return _stringify_nonobject(object.toISOString());
        } else {
          if (typeof options.replacer === "function") {
            object = options.replacer.call(null, currentKey, object);
            if (typeof object !== "object")
              return _stringify_nonobject(object);
          }
          return _stringify_object(object);
        }
      } else {
        return _stringify_nonobject(object);
      }
    }
    module2.exports.stringify = function stringifyJSON(object, options, _space) {
      if (typeof options === "function" || Array.isArray(options)) {
        options = {
          replacer: options
        };
      } else if (typeof options === "object" && options !== null) {
      } else {
        options = {};
      }
      if (_space != null)
        options.indent = _space;
      if (options.indent == null)
        options.indent = "	";
      if (options.quote == null)
        options.quote = "'";
      if (options.ascii == null)
        options.ascii = false;
      if (options.mode == null)
        options.mode = "json5";
      if (options.mode === "json" || options.mode === "cjson") {
        options.quote = '"';
        options.no_trailing_comma = true;
        options.quote_keys = true;
      }
      if (typeof options.indent === "object") {
        if (options.indent.constructor === Number || options.indent.constructor === Boolean || options.indent.constructor === String)
          options.indent = options.indent.valueOf();
      }
      if (typeof options.indent === "number") {
        if (options.indent >= 0) {
          options.indent = Array(Math.min(~~options.indent, 10) + 1).join(" ");
        } else {
          options.indent = false;
        }
      } else if (typeof options.indent === "string") {
        options.indent = options.indent.substr(0, 10);
      }
      if (options._splitMin == null)
        options._splitMin = 50;
      if (options._splitMax == null)
        options._splitMax = 70;
      return _stringify(object, options, 0, "");
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/jju@1.4.0/node_modules/jju/lib/analyze.js
var require_analyze = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/jju@1.4.0/node_modules/jju/lib/analyze.js"(exports, module2) {
    var tokenize = require_parse().tokenize;
    module2.exports.analyze = function analyzeJSON(input, options) {
      if (options == null)
        options = {};
      if (!Array.isArray(input)) {
        input = tokenize(input, options);
      }
      var result = {
        has_whitespace: false,
        has_comments: false,
        has_newlines: false,
        has_trailing_comma: false,
        indent: "",
        newline: "\n",
        quote: '"',
        quote_keys: true
      };
      var stats = {
        indent: {},
        newline: {},
        quote: {}
      };
      for (var i = 0; i < input.length; i++) {
        if (input[i].type === "newline") {
          if (input[i + 1] && input[i + 1].type === "whitespace") {
            if (input[i + 1].raw[0] === "	") {
              stats.indent["	"] = (stats.indent["	"] || 0) + 1;
            }
            if (input[i + 1].raw.match(/^\x20+$/)) {
              var ws_len = input[i + 1].raw.length;
              var indent_len = input[i + 1].stack.length + 1;
              if (ws_len % indent_len === 0) {
                var t = Array(ws_len / indent_len + 1).join(" ");
                stats.indent[t] = (stats.indent[t] || 0) + 1;
              }
            }
          }
          stats.newline[input[i].raw] = (stats.newline[input[i].raw] || 0) + 1;
        }
        if (input[i].type === "newline") {
          result.has_newlines = true;
        }
        if (input[i].type === "whitespace") {
          result.has_whitespace = true;
        }
        if (input[i].type === "comment") {
          result.has_comments = true;
        }
        if (input[i].type === "key") {
          if (input[i].raw[0] !== '"' && input[i].raw[0] !== "'")
            result.quote_keys = false;
        }
        if (input[i].type === "key" || input[i].type === "literal") {
          if (input[i].raw[0] === '"' || input[i].raw[0] === "'") {
            stats.quote[input[i].raw[0]] = (stats.quote[input[i].raw[0]] || 0) + 1;
          }
        }
        if (input[i].type === "separator" && input[i].raw === ",") {
          for (var j = i + 1; j < input.length; j++) {
            if (input[j].type === "literal" || input[j].type === "key")
              break;
            if (input[j].type === "separator")
              result.has_trailing_comma = true;
          }
        }
      }
      for (var k in stats) {
        if (Object.keys(stats[k]).length) {
          result[k] = Object.keys(stats[k]).reduce(function(a, b) {
            return stats[k][a] > stats[k][b] ? a : b;
          });
        }
      }
      return result;
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/jju@1.4.0/node_modules/jju/lib/document.js
var require_document = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/jju@1.4.0/node_modules/jju/lib/document.js"(exports, module2) {
    var assert = require("assert");
    var tokenize = require_parse().tokenize;
    var stringify = require_stringify().stringify;
    var analyze = require_analyze().analyze;
    function isObject(x) {
      return typeof x === "object" && x !== null;
    }
    function value_to_tokenlist(value, stack, options, is_key, indent) {
      options = Object.create(options);
      options._stringify_key = !!is_key;
      if (indent) {
        options._prefix = indent.prefix.map(function(x) {
          return x.raw;
        }).join("");
      }
      if (options._splitMin == null)
        options._splitMin = 0;
      if (options._splitMax == null)
        options._splitMax = 0;
      var stringified = stringify(value, options);
      if (is_key) {
        return [{ raw: stringified, type: "key", stack, value }];
      }
      options._addstack = stack;
      var result = tokenize(stringified, {
        _addstack: stack
      });
      result.data = null;
      return result;
    }
    function arg_to_path(path) {
      if (typeof path === "number")
        path = String(path);
      if (path === "")
        path = [];
      if (typeof path === "string")
        path = path.split(".");
      if (!Array.isArray(path))
        throw Error("Invalid path type, string or array expected");
      return path;
    }
    function find_element_in_tokenlist(element, lvl, tokens, begin, end) {
      while (tokens[begin].stack[lvl] != element) {
        if (begin++ >= end)
          return false;
      }
      while (tokens[end].stack[lvl] != element) {
        if (end-- < begin)
          return false;
      }
      return [begin, end];
    }
    function is_whitespace(token_type) {
      return token_type === "whitespace" || token_type === "newline" || token_type === "comment";
    }
    function find_first_non_ws_token(tokens, begin, end) {
      while (is_whitespace(tokens[begin].type)) {
        if (begin++ >= end)
          return false;
      }
      return begin;
    }
    function find_last_non_ws_token(tokens, begin, end) {
      while (is_whitespace(tokens[end].type)) {
        if (end-- < begin)
          return false;
      }
      return end;
    }
    function detect_indent_style(tokens, is_array, begin, end, level) {
      var result = {
        sep1: [],
        sep2: [],
        suffix: [],
        prefix: [],
        newline: []
      };
      if (tokens[end].type === "separator" && tokens[end].stack.length !== level + 1 && tokens[end].raw !== ",") {
        return result;
      }
      if (tokens[end].type === "separator")
        end = find_last_non_ws_token(tokens, begin, end - 1);
      if (end === false)
        return result;
      while (tokens[end].stack.length > level)
        end--;
      if (!is_array) {
        while (is_whitespace(tokens[end].type)) {
          if (end < begin)
            return result;
          if (tokens[end].type === "whitespace") {
            result.sep2.unshift(tokens[end]);
          } else {
            return result;
          }
          end--;
        }
        assert.equal(tokens[end].type, "separator");
        assert.equal(tokens[end].raw, ":");
        while (is_whitespace(tokens[--end].type)) {
          if (end < begin)
            return result;
          if (tokens[end].type === "whitespace") {
            result.sep1.unshift(tokens[end]);
          } else {
            return result;
          }
        }
        assert.equal(tokens[end].type, "key");
        end--;
      }
      while (is_whitespace(tokens[end].type)) {
        if (end < begin)
          return result;
        if (tokens[end].type === "whitespace") {
          result.prefix.unshift(tokens[end]);
        } else if (tokens[end].type === "newline") {
          result.newline.unshift(tokens[end]);
          return result;
        } else {
          return result;
        }
        end--;
      }
      return result;
    }
    function Document(text, options) {
      var self2 = Object.create(Document.prototype);
      if (options == null)
        options = {};
      var tokens = self2._tokens = tokenize(text, options);
      self2._data = tokens.data;
      tokens.data = null;
      self2._options = options;
      var stats = analyze(text, options);
      if (options.indent == null) {
        options.indent = stats.indent;
      }
      if (options.quote == null) {
        options.quote = stats.quote;
      }
      if (options.quote_keys == null) {
        options.quote_keys = stats.quote_keys;
      }
      if (options.no_trailing_comma == null) {
        options.no_trailing_comma = !stats.has_trailing_comma;
      }
      return self2;
    }
    function check_if_can_be_placed(key, object, is_unset) {
      function error(add) {
        return Error("You can't " + (is_unset ? "unset" : "set") + " key '" + key + "'" + add);
      }
      if (!isObject(object)) {
        throw error(" of an non-object");
      }
      if (Array.isArray(object)) {
        if (String(key).match(/^\d+$/)) {
          key = Number(String(key));
          if (object.length < key || is_unset && object.length === key) {
            throw error(", out of bounds");
          } else if (is_unset && object.length !== key + 1) {
            throw error(" in the middle of an array");
          } else {
            return true;
          }
        } else {
          throw error(" of an array");
        }
      } else {
        return true;
      }
    }
    Document.prototype.set = function(path, value) {
      path = arg_to_path(path);
      if (path.length === 0) {
        if (value === void 0)
          throw Error("can't remove root document");
        this._data = value;
        var new_key = false;
      } else {
        var data = this._data;
        for (var i = 0; i < path.length - 1; i++) {
          check_if_can_be_placed(path[i], data, false);
          data = data[path[i]];
        }
        if (i === path.length - 1) {
          check_if_can_be_placed(path[i], data, value === void 0);
        }
        var new_key = !(path[i] in data);
        if (value === void 0) {
          if (Array.isArray(data)) {
            data.pop();
          } else {
            delete data[path[i]];
          }
        } else {
          data[path[i]] = value;
        }
      }
      if (!this._tokens.length)
        this._tokens = [{ raw: "", type: "literal", stack: [], value: void 0 }];
      var position = [
        find_first_non_ws_token(this._tokens, 0, this._tokens.length - 1),
        find_last_non_ws_token(this._tokens, 0, this._tokens.length - 1)
      ];
      for (var i = 0; i < path.length - 1; i++) {
        position = find_element_in_tokenlist(path[i], i, this._tokens, position[0], position[1]);
        if (position == false)
          throw Error("internal error, please report this");
      }
      if (path.length === 0) {
        var newtokens = value_to_tokenlist(value, path, this._options);
      } else if (!new_key) {
        var pos_old = position;
        position = find_element_in_tokenlist(path[i], i, this._tokens, position[0], position[1]);
        if (value === void 0 && position !== false) {
          var newtokens = [];
          if (!Array.isArray(data)) {
            var pos2 = find_last_non_ws_token(this._tokens, pos_old[0], position[0] - 1);
            assert.equal(this._tokens[pos2].type, "separator");
            assert.equal(this._tokens[pos2].raw, ":");
            position[0] = pos2;
            var pos2 = find_last_non_ws_token(this._tokens, pos_old[0], position[0] - 1);
            assert.equal(this._tokens[pos2].type, "key");
            assert.equal(this._tokens[pos2].value, path[path.length - 1]);
            position[0] = pos2;
          }
          var pos2 = find_last_non_ws_token(this._tokens, pos_old[0], position[0] - 1);
          assert.equal(this._tokens[pos2].type, "separator");
          if (this._tokens[pos2].raw === ",") {
            position[0] = pos2;
          } else {
            pos2 = find_first_non_ws_token(this._tokens, position[1] + 1, pos_old[1]);
            assert.equal(this._tokens[pos2].type, "separator");
            if (this._tokens[pos2].raw === ",") {
              position[1] = pos2;
            }
          }
        } else {
          var indent = pos2 !== false ? detect_indent_style(this._tokens, Array.isArray(data), pos_old[0], position[1] - 1, i) : {};
          var newtokens = value_to_tokenlist(value, path, this._options, false, indent);
        }
      } else {
        var path_1 = path.slice(0, i);
        var pos2 = find_last_non_ws_token(this._tokens, position[0] + 1, position[1] - 1);
        assert(pos2 !== false);
        var indent = pos2 !== false ? detect_indent_style(this._tokens, Array.isArray(data), position[0] + 1, pos2, i) : {};
        var newtokens = value_to_tokenlist(value, path, this._options, false, indent);
        var prefix = [];
        if (indent.newline && indent.newline.length)
          prefix = prefix.concat(indent.newline);
        if (indent.prefix && indent.prefix.length)
          prefix = prefix.concat(indent.prefix);
        if (!Array.isArray(data)) {
          prefix = prefix.concat(value_to_tokenlist(path[path.length - 1], path_1, this._options, true));
          if (indent.sep1 && indent.sep1.length)
            prefix = prefix.concat(indent.sep1);
          prefix.push({ raw: ":", type: "separator", stack: path_1 });
          if (indent.sep2 && indent.sep2.length)
            prefix = prefix.concat(indent.sep2);
        }
        newtokens.unshift.apply(newtokens, prefix);
        if (this._tokens[pos2].type === "separator" && this._tokens[pos2].stack.length === path.length - 1) {
          if (this._tokens[pos2].raw === ",") {
            newtokens.push({ raw: ",", type: "separator", stack: path_1 });
          }
        } else {
          newtokens.unshift({ raw: ",", type: "separator", stack: path_1 });
        }
        if (indent.suffix && indent.suffix.length)
          newtokens.push.apply(newtokens, indent.suffix);
        assert.equal(this._tokens[position[1]].type, "separator");
        position[0] = pos2 + 1;
        position[1] = pos2;
      }
      newtokens.unshift(position[1] - position[0] + 1);
      newtokens.unshift(position[0]);
      this._tokens.splice.apply(this._tokens, newtokens);
      return this;
    };
    Document.prototype.unset = function(path) {
      return this.set(path, void 0);
    };
    Document.prototype.get = function(path) {
      path = arg_to_path(path);
      var data = this._data;
      for (var i = 0; i < path.length; i++) {
        if (!isObject(data))
          return void 0;
        data = data[path[i]];
      }
      return data;
    };
    Document.prototype.has = function(path) {
      path = arg_to_path(path);
      var data = this._data;
      for (var i = 0; i < path.length; i++) {
        if (!isObject(data))
          return false;
        data = data[path[i]];
      }
      return data !== void 0;
    };
    Document.prototype.update = function(value) {
      var self2 = this;
      change([], self2._data, value);
      return self2;
      function change(path, old_data, new_data) {
        if (!isObject(new_data) || !isObject(old_data)) {
          if (new_data !== old_data)
            self2.set(path, new_data);
        } else if (Array.isArray(new_data) != Array.isArray(old_data)) {
          self2.set(path, new_data);
        } else if (Array.isArray(new_data)) {
          if (new_data.length > old_data.length) {
            for (var i = 0; i < new_data.length; i++) {
              path.push(String(i));
              change(path, old_data[i], new_data[i]);
              path.pop();
            }
          } else {
            for (var i = old_data.length - 1; i >= 0; i--) {
              path.push(String(i));
              change(path, old_data[i], new_data[i]);
              path.pop();
            }
          }
        } else {
          for (var i in new_data) {
            path.push(String(i));
            change(path, old_data[i], new_data[i]);
            path.pop();
          }
          for (var i in old_data) {
            if (i in new_data)
              continue;
            path.push(String(i));
            change(path, old_data[i], new_data[i]);
            path.pop();
          }
        }
      }
    };
    Document.prototype.toString = function() {
      return this._tokens.map(function(x) {
        return x.raw;
      }).join("");
    };
    module2.exports.Document = Document;
    module2.exports.update = function updateJSON(source, new_value, options) {
      return Document(source, options).update(new_value).toString();
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/jju@1.4.0/node_modules/jju/lib/utils.js
var require_utils = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/jju@1.4.0/node_modules/jju/lib/utils.js"(exports, module2) {
    var FS = require("fs");
    var jju = require_jju();
    module2.exports.register = function() {
      var r = require, e = "extensions";
      r[e][".json5"] = function(m, f) {
        m.exports = jju.parse(FS.readFileSync(f, "utf8"));
      };
    };
    module2.exports.patch_JSON_parse = function() {
      var _parse = JSON.parse;
      JSON.parse = function(text, rev) {
        try {
          return _parse(text, rev);
        } catch (err) {
          require_jju().parse(text, {
            mode: "json",
            legacy: true,
            reviver: rev,
            reserved_keys: "replace",
            null_prototype: false
          });
          throw err;
        }
      };
    };
    module2.exports.middleware = function() {
      return function(req, res, next) {
        throw Error("this function is removed, use express-json5 instead");
      };
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/jju@1.4.0/node_modules/jju/index.js
var require_jju = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/jju@1.4.0/node_modules/jju/index.js"(exports, module2) {
    module2.exports.__defineGetter__("parse", function() {
      return require_parse().parse;
    });
    module2.exports.__defineGetter__("stringify", function() {
      return require_stringify().stringify;
    });
    module2.exports.__defineGetter__("tokenize", function() {
      return require_parse().tokenize;
    });
    module2.exports.__defineGetter__("update", function() {
      return require_document().update;
    });
    module2.exports.__defineGetter__("analyze", function() {
      return require_analyze().analyze;
    });
    module2.exports.__defineGetter__("utils", function() {
      return require_utils();
    });
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/JsonFile.js
var require_JsonFile = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/JsonFile.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.JsonFile = exports.JsonSyntax = void 0;
    var os = __importStar(require("os"));
    var jju = __importStar(require_jju());
    var Text_1 = require_Text();
    var FileSystem_1 = require_FileSystem();
    var JsonSyntax;
    (function(JsonSyntax2) {
      JsonSyntax2["Strict"] = "strict";
      JsonSyntax2["JsonWithComments"] = "jsonWithComments";
      JsonSyntax2["Json5"] = "json5";
    })(JsonSyntax = exports.JsonSyntax || (exports.JsonSyntax = {}));
    var DEFAULT_ENCODING = "utf8";
    var JsonFile = class {
      static load(jsonFilename, options) {
        try {
          const contents = FileSystem_1.FileSystem.readFile(jsonFilename);
          const parseOptions = JsonFile._buildJjuParseOptions(options);
          return jju.parse(contents, parseOptions);
        } catch (error) {
          if (FileSystem_1.FileSystem.isNotExistError(error)) {
            throw error;
          } else {
            throw new Error(`Error reading "${JsonFile._formatPathForError(jsonFilename)}":` + os.EOL + `  ${error.message}`);
          }
        }
      }
      static async loadAsync(jsonFilename, options) {
        try {
          const contents = await FileSystem_1.FileSystem.readFileAsync(jsonFilename);
          const parseOptions = JsonFile._buildJjuParseOptions(options);
          return jju.parse(contents, parseOptions);
        } catch (error) {
          if (FileSystem_1.FileSystem.isNotExistError(error)) {
            throw error;
          } else {
            throw new Error(`Error reading "${JsonFile._formatPathForError(jsonFilename)}":` + os.EOL + `  ${error.message}`);
          }
        }
      }
      static parseString(jsonContents, options) {
        const parseOptions = JsonFile._buildJjuParseOptions(options);
        return jju.parse(jsonContents, parseOptions);
      }
      static loadAndValidate(jsonFilename, jsonSchema, options) {
        const jsonObject = JsonFile.load(jsonFilename, options);
        jsonSchema.validateObject(jsonObject, jsonFilename, options);
        return jsonObject;
      }
      static async loadAndValidateAsync(jsonFilename, jsonSchema, options) {
        const jsonObject = await JsonFile.loadAsync(jsonFilename, options);
        jsonSchema.validateObject(jsonObject, jsonFilename, options);
        return jsonObject;
      }
      static loadAndValidateWithCallback(jsonFilename, jsonSchema, errorCallback, options) {
        const jsonObject = JsonFile.load(jsonFilename, options);
        jsonSchema.validateObjectWithCallback(jsonObject, errorCallback);
        return jsonObject;
      }
      static async loadAndValidateWithCallbackAsync(jsonFilename, jsonSchema, errorCallback, options) {
        const jsonObject = await JsonFile.loadAsync(jsonFilename, options);
        jsonSchema.validateObjectWithCallback(jsonObject, errorCallback);
        return jsonObject;
      }
      static stringify(jsonObject, options) {
        return JsonFile.updateString("", jsonObject, options);
      }
      static updateString(previousJson, newJsonObject, options) {
        if (!options) {
          options = {};
        }
        if (!options.ignoreUndefinedValues) {
          JsonFile.validateNoUndefinedMembers(newJsonObject);
        }
        let stringified;
        if (previousJson !== "") {
          stringified = jju.update(previousJson, newJsonObject, {
            mode: "cjson",
            indent: 2
          });
        } else if (options.prettyFormatting) {
          stringified = jju.stringify(newJsonObject, {
            mode: "json",
            indent: 2
          });
          if (options.headerComment !== void 0) {
            stringified = JsonFile._formatJsonHeaderComment(options.headerComment) + stringified;
          }
        } else {
          stringified = JSON.stringify(newJsonObject, void 0, 2);
          if (options.headerComment !== void 0) {
            stringified = JsonFile._formatJsonHeaderComment(options.headerComment) + stringified;
          }
        }
        stringified = Text_1.Text.ensureTrailingNewline(stringified);
        if (options && options.newlineConversion) {
          stringified = Text_1.Text.convertTo(stringified, options.newlineConversion);
        }
        return stringified;
      }
      static save(jsonObject, jsonFilename, options) {
        if (!options) {
          options = {};
        }
        let oldBuffer = void 0;
        if (options.updateExistingFile || options.onlyIfChanged) {
          try {
            oldBuffer = FileSystem_1.FileSystem.readFileToBuffer(jsonFilename);
          } catch (error) {
            if (!FileSystem_1.FileSystem.isNotExistError(error)) {
              throw error;
            }
          }
        }
        let jsonToUpdate = "";
        if (options.updateExistingFile && oldBuffer) {
          jsonToUpdate = oldBuffer.toString(DEFAULT_ENCODING);
        }
        const newJson = JsonFile.updateString(jsonToUpdate, jsonObject, options);
        const newBuffer = Buffer.from(newJson, DEFAULT_ENCODING);
        if (options.onlyIfChanged) {
          if (oldBuffer && Buffer.compare(newBuffer, oldBuffer) === 0) {
            return false;
          }
        }
        FileSystem_1.FileSystem.writeFile(jsonFilename, newBuffer.toString(DEFAULT_ENCODING), {
          ensureFolderExists: options.ensureFolderExists
        });
        return true;
      }
      static async saveAsync(jsonObject, jsonFilename, options) {
        if (!options) {
          options = {};
        }
        let oldBuffer = void 0;
        if (options.updateExistingFile || options.onlyIfChanged) {
          try {
            oldBuffer = await FileSystem_1.FileSystem.readFileToBufferAsync(jsonFilename);
          } catch (error) {
            if (!FileSystem_1.FileSystem.isNotExistError(error)) {
              throw error;
            }
          }
        }
        let jsonToUpdate = "";
        if (options.updateExistingFile && oldBuffer) {
          jsonToUpdate = oldBuffer.toString(DEFAULT_ENCODING);
        }
        const newJson = JsonFile.updateString(jsonToUpdate, jsonObject, options);
        const newBuffer = Buffer.from(newJson, DEFAULT_ENCODING);
        if (options.onlyIfChanged) {
          if (oldBuffer && Buffer.compare(newBuffer, oldBuffer) === 0) {
            return false;
          }
        }
        await FileSystem_1.FileSystem.writeFileAsync(jsonFilename, newBuffer.toString(DEFAULT_ENCODING), {
          ensureFolderExists: options.ensureFolderExists
        });
        return true;
      }
      static validateNoUndefinedMembers(jsonObject) {
        return JsonFile._validateNoUndefinedMembers(jsonObject, []);
      }
      static _validateNoUndefinedMembers(jsonObject, keyPath) {
        if (!jsonObject) {
          return;
        }
        if (typeof jsonObject === "object") {
          for (const key of Object.keys(jsonObject)) {
            keyPath.push(key);
            const value = jsonObject[key];
            if (value === void 0) {
              const fullPath = JsonFile._formatKeyPath(keyPath);
              throw new Error(`The value for ${fullPath} is "undefined" and cannot be serialized as JSON`);
            }
            JsonFile._validateNoUndefinedMembers(value, keyPath);
            keyPath.pop();
          }
        }
      }
      static _formatKeyPath(keyPath) {
        let result = "";
        for (const key of keyPath) {
          if (/^[0-9]+$/.test(key)) {
            result += `[${key}]`;
          } else if (/^[a-z_][a-z_0-9]*$/i.test(key)) {
            if (result) {
              result += ".";
            }
            result += `${key}`;
          } else {
            const escapedKey = key.replace(/[\\]/g, "\\\\").replace(/["]/g, "\\");
            result += `["${escapedKey}"]`;
          }
        }
        return result;
      }
      static _formatJsonHeaderComment(headerComment) {
        if (headerComment === "") {
          return "";
        }
        const lines = headerComment.split("\n");
        const result = [];
        for (const line of lines) {
          if (!/^\s*$/.test(line) && !/^\s*\/\//.test(line)) {
            throw new Error('The headerComment lines must be blank or start with the "//" prefix.\nInvalid line' + JSON.stringify(line));
          }
          result.push(Text_1.Text.replaceAll(line, "\r", ""));
        }
        return lines.join("\n") + "\n";
      }
      static _buildJjuParseOptions(options) {
        if (!options) {
          options = {};
        }
        const parseOptions = {};
        switch (options.jsonSyntax) {
          case JsonSyntax.Strict:
            parseOptions.mode = "json";
            break;
          case JsonSyntax.JsonWithComments:
            parseOptions.mode = "cjson";
            break;
          case JsonSyntax.Json5:
          default:
            parseOptions.mode = "json5";
            break;
        }
        return parseOptions;
      }
    };
    exports.JsonFile = JsonFile;
    JsonFile._formatPathForError = (path) => path;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/PackageJsonLookup.js
var require_PackageJsonLookup = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/PackageJsonLookup.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PackageJsonLookup = void 0;
    var path = __importStar(require("path"));
    var JsonFile_1 = require_JsonFile();
    var Constants_1 = require_Constants();
    var FileSystem_1 = require_FileSystem();
    var PackageJsonLookup = class {
      constructor(parameters) {
        this._loadExtraFields = false;
        if (parameters) {
          if (parameters.loadExtraFields) {
            this._loadExtraFields = parameters.loadExtraFields;
          }
        }
        this.clearCache();
      }
      static get instance() {
        if (!PackageJsonLookup._instance) {
          PackageJsonLookup._instance = new PackageJsonLookup({ loadExtraFields: true });
        }
        return PackageJsonLookup._instance;
      }
      static loadOwnPackageJson(dirnameOfCaller) {
        const packageJson = PackageJsonLookup.instance.tryLoadPackageJsonFor(dirnameOfCaller);
        if (packageJson === void 0) {
          throw new Error(`PackageJsonLookup.loadOwnPackageJson() failed to find the caller's package.json.  The __dirname was: ${dirnameOfCaller}`);
        }
        if (packageJson.version !== void 0) {
          return packageJson;
        }
        const errorPath = PackageJsonLookup.instance.tryGetPackageJsonFilePathFor(dirnameOfCaller) || "package.json";
        throw new Error(`PackageJsonLookup.loadOwnPackageJson() failed because the "version" field is missing in ${errorPath}`);
      }
      clearCache() {
        this._packageFolderCache = /* @__PURE__ */ new Map();
        this._packageJsonCache = /* @__PURE__ */ new Map();
      }
      tryGetPackageFolderFor(fileOrFolderPath) {
        const resolvedFileOrFolderPath = path.resolve(fileOrFolderPath);
        if (this._packageFolderCache.has(resolvedFileOrFolderPath)) {
          return this._packageFolderCache.get(resolvedFileOrFolderPath);
        }
        return this._tryGetPackageFolderFor(resolvedFileOrFolderPath);
      }
      tryGetPackageJsonFilePathFor(fileOrFolderPath) {
        const packageJsonFolder = this.tryGetPackageFolderFor(fileOrFolderPath);
        if (!packageJsonFolder) {
          return void 0;
        }
        return path.join(packageJsonFolder, Constants_1.FileConstants.PackageJson);
      }
      tryLoadPackageJsonFor(fileOrFolderPath) {
        const packageJsonFilePath = this.tryGetPackageJsonFilePathFor(fileOrFolderPath);
        if (!packageJsonFilePath) {
          return void 0;
        }
        return this.loadPackageJson(packageJsonFilePath);
      }
      tryLoadNodePackageJsonFor(fileOrFolderPath) {
        const packageJsonFilePath = this.tryGetPackageJsonFilePathFor(fileOrFolderPath);
        if (!packageJsonFilePath) {
          return void 0;
        }
        return this.loadNodePackageJson(packageJsonFilePath);
      }
      loadPackageJson(jsonFilename) {
        const packageJson = this.loadNodePackageJson(jsonFilename);
        if (!packageJson.version) {
          throw new Error(`Error reading "${jsonFilename}":
  The required field "version" was not found`);
        }
        return packageJson;
      }
      loadNodePackageJson(jsonFilename) {
        return this._loadPackageJsonInner(jsonFilename);
      }
      _loadPackageJsonInner(jsonFilename, errorsToIgnore) {
        const loadResult = this._tryLoadNodePackageJsonInner(jsonFilename);
        if (loadResult.error && (errorsToIgnore === null || errorsToIgnore === void 0 ? void 0 : errorsToIgnore.has(loadResult.error))) {
          return void 0;
        }
        switch (loadResult.error) {
          case "FILE_NOT_FOUND": {
            throw new Error(`Input file not found: ${jsonFilename}`);
          }
          case "MISSING_NAME_FIELD": {
            throw new Error(`Error reading "${jsonFilename}":
  The required field "name" was not found`);
          }
          case "OTHER_ERROR": {
            throw loadResult.errorObject;
          }
          default: {
            return loadResult.packageJson;
          }
        }
      }
      _tryLoadNodePackageJsonInner(jsonFilename) {
        let normalizedFilePath;
        try {
          normalizedFilePath = FileSystem_1.FileSystem.getRealPath(jsonFilename);
        } catch (e) {
          if (FileSystem_1.FileSystem.isNotExistError(e)) {
            return {
              error: "FILE_NOT_FOUND"
            };
          } else {
            return {
              error: "OTHER_ERROR",
              errorObject: e
            };
          }
        }
        let packageJson = this._packageJsonCache.get(normalizedFilePath);
        if (!packageJson) {
          const loadedPackageJson = JsonFile_1.JsonFile.load(normalizedFilePath);
          if (!loadedPackageJson.name) {
            return {
              error: "MISSING_NAME_FIELD"
            };
          }
          if (this._loadExtraFields) {
            packageJson = loadedPackageJson;
          } else {
            packageJson = {};
            packageJson.bin = loadedPackageJson.bin;
            packageJson.dependencies = loadedPackageJson.dependencies;
            packageJson.description = loadedPackageJson.description;
            packageJson.devDependencies = loadedPackageJson.devDependencies;
            packageJson.homepage = loadedPackageJson.homepage;
            packageJson.license = loadedPackageJson.license;
            packageJson.main = loadedPackageJson.main;
            packageJson.name = loadedPackageJson.name;
            packageJson.optionalDependencies = loadedPackageJson.optionalDependencies;
            packageJson.peerDependencies = loadedPackageJson.peerDependencies;
            packageJson.private = loadedPackageJson.private;
            packageJson.scripts = loadedPackageJson.scripts;
            packageJson.typings = loadedPackageJson.typings || loadedPackageJson.types;
            packageJson.tsdocMetadata = loadedPackageJson.tsdocMetadata;
            packageJson.version = loadedPackageJson.version;
          }
          Object.freeze(packageJson);
          this._packageJsonCache.set(normalizedFilePath, packageJson);
        }
        return {
          packageJson
        };
      }
      _tryGetPackageFolderFor(resolvedFileOrFolderPath) {
        if (this._packageFolderCache.has(resolvedFileOrFolderPath)) {
          return this._packageFolderCache.get(resolvedFileOrFolderPath);
        }
        const packageJsonFilePath = `${resolvedFileOrFolderPath}/${Constants_1.FileConstants.PackageJson}`;
        const packageJson = this._loadPackageJsonInner(packageJsonFilePath, /* @__PURE__ */ new Set(["FILE_NOT_FOUND", "MISSING_NAME_FIELD"]));
        if (packageJson) {
          this._packageFolderCache.set(resolvedFileOrFolderPath, resolvedFileOrFolderPath);
          return resolvedFileOrFolderPath;
        }
        const parentFolder = path.dirname(resolvedFileOrFolderPath);
        if (!parentFolder || parentFolder === resolvedFileOrFolderPath) {
          this._packageFolderCache.set(resolvedFileOrFolderPath, void 0);
          return void 0;
        }
        const parentResult = this._tryGetPackageFolderFor(parentFolder);
        this._packageFolderCache.set(resolvedFileOrFolderPath, parentResult);
        return parentResult;
      }
    };
    exports.PackageJsonLookup = PackageJsonLookup;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/PackageName.js
var require_PackageName = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/PackageName.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PackageName = exports.PackageNameParser = void 0;
    var PackageNameParser = class {
      constructor(options = {}) {
        this._options = Object.assign({}, options);
      }
      tryParse(packageName) {
        const result = {
          scope: "",
          unscopedName: "",
          error: ""
        };
        let input = packageName;
        if (input === null || input === void 0) {
          result.error = "The package name must not be null or undefined";
          return result;
        }
        if (packageName.length > 214) {
          result.error = "The package name cannot be longer than 214 characters";
          return result;
        }
        if (input[0] === "@") {
          const indexOfScopeSlash = input.indexOf("/");
          if (indexOfScopeSlash <= 0) {
            result.scope = input;
            result.error = `Error parsing "${packageName}": The scope must be followed by a slash`;
            return result;
          }
          result.scope = input.substr(0, indexOfScopeSlash);
          input = input.substr(indexOfScopeSlash + 1);
        }
        result.unscopedName = input;
        if (result.scope === "@") {
          result.error = `Error parsing "${packageName}": The scope name cannot be empty`;
          return result;
        }
        if (result.unscopedName === "") {
          result.error = "The package name must not be empty";
          return result;
        }
        if (result.unscopedName[0] === "." || result.unscopedName[0] === "_") {
          result.error = `The package name "${packageName}" starts with an invalid character`;
          return result;
        }
        const nameWithoutScopeSymbols = (result.scope ? result.scope.slice(1, -1) : "") + result.unscopedName;
        if (!this._options.allowUpperCase) {
          if (result.scope !== result.scope.toLowerCase()) {
            result.error = `The package scope "${result.scope}" must not contain upper case characters`;
            return result;
          }
        }
        const match = nameWithoutScopeSymbols.match(PackageNameParser._invalidNameCharactersRegExp);
        if (match) {
          result.error = `The package name "${packageName}" contains an invalid character: "${match[0]}"`;
          return result;
        }
        return result;
      }
      parse(packageName) {
        const result = this.tryParse(packageName);
        if (result.error) {
          throw new Error(result.error);
        }
        return result;
      }
      getScope(packageName) {
        return this.parse(packageName).scope;
      }
      getUnscopedName(packageName) {
        return this.parse(packageName).unscopedName;
      }
      isValidName(packageName) {
        const result = this.tryParse(packageName);
        return !result.error;
      }
      validate(packageName) {
        this.parse(packageName);
      }
      combineParts(scope, unscopedName) {
        if (scope !== "") {
          if (scope[0] !== "@") {
            throw new Error('The scope must start with an "@" character');
          }
        }
        if (scope.indexOf("/") >= 0) {
          throw new Error('The scope must not contain a "/" character');
        }
        if (unscopedName[0] === "@") {
          throw new Error('The unscopedName cannot start with an "@" character');
        }
        if (unscopedName.indexOf("/") >= 0) {
          throw new Error('The unscopedName must not contain a "/" character');
        }
        let result;
        if (scope === "") {
          result = unscopedName;
        } else {
          result = scope + "/" + unscopedName;
        }
        this.validate(result);
        return result;
      }
    };
    exports.PackageNameParser = PackageNameParser;
    PackageNameParser._invalidNameCharactersRegExp = /[^A-Za-z0-9\-_\.]/;
    var PackageName = class {
      static tryParse(packageName) {
        return PackageName._parser.tryParse(packageName);
      }
      static parse(packageName) {
        return this._parser.parse(packageName);
      }
      static getScope(packageName) {
        return this._parser.getScope(packageName);
      }
      static getUnscopedName(packageName) {
        return this._parser.getUnscopedName(packageName);
      }
      static isValidName(packageName) {
        return this._parser.isValidName(packageName);
      }
      static validate(packageName) {
        return this._parser.validate(packageName);
      }
      static combineParts(scope, unscopedName) {
        return this._parser.combineParts(scope, unscopedName);
      }
    };
    exports.PackageName = PackageName;
    PackageName._parser = new PackageNameParser();
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Import.js
var require_Import = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Import.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Import = void 0;
    var path = __importStar(require("path"));
    var importLazy = require_import_lazy();
    var Resolve = __importStar(require_resolve());
    var nodeModule = require("module");
    var PackageJsonLookup_1 = require_PackageJsonLookup();
    var FileSystem_1 = require_FileSystem();
    var PackageName_1 = require_PackageName();
    var Import = class {
      static get _builtInModules() {
        if (!Import.__builtInModules) {
          Import.__builtInModules = new Set(nodeModule.builtinModules);
        }
        return Import.__builtInModules;
      }
      static lazy(moduleName, require2) {
        const importLazyLocal = importLazy(require2);
        return importLazyLocal(moduleName);
      }
      static resolveModule(options) {
        const { modulePath, baseFolderPath, includeSystemModules, allowSelfReference } = options;
        if (path.isAbsolute(modulePath)) {
          return modulePath;
        }
        const normalizedRootPath = FileSystem_1.FileSystem.getRealPath(baseFolderPath);
        if (modulePath.startsWith(".")) {
          return path.resolve(normalizedRootPath, modulePath);
        }
        if (includeSystemModules === true && Import._builtInModules.has(modulePath)) {
          return modulePath;
        }
        if (allowSelfReference === true) {
          const ownPackage = Import._getPackageName(baseFolderPath);
          if (ownPackage && modulePath.startsWith(ownPackage.packageName)) {
            const packagePath = modulePath.substr(ownPackage.packageName.length + 1);
            return path.resolve(ownPackage.packageRootPath, packagePath);
          }
        }
        try {
          return Resolve.sync(
            includeSystemModules !== true && modulePath.indexOf("/") === -1 ? `${modulePath}/` : modulePath,
            {
              basedir: normalizedRootPath,
              preserveSymlinks: false
            }
          );
        } catch (e) {
          throw new Error(`Cannot find module "${modulePath}" from "${options.baseFolderPath}".`);
        }
      }
      static resolvePackage(options) {
        const { packageName, includeSystemModules, baseFolderPath, allowSelfReference } = options;
        if (includeSystemModules && Import._builtInModules.has(packageName)) {
          return packageName;
        }
        const normalizedRootPath = FileSystem_1.FileSystem.getRealPath(baseFolderPath);
        if (allowSelfReference) {
          const ownPackage = Import._getPackageName(baseFolderPath);
          if (ownPackage && ownPackage.packageName === packageName) {
            return ownPackage.packageRootPath;
          }
        }
        PackageName_1.PackageName.parse(packageName);
        try {
          const resolvedPath = Resolve.sync(`${packageName}/`, {
            basedir: normalizedRootPath,
            preserveSymlinks: false,
            packageFilter: (pkg, pkgFile, dir) => {
              pkg.main = "package.json";
              return pkg;
            }
          });
          const packagePath = path.dirname(resolvedPath);
          return packagePath;
        } catch (_a) {
          throw new Error(`Cannot find package "${packageName}" from "${baseFolderPath}".`);
        }
      }
      static _getPackageName(rootPath) {
        const packageJsonPath = PackageJsonLookup_1.PackageJsonLookup.instance.tryGetPackageJsonFilePathFor(rootPath);
        if (packageJsonPath) {
          const packageJson = PackageJsonLookup_1.PackageJsonLookup.instance.loadPackageJson(packageJsonPath);
          return {
            packageRootPath: path.dirname(packageJsonPath),
            packageName: packageJson.name
          };
        } else {
          return void 0;
        }
      }
    };
    exports.Import = Import;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/z-schema@5.0.5/node_modules/z-schema/dist/ZSchema-browser-min.js
var require_ZSchema_browser_min = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/z-schema@5.0.5/node_modules/z-schema/dist/ZSchema-browser-min.js"(exports, module2) {
    !function(e) {
      if ("object" == typeof exports && "undefined" != typeof module2)
        module2.exports = e();
      else if ("function" == typeof define && define.amd)
        define([], e);
      else {
        ("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).ZSchema = e();
      }
    }(function() {
      return function a(o, s, l) {
        function u(t, e2) {
          if (!s[t]) {
            if (!o[t]) {
              var r = "function" == typeof require && require;
              if (!e2 && r)
                return r(t, true);
              if (d)
                return d(t, true);
              var i = new Error("Cannot find module '" + t + "'");
              throw i.code = "MODULE_NOT_FOUND", i;
            }
            var n = s[t] = { exports: {} };
            o[t][0].call(n.exports, function(e3) {
              return u(o[t][1][e3] || e3);
            }, n, n.exports, a, o, s, l);
          }
          return s[t].exports;
        }
        for (var d = "function" == typeof require && require, e = 0; e < l.length; e++)
          u(l[e]);
        return u;
      }({ 1: [function(e, W, t) {
        (function(H) {
          (function() {
            var e2 = "Expected a function", i = "__lodash_hash_undefined__", r = 1 / 0, n = "[object Function]", a = "[object GeneratorFunction]", o = "[object Symbol]", s = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, l = /^\w*$/, u = /^\./, d = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, f = /\\(\\)?/g, c = /^\[object .+?Constructor\]$/, t2 = "object" == typeof H && H && H.Object === Object && H, p = "object" == typeof self && self && self.Object === Object && self, h = t2 || p || Function("return this")();
            var m, v = Array.prototype, _ = Function.prototype, g = Object.prototype, y = h["__core-js_shared__"], E = (m = /[^.]+$/.exec(y && y.keys && y.keys.IE_PROTO || "")) ? "Symbol(src)_1." + m : "", A = _.toString, S = g.hasOwnProperty, b = g.toString, O = RegExp("^" + A.call(S).replace(/[\\^$.*+?()[\]{}|]/g, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"), M = h.Symbol, I = v.splice, R = w(h, "Map"), $ = w(Object, "create"), P = M ? M.prototype : void 0, T = P ? P.toString : void 0;
            function D(e3) {
              var t3 = -1, r2 = e3 ? e3.length : 0;
              for (this.clear(); ++t3 < r2; ) {
                var i2 = e3[t3];
                this.set(i2[0], i2[1]);
              }
            }
            function L(e3) {
              var t3 = -1, r2 = e3 ? e3.length : 0;
              for (this.clear(); ++t3 < r2; ) {
                var i2 = e3[t3];
                this.set(i2[0], i2[1]);
              }
            }
            function C(e3) {
              var t3 = -1, r2 = e3 ? e3.length : 0;
              for (this.clear(); ++t3 < r2; ) {
                var i2 = e3[t3];
                this.set(i2[0], i2[1]);
              }
            }
            function x(e3, t3) {
              for (var r2, i2, n2 = e3.length; n2--; )
                if ((r2 = e3[n2][0]) === (i2 = t3) || r2 != r2 && i2 != i2)
                  return n2;
              return -1;
            }
            function N(e3, t3) {
              for (var r2, i2 = 0, n2 = (t3 = function(e4, t4) {
                if (Y(e4))
                  return false;
                var r3 = typeof e4;
                if ("number" == r3 || "symbol" == r3 || "boolean" == r3 || null == e4 || G(e4))
                  return true;
                return l.test(e4) || !s.test(e4) || null != t4 && e4 in Object(t4);
              }(t3, e3) ? [t3] : Y(r2 = t3) ? r2 : U(r2)).length; null != e3 && i2 < n2; )
                e3 = e3[j(t3[i2++])];
              return i2 && i2 == n2 ? e3 : void 0;
            }
            function B(e3) {
              return !(!K(e3) || (t3 = e3, E && E in t3)) && ((i2 = K(r2 = e3) ? b.call(r2) : "") == n || i2 == a || function(e4) {
                var t4 = false;
                if (null != e4 && "function" != typeof e4.toString)
                  try {
                    t4 = !!(e4 + "");
                  } catch (e5) {
                  }
                return t4;
              }(e3) ? O : c).test(function(e4) {
                if (null != e4) {
                  try {
                    return A.call(e4);
                  } catch (e5) {
                  }
                  try {
                    return e4 + "";
                  } catch (e5) {
                  }
                }
                return "";
              }(e3));
              var t3, r2, i2;
            }
            function F(e3, t3) {
              var r2, i2, n2 = e3.__data__;
              return ("string" == (i2 = typeof (r2 = t3)) || "number" == i2 || "symbol" == i2 || "boolean" == i2 ? "__proto__" !== r2 : null === r2) ? n2["string" == typeof t3 ? "string" : "hash"] : n2.map;
            }
            function w(e3, t3) {
              var r2, i2, n2 = (i2 = t3, null == (r2 = e3) ? void 0 : r2[i2]);
              return B(n2) ? n2 : void 0;
            }
            D.prototype.clear = function() {
              this.__data__ = $ ? $(null) : {};
            }, D.prototype.delete = function(e3) {
              return this.has(e3) && delete this.__data__[e3];
            }, D.prototype.get = function(e3) {
              var t3 = this.__data__;
              if ($) {
                var r2 = t3[e3];
                return r2 === i ? void 0 : r2;
              }
              return S.call(t3, e3) ? t3[e3] : void 0;
            }, D.prototype.has = function(e3) {
              var t3 = this.__data__;
              return $ ? void 0 !== t3[e3] : S.call(t3, e3);
            }, D.prototype.set = function(e3, t3) {
              return this.__data__[e3] = $ && void 0 === t3 ? i : t3, this;
            }, L.prototype.clear = function() {
              this.__data__ = [];
            }, L.prototype.delete = function(e3) {
              var t3 = this.__data__, r2 = x(t3, e3);
              return !(r2 < 0 || (r2 == t3.length - 1 ? t3.pop() : I.call(t3, r2, 1), 0));
            }, L.prototype.get = function(e3) {
              var t3 = this.__data__, r2 = x(t3, e3);
              return r2 < 0 ? void 0 : t3[r2][1];
            }, L.prototype.has = function(e3) {
              return -1 < x(this.__data__, e3);
            }, L.prototype.set = function(e3, t3) {
              var r2 = this.__data__, i2 = x(r2, e3);
              return i2 < 0 ? r2.push([e3, t3]) : r2[i2][1] = t3, this;
            }, C.prototype.clear = function() {
              this.__data__ = { hash: new D(), map: new (R || L)(), string: new D() };
            }, C.prototype.delete = function(e3) {
              return F(this, e3).delete(e3);
            }, C.prototype.get = function(e3) {
              return F(this, e3).get(e3);
            }, C.prototype.has = function(e3) {
              return F(this, e3).has(e3);
            }, C.prototype.set = function(e3, t3) {
              return F(this, e3).set(e3, t3), this;
            };
            var U = Z(function(e3) {
              var t3;
              e3 = null == (t3 = e3) ? "" : function(e4) {
                if ("string" == typeof e4)
                  return e4;
                if (G(e4))
                  return T ? T.call(e4) : "";
                var t4 = e4 + "";
                return "0" == t4 && 1 / e4 == -r ? "-0" : t4;
              }(t3);
              var n2 = [];
              return u.test(e3) && n2.push(""), e3.replace(d, function(e4, t4, r2, i2) {
                n2.push(r2 ? i2.replace(f, "$1") : t4 || e4);
              }), n2;
            });
            function j(e3) {
              if ("string" == typeof e3 || G(e3))
                return e3;
              var t3 = e3 + "";
              return "0" == t3 && 1 / e3 == -r ? "-0" : t3;
            }
            function Z(n2, a2) {
              if ("function" != typeof n2 || a2 && "function" != typeof a2)
                throw new TypeError(e2);
              var o2 = function() {
                var e3 = arguments, t3 = a2 ? a2.apply(this, e3) : e3[0], r2 = o2.cache;
                if (r2.has(t3))
                  return r2.get(t3);
                var i2 = n2.apply(this, e3);
                return o2.cache = r2.set(t3, i2), i2;
              };
              return o2.cache = new (Z.Cache || C)(), o2;
            }
            Z.Cache = C;
            var Y = Array.isArray;
            function K(e3) {
              var t3 = typeof e3;
              return !!e3 && ("object" == t3 || "function" == t3);
            }
            function G(e3) {
              return "symbol" == typeof e3 || !!(t3 = e3) && "object" == typeof t3 && b.call(e3) == o;
              var t3;
            }
            W.exports = function(e3, t3, r2) {
              var i2 = null == e3 ? void 0 : N(e3, t3);
              return void 0 === i2 ? r2 : i2;
            };
          }).call(this);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {}], 2: [function(e, Qe, et) {
        (function(Je) {
          (function() {
            var i = "__lodash_hash_undefined__", E = 1, _ = 2, r = 9007199254740991, g = "[object Arguments]", y = "[object Array]", n = "[object AsyncFunction]", A = "[object Boolean]", S = "[object Date]", b = "[object Error]", a = "[object Function]", o = "[object GeneratorFunction]", O = "[object Map]", M = "[object Number]", s = "[object Null]", I = "[object Object]", l = "[object Promise]", u = "[object Proxy]", R = "[object RegExp]", $ = "[object Set]", P = "[object String]", T = "[object Symbol]", d = "[object Undefined]", f = "[object WeakMap]", D = "[object ArrayBuffer]", L = "[object DataView]", c = /^\[object .+?Constructor\]$/, p = /^(?:0|[1-9]\d*)$/, t = {};
            t["[object Float32Array]"] = t["[object Float64Array]"] = t["[object Int8Array]"] = t["[object Int16Array]"] = t["[object Int32Array]"] = t["[object Uint8Array]"] = t["[object Uint8ClampedArray]"] = t["[object Uint16Array]"] = t["[object Uint32Array]"] = true, t[g] = t[y] = t[D] = t[A] = t[L] = t[S] = t[b] = t[a] = t[O] = t[M] = t[I] = t[R] = t[$] = t[P] = t[f] = false;
            var e2 = "object" == typeof Je && Je && Je.Object === Object && Je, h = "object" == typeof self && self && self.Object === Object && self, m = e2 || h || Function("return this")(), v = "object" == typeof et && et && !et.nodeType && et, C = v && "object" == typeof Qe && Qe && !Qe.nodeType && Qe, x = C && C.exports === v, N = x && e2.process, B = function() {
              try {
                return N && N.binding && N.binding("util");
              } catch (e3) {
              }
            }(), F = B && B.isTypedArray;
            function w(e3, t2) {
              for (var r2 = -1, i2 = null == e3 ? 0 : e3.length; ++r2 < i2; )
                if (t2(e3[r2], r2, e3))
                  return true;
              return false;
            }
            function U(e3) {
              var r2 = -1, i2 = Array(e3.size);
              return e3.forEach(function(e4, t2) {
                i2[++r2] = [t2, e4];
              }), i2;
            }
            function j(e3) {
              var t2 = -1, r2 = Array(e3.size);
              return e3.forEach(function(e4) {
                r2[++t2] = e4;
              }), r2;
            }
            var Z, Y, K, G = Array.prototype, H = Function.prototype, W = Object.prototype, k = m["__core-js_shared__"], V = H.toString, X = W.hasOwnProperty, z = (Z = /[^.]+$/.exec(k && k.keys && k.keys.IE_PROTO || "")) ? "Symbol(src)_1." + Z : "", q = W.toString, J = RegExp("^" + V.call(X).replace(/[\\^$.*+?()[\]{}|]/g, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"), Q = x ? m.Buffer : void 0, ee = m.Symbol, te = m.Uint8Array, re = W.propertyIsEnumerable, ie = G.splice, ne = ee ? ee.toStringTag : void 0, ae = Object.getOwnPropertySymbols, oe = Q ? Q.isBuffer : void 0, se = (Y = Object.keys, K = Object, function(e3) {
              return Y(K(e3));
            }), le = Be(m, "DataView"), ue = Be(m, "Map"), de = Be(m, "Promise"), fe = Be(m, "Set"), ce = Be(m, "WeakMap"), pe = Be(Object, "create"), he = je(le), me = je(ue), ve = je(de), _e = je(fe), ge = je(ce), ye = ee ? ee.prototype : void 0, Ee = ye ? ye.valueOf : void 0;
            function Ae(e3) {
              var t2 = -1, r2 = null == e3 ? 0 : e3.length;
              for (this.clear(); ++t2 < r2; ) {
                var i2 = e3[t2];
                this.set(i2[0], i2[1]);
              }
            }
            function Se(e3) {
              var t2 = -1, r2 = null == e3 ? 0 : e3.length;
              for (this.clear(); ++t2 < r2; ) {
                var i2 = e3[t2];
                this.set(i2[0], i2[1]);
              }
            }
            function be(e3) {
              var t2 = -1, r2 = null == e3 ? 0 : e3.length;
              for (this.clear(); ++t2 < r2; ) {
                var i2 = e3[t2];
                this.set(i2[0], i2[1]);
              }
            }
            function Oe(e3) {
              var t2 = -1, r2 = null == e3 ? 0 : e3.length;
              for (this.__data__ = new be(); ++t2 < r2; )
                this.add(e3[t2]);
            }
            function Me(e3) {
              var t2 = this.__data__ = new Se(e3);
              this.size = t2.size;
            }
            function Ie(e3, t2) {
              var r2 = Ke(e3), i2 = !r2 && Ye(e3), n2 = !r2 && !i2 && Ge(e3), a2 = !r2 && !i2 && !n2 && ze(e3), o2 = r2 || i2 || n2 || a2, s2 = o2 ? function(e4, t3) {
                for (var r3 = -1, i3 = Array(e4); ++r3 < e4; )
                  i3[r3] = t3(r3);
                return i3;
              }(e3.length, String) : [], l2 = s2.length;
              for (var u2 in e3)
                !t2 && !X.call(e3, u2) || o2 && ("length" == u2 || n2 && ("offset" == u2 || "parent" == u2) || a2 && ("buffer" == u2 || "byteLength" == u2 || "byteOffset" == u2) || Ue(u2, l2)) || s2.push(u2);
              return s2;
            }
            function Re(e3, t2) {
              for (var r2 = e3.length; r2--; )
                if (Ze(e3[r2][0], t2))
                  return r2;
              return -1;
            }
            function $e(e3) {
              return null == e3 ? void 0 === e3 ? d : s : ne && ne in Object(e3) ? function(e4) {
                var t3 = X.call(e4, ne), r2 = e4[ne];
                try {
                  var i2 = !(e4[ne] = void 0);
                } catch (e5) {
                }
                var n2 = q.call(e4);
                i2 && (t3 ? e4[ne] = r2 : delete e4[ne]);
                return n2;
              }(e3) : (t2 = e3, q.call(t2));
              var t2;
            }
            function Pe(e3) {
              return Ve(e3) && $e(e3) == g;
            }
            function Te(e3, t2, r2, i2, n2) {
              return e3 === t2 || (null == e3 || null == t2 || !Ve(e3) && !Ve(t2) ? e3 != e3 && t2 != t2 : function(e4, t3, r3, i3, n3, a2) {
                var o2 = Ke(e4), s2 = Ke(t3), l2 = o2 ? y : we(e4), u2 = s2 ? y : we(t3), d2 = (l2 = l2 == g ? I : l2) == I, f2 = (u2 = u2 == g ? I : u2) == I, c2 = l2 == u2;
                if (c2 && Ge(e4)) {
                  if (!Ge(t3))
                    return false;
                  d2 = !(o2 = true);
                }
                if (c2 && !d2)
                  return a2 || (a2 = new Me()), o2 || ze(e4) ? Ce(e4, t3, r3, i3, n3, a2) : function(e5, t4, r4, i4, n4, a3, o3) {
                    switch (r4) {
                      case L:
                        if (e5.byteLength != t4.byteLength || e5.byteOffset != t4.byteOffset)
                          return false;
                        e5 = e5.buffer, t4 = t4.buffer;
                      case D:
                        return !(e5.byteLength != t4.byteLength || !a3(new te(e5), new te(t4)));
                      case A:
                      case S:
                      case M:
                        return Ze(+e5, +t4);
                      case b:
                        return e5.name == t4.name && e5.message == t4.message;
                      case R:
                      case P:
                        return e5 == t4 + "";
                      case O:
                        var s3 = U;
                      case $:
                        var l3 = i4 & E;
                        if (s3 || (s3 = j), e5.size != t4.size && !l3)
                          return false;
                        var u3 = o3.get(e5);
                        if (u3)
                          return u3 == t4;
                        i4 |= _, o3.set(e5, t4);
                        var d3 = Ce(s3(e5), s3(t4), i4, n4, a3, o3);
                        return o3.delete(e5), d3;
                      case T:
                        if (Ee)
                          return Ee.call(e5) == Ee.call(t4);
                    }
                    return false;
                  }(e4, t3, l2, r3, i3, n3, a2);
                if (!(r3 & E)) {
                  var p2 = d2 && X.call(e4, "__wrapped__"), h2 = f2 && X.call(t3, "__wrapped__");
                  if (p2 || h2) {
                    var m2 = p2 ? e4.value() : e4, v2 = h2 ? t3.value() : t3;
                    return a2 || (a2 = new Me()), n3(m2, v2, r3, i3, a2);
                  }
                }
                return !!c2 && (a2 || (a2 = new Me()), function(e5, t4, r4, i4, n4, a3) {
                  var o3 = r4 & E, s3 = xe(e5), l3 = s3.length, u3 = xe(t4).length;
                  if (l3 != u3 && !o3)
                    return false;
                  for (var d3 = l3; d3--; ) {
                    var f3 = s3[d3];
                    if (!(o3 ? f3 in t4 : X.call(t4, f3)))
                      return false;
                  }
                  var c3 = a3.get(e5);
                  if (c3 && a3.get(t4))
                    return c3 == t4;
                  var p3 = true;
                  a3.set(e5, t4), a3.set(t4, e5);
                  for (var h3 = o3; ++d3 < l3; ) {
                    f3 = s3[d3];
                    var m3 = e5[f3], v3 = t4[f3];
                    if (i4)
                      var _2 = o3 ? i4(v3, m3, f3, t4, e5, a3) : i4(m3, v3, f3, e5, t4, a3);
                    if (!(void 0 === _2 ? m3 === v3 || n4(m3, v3, r4, i4, a3) : _2)) {
                      p3 = false;
                      break;
                    }
                    h3 || (h3 = "constructor" == f3);
                  }
                  if (p3 && !h3) {
                    var g2 = e5.constructor, y2 = t4.constructor;
                    g2 != y2 && "constructor" in e5 && "constructor" in t4 && !("function" == typeof g2 && g2 instanceof g2 && "function" == typeof y2 && y2 instanceof y2) && (p3 = false);
                  }
                  return a3.delete(e5), a3.delete(t4), p3;
                }(e4, t3, r3, i3, n3, a2));
              }(e3, t2, r2, i2, Te, n2));
            }
            function De(e3) {
              return !(!ke(e3) || (t2 = e3, z && z in t2)) && (He(e3) ? J : c).test(je(e3));
              var t2;
            }
            function Le(e3) {
              if (r2 = (t2 = e3) && t2.constructor, i2 = "function" == typeof r2 && r2.prototype || W, t2 !== i2)
                return se(e3);
              var t2, r2, i2, n2 = [];
              for (var a2 in Object(e3))
                X.call(e3, a2) && "constructor" != a2 && n2.push(a2);
              return n2;
            }
            function Ce(e3, t2, i2, n2, a2, o2) {
              var r2 = i2 & E, s2 = e3.length, l2 = t2.length;
              if (s2 != l2 && !(r2 && s2 < l2))
                return false;
              var u2 = o2.get(e3);
              if (u2 && o2.get(t2))
                return u2 == t2;
              var d2 = -1, f2 = true, c2 = i2 & _ ? new Oe() : void 0;
              for (o2.set(e3, t2), o2.set(t2, e3); ++d2 < s2; ) {
                var p2 = e3[d2], h2 = t2[d2];
                if (n2)
                  var m2 = r2 ? n2(h2, p2, d2, t2, e3, o2) : n2(p2, h2, d2, e3, t2, o2);
                if (void 0 !== m2) {
                  if (m2)
                    continue;
                  f2 = false;
                  break;
                }
                if (c2) {
                  if (!w(t2, function(e4, t3) {
                    if (r3 = t3, !c2.has(r3) && (p2 === e4 || a2(p2, e4, i2, n2, o2)))
                      return c2.push(t3);
                    var r3;
                  })) {
                    f2 = false;
                    break;
                  }
                } else if (p2 !== h2 && !a2(p2, h2, i2, n2, o2)) {
                  f2 = false;
                  break;
                }
              }
              return o2.delete(e3), o2.delete(t2), f2;
            }
            function xe(e3) {
              return r2 = Fe, i2 = qe(t2 = e3), Ke(t2) ? i2 : function(e4, t3) {
                for (var r3 = -1, i3 = t3.length, n2 = e4.length; ++r3 < i3; )
                  e4[n2 + r3] = t3[r3];
                return e4;
              }(i2, r2(t2));
              var t2, r2, i2;
            }
            function Ne(e3, t2) {
              var r2, i2, n2 = e3.__data__;
              return ("string" == (i2 = typeof (r2 = t2)) || "number" == i2 || "symbol" == i2 || "boolean" == i2 ? "__proto__" !== r2 : null === r2) ? n2["string" == typeof t2 ? "string" : "hash"] : n2.map;
            }
            function Be(e3, t2) {
              var r2, i2, n2 = (i2 = t2, null == (r2 = e3) ? void 0 : r2[i2]);
              return De(n2) ? n2 : void 0;
            }
            Ae.prototype.clear = function() {
              this.__data__ = pe ? pe(null) : {}, this.size = 0;
            }, Ae.prototype.delete = function(e3) {
              var t2 = this.has(e3) && delete this.__data__[e3];
              return this.size -= t2 ? 1 : 0, t2;
            }, Ae.prototype.get = function(e3) {
              var t2 = this.__data__;
              if (pe) {
                var r2 = t2[e3];
                return r2 === i ? void 0 : r2;
              }
              return X.call(t2, e3) ? t2[e3] : void 0;
            }, Ae.prototype.has = function(e3) {
              var t2 = this.__data__;
              return pe ? void 0 !== t2[e3] : X.call(t2, e3);
            }, Ae.prototype.set = function(e3, t2) {
              var r2 = this.__data__;
              return this.size += this.has(e3) ? 0 : 1, r2[e3] = pe && void 0 === t2 ? i : t2, this;
            }, Se.prototype.clear = function() {
              this.__data__ = [], this.size = 0;
            }, Se.prototype.delete = function(e3) {
              var t2 = this.__data__, r2 = Re(t2, e3);
              return !(r2 < 0 || (r2 == t2.length - 1 ? t2.pop() : ie.call(t2, r2, 1), --this.size, 0));
            }, Se.prototype.get = function(e3) {
              var t2 = this.__data__, r2 = Re(t2, e3);
              return r2 < 0 ? void 0 : t2[r2][1];
            }, Se.prototype.has = function(e3) {
              return -1 < Re(this.__data__, e3);
            }, Se.prototype.set = function(e3, t2) {
              var r2 = this.__data__, i2 = Re(r2, e3);
              return i2 < 0 ? (++this.size, r2.push([e3, t2])) : r2[i2][1] = t2, this;
            }, be.prototype.clear = function() {
              this.size = 0, this.__data__ = { hash: new Ae(), map: new (ue || Se)(), string: new Ae() };
            }, be.prototype.delete = function(e3) {
              var t2 = Ne(this, e3).delete(e3);
              return this.size -= t2 ? 1 : 0, t2;
            }, be.prototype.get = function(e3) {
              return Ne(this, e3).get(e3);
            }, be.prototype.has = function(e3) {
              return Ne(this, e3).has(e3);
            }, be.prototype.set = function(e3, t2) {
              var r2 = Ne(this, e3), i2 = r2.size;
              return r2.set(e3, t2), this.size += r2.size == i2 ? 0 : 1, this;
            }, Oe.prototype.add = Oe.prototype.push = function(e3) {
              return this.__data__.set(e3, i), this;
            }, Oe.prototype.has = function(e3) {
              return this.__data__.has(e3);
            }, Me.prototype.clear = function() {
              this.__data__ = new Se(), this.size = 0;
            }, Me.prototype.delete = function(e3) {
              var t2 = this.__data__, r2 = t2.delete(e3);
              return this.size = t2.size, r2;
            }, Me.prototype.get = function(e3) {
              return this.__data__.get(e3);
            }, Me.prototype.has = function(e3) {
              return this.__data__.has(e3);
            }, Me.prototype.set = function(e3, t2) {
              var r2 = this.__data__;
              if (r2 instanceof Se) {
                var i2 = r2.__data__;
                if (!ue || i2.length < 199)
                  return i2.push([e3, t2]), this.size = ++r2.size, this;
                r2 = this.__data__ = new be(i2);
              }
              return r2.set(e3, t2), this.size = r2.size, this;
            };
            var Fe = ae ? function(t2) {
              return null == t2 ? [] : (t2 = Object(t2), function(e3, t3) {
                for (var r2 = -1, i2 = null == e3 ? 0 : e3.length, n2 = 0, a2 = []; ++r2 < i2; ) {
                  var o2 = e3[r2];
                  t3(o2, r2, e3) && (a2[n2++] = o2);
                }
                return a2;
              }(ae(t2), function(e3) {
                return re.call(t2, e3);
              }));
            } : function() {
              return [];
            }, we = $e;
            function Ue(e3, t2) {
              return !!(t2 = null == t2 ? r : t2) && ("number" == typeof e3 || p.test(e3)) && -1 < e3 && e3 % 1 == 0 && e3 < t2;
            }
            function je(e3) {
              if (null != e3) {
                try {
                  return V.call(e3);
                } catch (e4) {
                }
                try {
                  return e3 + "";
                } catch (e4) {
                }
              }
              return "";
            }
            function Ze(e3, t2) {
              return e3 === t2 || e3 != e3 && t2 != t2;
            }
            (le && we(new le(new ArrayBuffer(1))) != L || ue && we(new ue()) != O || de && we(de.resolve()) != l || fe && we(new fe()) != $ || ce && we(new ce()) != f) && (we = function(e3) {
              var t2 = $e(e3), r2 = t2 == I ? e3.constructor : void 0, i2 = r2 ? je(r2) : "";
              if (i2)
                switch (i2) {
                  case he:
                    return L;
                  case me:
                    return O;
                  case ve:
                    return l;
                  case _e:
                    return $;
                  case ge:
                    return f;
                }
              return t2;
            });
            var Ye = Pe(function() {
              return arguments;
            }()) ? Pe : function(e3) {
              return Ve(e3) && X.call(e3, "callee") && !re.call(e3, "callee");
            }, Ke = Array.isArray;
            var Ge = oe || function() {
              return false;
            };
            function He(e3) {
              if (!ke(e3))
                return false;
              var t2 = $e(e3);
              return t2 == a || t2 == o || t2 == n || t2 == u;
            }
            function We(e3) {
              return "number" == typeof e3 && -1 < e3 && e3 % 1 == 0 && e3 <= r;
            }
            function ke(e3) {
              var t2 = typeof e3;
              return null != e3 && ("object" == t2 || "function" == t2);
            }
            function Ve(e3) {
              return null != e3 && "object" == typeof e3;
            }
            var Xe, ze = F ? (Xe = F, function(e3) {
              return Xe(e3);
            }) : function(e3) {
              return Ve(e3) && We(e3.length) && !!t[$e(e3)];
            };
            function qe(e3) {
              return null != (t2 = e3) && We(t2.length) && !He(t2) ? Ie(e3) : Le(e3);
              var t2;
            }
            Qe.exports = function(e3, t2) {
              return Te(e3, t2);
            };
          }).call(this);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {}], 3: [function(e, t, r) {
        var i, n, a = t.exports = {};
        function o() {
          throw new Error("setTimeout has not been defined");
        }
        function s() {
          throw new Error("clearTimeout has not been defined");
        }
        function l(t2) {
          if (i === setTimeout)
            return setTimeout(t2, 0);
          if ((i === o || !i) && setTimeout)
            return i = setTimeout, setTimeout(t2, 0);
          try {
            return i(t2, 0);
          } catch (e2) {
            try {
              return i.call(null, t2, 0);
            } catch (e3) {
              return i.call(this, t2, 0);
            }
          }
        }
        !function() {
          try {
            i = "function" == typeof setTimeout ? setTimeout : o;
          } catch (e2) {
            i = o;
          }
          try {
            n = "function" == typeof clearTimeout ? clearTimeout : s;
          } catch (e2) {
            n = s;
          }
        }();
        var u, d = [], f = false, c = -1;
        function p() {
          f && u && (f = false, u.length ? d = u.concat(d) : c = -1, d.length && h());
        }
        function h() {
          if (!f) {
            var e2 = l(p);
            f = true;
            for (var t2 = d.length; t2; ) {
              for (u = d, d = []; ++c < t2; )
                u && u[c].run();
              c = -1, t2 = d.length;
            }
            u = null, f = false, function(t3) {
              if (n === clearTimeout)
                return clearTimeout(t3);
              if ((n === s || !n) && clearTimeout)
                return n = clearTimeout, clearTimeout(t3);
              try {
                n(t3);
              } catch (e3) {
                try {
                  return n.call(null, t3);
                } catch (e4) {
                  return n.call(this, t3);
                }
              }
            }(e2);
          }
        }
        function m(e2, t2) {
          this.fun = e2, this.array = t2;
        }
        function v() {
        }
        a.nextTick = function(e2) {
          var t2 = new Array(arguments.length - 1);
          if (1 < arguments.length)
            for (var r2 = 1; r2 < arguments.length; r2++)
              t2[r2 - 1] = arguments[r2];
          d.push(new m(e2, t2)), 1 !== d.length || f || l(h);
        }, m.prototype.run = function() {
          this.fun.apply(null, this.array);
        }, a.title = "browser", a.browser = true, a.env = {}, a.argv = [], a.version = "", a.versions = {}, a.on = v, a.addListener = v, a.once = v, a.off = v, a.removeListener = v, a.removeAllListeners = v, a.emit = v, a.prependListener = v, a.prependOnceListener = v, a.listeners = function(e2) {
          return [];
        }, a.binding = function(e2) {
          throw new Error("process.binding is not supported");
        }, a.cwd = function() {
          return "/";
        }, a.chdir = function(e2) {
          throw new Error("process.chdir is not supported");
        }, a.umask = function() {
          return 0;
        };
      }, {}], 4: [function(e, t, r) {
        "use strict";
        function o(e2) {
          return (o = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e3) {
            return typeof e3;
          } : function(e3) {
            return e3 && "function" == typeof Symbol && e3.constructor === Symbol && e3 !== Symbol.prototype ? "symbol" : typeof e3;
          })(e2);
        }
        Object.defineProperty(r, "__esModule", { value: true }), r.default = void 0;
        var i = He(e("./lib/toDate")), n = He(e("./lib/toFloat")), a = He(e("./lib/toInt")), s = He(e("./lib/toBoolean")), l = He(e("./lib/equals")), u = He(e("./lib/contains")), d = He(e("./lib/matches")), f = He(e("./lib/isEmail")), c = He(e("./lib/isURL")), p = He(e("./lib/isMACAddress")), h = He(e("./lib/isIP")), m = He(e("./lib/isIPRange")), v = He(e("./lib/isFQDN")), _ = He(e("./lib/isDate")), g = He(e("./lib/isBoolean")), y = He(e("./lib/isLocale")), E = Ge(e("./lib/isAlpha")), A = Ge(e("./lib/isAlphanumeric")), S = He(e("./lib/isNumeric")), b = He(e("./lib/isPassportNumber")), O = He(e("./lib/isPort")), M = He(e("./lib/isLowercase")), I = He(e("./lib/isUppercase")), R = He(e("./lib/isIMEI")), $ = He(e("./lib/isAscii")), P = He(e("./lib/isFullWidth")), T = He(e("./lib/isHalfWidth")), D = He(e("./lib/isVariableWidth")), L = He(e("./lib/isMultibyte")), C = He(e("./lib/isSemVer")), x = He(e("./lib/isSurrogatePair")), N = He(e("./lib/isInt")), B = Ge(e("./lib/isFloat")), F = He(e("./lib/isDecimal")), w = He(e("./lib/isHexadecimal")), U = He(e("./lib/isOctal")), j = He(e("./lib/isDivisibleBy")), Z = He(e("./lib/isHexColor")), Y = He(e("./lib/isRgbColor")), K = He(e("./lib/isHSL")), G = He(e("./lib/isISRC")), H = Ge(e("./lib/isIBAN")), W = He(e("./lib/isBIC")), k = He(e("./lib/isMD5")), V = He(e("./lib/isHash")), X = He(e("./lib/isJWT")), z = He(e("./lib/isJSON")), q = He(e("./lib/isEmpty")), J = He(e("./lib/isLength")), Q = He(e("./lib/isByteLength")), ee = He(e("./lib/isUUID")), te = He(e("./lib/isMongoId")), re = He(e("./lib/isAfter")), ie = He(e("./lib/isBefore")), ne = He(e("./lib/isIn")), ae = He(e("./lib/isCreditCard")), oe = He(e("./lib/isIdentityCard")), se = He(e("./lib/isEAN")), le = He(e("./lib/isISIN")), ue = He(e("./lib/isISBN")), de = He(e("./lib/isISSN")), fe = He(e("./lib/isTaxID")), ce = Ge(e("./lib/isMobilePhone")), pe = He(e("./lib/isEthereumAddress")), he = He(e("./lib/isCurrency")), me = He(e("./lib/isBtcAddress")), ve = He(e("./lib/isISO8601")), _e = He(e("./lib/isRFC3339")), ge = He(e("./lib/isISO31661Alpha2")), ye = He(e("./lib/isISO31661Alpha3")), Ee = He(e("./lib/isISO4217")), Ae = He(e("./lib/isBase32")), Se = He(e("./lib/isBase58")), be = He(e("./lib/isBase64")), Oe = He(e("./lib/isDataURI")), Me = He(e("./lib/isMagnetURI")), Ie = He(e("./lib/isMimeType")), Re = He(e("./lib/isLatLong")), $e = Ge(e("./lib/isPostalCode")), Pe = He(e("./lib/ltrim")), Te = He(e("./lib/rtrim")), De = He(e("./lib/trim")), Le = He(e("./lib/escape")), Ce = He(e("./lib/unescape")), xe = He(e("./lib/stripLow")), Ne = He(e("./lib/whitelist")), Be = He(e("./lib/blacklist")), Fe = He(e("./lib/isWhitelisted")), we = He(e("./lib/normalizeEmail")), Ue = He(e("./lib/isSlug")), je = He(e("./lib/isLicensePlate")), Ze = He(e("./lib/isStrongPassword")), Ye = He(e("./lib/isVAT"));
        function Ke() {
          if ("function" != typeof WeakMap)
            return null;
          var e2 = /* @__PURE__ */ new WeakMap();
          return Ke = function() {
            return e2;
          }, e2;
        }
        function Ge(e2) {
          if (e2 && e2.__esModule)
            return e2;
          if (null === e2 || "object" !== o(e2) && "function" != typeof e2)
            return { default: e2 };
          var t2 = Ke();
          if (t2 && t2.has(e2))
            return t2.get(e2);
          var r2 = {}, i2 = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var n2 in e2)
            if (Object.prototype.hasOwnProperty.call(e2, n2)) {
              var a2 = i2 ? Object.getOwnPropertyDescriptor(e2, n2) : null;
              a2 && (a2.get || a2.set) ? Object.defineProperty(r2, n2, a2) : r2[n2] = e2[n2];
            }
          return r2.default = e2, t2 && t2.set(e2, r2), r2;
        }
        function He(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        var We = { version: "13.7.0", toDate: i.default, toFloat: n.default, toInt: a.default, toBoolean: s.default, equals: l.default, contains: u.default, matches: d.default, isEmail: f.default, isURL: c.default, isMACAddress: p.default, isIP: h.default, isIPRange: m.default, isFQDN: v.default, isBoolean: g.default, isIBAN: H.default, isBIC: W.default, isAlpha: E.default, isAlphaLocales: E.locales, isAlphanumeric: A.default, isAlphanumericLocales: A.locales, isNumeric: S.default, isPassportNumber: b.default, isPort: O.default, isLowercase: M.default, isUppercase: I.default, isAscii: $.default, isFullWidth: P.default, isHalfWidth: T.default, isVariableWidth: D.default, isMultibyte: L.default, isSemVer: C.default, isSurrogatePair: x.default, isInt: N.default, isIMEI: R.default, isFloat: B.default, isFloatLocales: B.locales, isDecimal: F.default, isHexadecimal: w.default, isOctal: U.default, isDivisibleBy: j.default, isHexColor: Z.default, isRgbColor: Y.default, isHSL: K.default, isISRC: G.default, isMD5: k.default, isHash: V.default, isJWT: X.default, isJSON: z.default, isEmpty: q.default, isLength: J.default, isLocale: y.default, isByteLength: Q.default, isUUID: ee.default, isMongoId: te.default, isAfter: re.default, isBefore: ie.default, isIn: ne.default, isCreditCard: ae.default, isIdentityCard: oe.default, isEAN: se.default, isISIN: le.default, isISBN: ue.default, isISSN: de.default, isMobilePhone: ce.default, isMobilePhoneLocales: ce.locales, isPostalCode: $e.default, isPostalCodeLocales: $e.locales, isEthereumAddress: pe.default, isCurrency: he.default, isBtcAddress: me.default, isISO8601: ve.default, isRFC3339: _e.default, isISO31661Alpha2: ge.default, isISO31661Alpha3: ye.default, isISO4217: Ee.default, isBase32: Ae.default, isBase58: Se.default, isBase64: be.default, isDataURI: Oe.default, isMagnetURI: Me.default, isMimeType: Ie.default, isLatLong: Re.default, ltrim: Pe.default, rtrim: Te.default, trim: De.default, escape: Le.default, unescape: Ce.default, stripLow: xe.default, whitelist: Ne.default, blacklist: Be.default, isWhitelisted: Fe.default, normalizeEmail: we.default, toString, isSlug: Ue.default, isStrongPassword: Ze.default, isTaxID: fe.default, isDate: _.default, isLicensePlate: je.default, isVAT: Ye.default, ibanLocales: H.locales };
        r.default = We, t.exports = r.default, t.exports.default = r.default;
      }, { "./lib/blacklist": 6, "./lib/contains": 7, "./lib/equals": 8, "./lib/escape": 9, "./lib/isAfter": 10, "./lib/isAlpha": 11, "./lib/isAlphanumeric": 12, "./lib/isAscii": 13, "./lib/isBIC": 14, "./lib/isBase32": 15, "./lib/isBase58": 16, "./lib/isBase64": 17, "./lib/isBefore": 18, "./lib/isBoolean": 19, "./lib/isBtcAddress": 20, "./lib/isByteLength": 21, "./lib/isCreditCard": 22, "./lib/isCurrency": 23, "./lib/isDataURI": 24, "./lib/isDate": 25, "./lib/isDecimal": 26, "./lib/isDivisibleBy": 27, "./lib/isEAN": 28, "./lib/isEmail": 29, "./lib/isEmpty": 30, "./lib/isEthereumAddress": 31, "./lib/isFQDN": 32, "./lib/isFloat": 33, "./lib/isFullWidth": 34, "./lib/isHSL": 35, "./lib/isHalfWidth": 36, "./lib/isHash": 37, "./lib/isHexColor": 38, "./lib/isHexadecimal": 39, "./lib/isIBAN": 40, "./lib/isIMEI": 41, "./lib/isIP": 42, "./lib/isIPRange": 43, "./lib/isISBN": 44, "./lib/isISIN": 45, "./lib/isISO31661Alpha2": 46, "./lib/isISO31661Alpha3": 47, "./lib/isISO4217": 48, "./lib/isISO8601": 49, "./lib/isISRC": 50, "./lib/isISSN": 51, "./lib/isIdentityCard": 52, "./lib/isIn": 53, "./lib/isInt": 54, "./lib/isJSON": 55, "./lib/isJWT": 56, "./lib/isLatLong": 57, "./lib/isLength": 58, "./lib/isLicensePlate": 59, "./lib/isLocale": 60, "./lib/isLowercase": 61, "./lib/isMACAddress": 62, "./lib/isMD5": 63, "./lib/isMagnetURI": 64, "./lib/isMimeType": 65, "./lib/isMobilePhone": 66, "./lib/isMongoId": 67, "./lib/isMultibyte": 68, "./lib/isNumeric": 69, "./lib/isOctal": 70, "./lib/isPassportNumber": 71, "./lib/isPort": 72, "./lib/isPostalCode": 73, "./lib/isRFC3339": 74, "./lib/isRgbColor": 75, "./lib/isSemVer": 76, "./lib/isSlug": 77, "./lib/isStrongPassword": 78, "./lib/isSurrogatePair": 79, "./lib/isTaxID": 80, "./lib/isURL": 81, "./lib/isUUID": 82, "./lib/isUppercase": 83, "./lib/isVAT": 84, "./lib/isVariableWidth": 85, "./lib/isWhitelisted": 86, "./lib/ltrim": 87, "./lib/matches": 88, "./lib/normalizeEmail": 89, "./lib/rtrim": 90, "./lib/stripLow": 91, "./lib/toBoolean": 92, "./lib/toDate": 93, "./lib/toFloat": 94, "./lib/toInt": 95, "./lib/trim": 96, "./lib/unescape": 97, "./lib/whitelist": 104 }], 5: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.commaDecimal = r.dotDecimal = r.farsiLocales = r.arabicLocales = r.englishLocales = r.decimal = r.alphanumeric = r.alpha = void 0;
        var i = { "en-US": /^[A-Z]+$/i, "az-AZ": /^[A-VXYZÇƏĞİıÖŞÜ]+$/i, "bg-BG": /^[А-Я]+$/i, "cs-CZ": /^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]+$/i, "da-DK": /^[A-ZÆØÅ]+$/i, "de-DE": /^[A-ZÄÖÜß]+$/i, "el-GR": /^[Α-ώ]+$/i, "es-ES": /^[A-ZÁÉÍÑÓÚÜ]+$/i, "fa-IR": /^[ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی]+$/i, "fi-FI": /^[A-ZÅÄÖ]+$/i, "fr-FR": /^[A-ZÀÂÆÇÉÈÊËÏÎÔŒÙÛÜŸ]+$/i, "it-IT": /^[A-ZÀÉÈÌÎÓÒÙ]+$/i, "nb-NO": /^[A-ZÆØÅ]+$/i, "nl-NL": /^[A-ZÁÉËÏÓÖÜÚ]+$/i, "nn-NO": /^[A-ZÆØÅ]+$/i, "hu-HU": /^[A-ZÁÉÍÓÖŐÚÜŰ]+$/i, "pl-PL": /^[A-ZĄĆĘŚŁŃÓŻŹ]+$/i, "pt-PT": /^[A-ZÃÁÀÂÄÇÉÊËÍÏÕÓÔÖÚÜ]+$/i, "ru-RU": /^[А-ЯЁ]+$/i, "sl-SI": /^[A-ZČĆĐŠŽ]+$/i, "sk-SK": /^[A-ZÁČĎÉÍŇÓŠŤÚÝŽĹŔĽÄÔ]+$/i, "sr-RS@latin": /^[A-ZČĆŽŠĐ]+$/i, "sr-RS": /^[А-ЯЂЈЉЊЋЏ]+$/i, "sv-SE": /^[A-ZÅÄÖ]+$/i, "th-TH": /^[ก-๐\s]+$/i, "tr-TR": /^[A-ZÇĞİıÖŞÜ]+$/i, "uk-UA": /^[А-ЩЬЮЯЄIЇҐі]+$/i, "vi-VN": /^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴĐÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸ]+$/i, "ku-IQ": /^[ئابپتجچحخدرڕزژسشعغفڤقکگلڵمنوۆھەیێيطؤثآإأكضصةظذ]+$/i, ar: /^[ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىيًٌٍَُِّْٰ]+$/, he: /^[א-ת]+$/, fa: /^['آاءأؤئبپتثجچحخدذرزژسشصضطظعغفقکگلمنوهةی']+$/i, "hi-IN": /^[\u0900-\u0961]+[\u0972-\u097F]*$/i };
        r.alpha = i;
        var n = { "en-US": /^[0-9A-Z]+$/i, "az-AZ": /^[0-9A-VXYZÇƏĞİıÖŞÜ]+$/i, "bg-BG": /^[0-9А-Я]+$/i, "cs-CZ": /^[0-9A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]+$/i, "da-DK": /^[0-9A-ZÆØÅ]+$/i, "de-DE": /^[0-9A-ZÄÖÜß]+$/i, "el-GR": /^[0-9Α-ω]+$/i, "es-ES": /^[0-9A-ZÁÉÍÑÓÚÜ]+$/i, "fi-FI": /^[0-9A-ZÅÄÖ]+$/i, "fr-FR": /^[0-9A-ZÀÂÆÇÉÈÊËÏÎÔŒÙÛÜŸ]+$/i, "it-IT": /^[0-9A-ZÀÉÈÌÎÓÒÙ]+$/i, "hu-HU": /^[0-9A-ZÁÉÍÓÖŐÚÜŰ]+$/i, "nb-NO": /^[0-9A-ZÆØÅ]+$/i, "nl-NL": /^[0-9A-ZÁÉËÏÓÖÜÚ]+$/i, "nn-NO": /^[0-9A-ZÆØÅ]+$/i, "pl-PL": /^[0-9A-ZĄĆĘŚŁŃÓŻŹ]+$/i, "pt-PT": /^[0-9A-ZÃÁÀÂÄÇÉÊËÍÏÕÓÔÖÚÜ]+$/i, "ru-RU": /^[0-9А-ЯЁ]+$/i, "sl-SI": /^[0-9A-ZČĆĐŠŽ]+$/i, "sk-SK": /^[0-9A-ZÁČĎÉÍŇÓŠŤÚÝŽĹŔĽÄÔ]+$/i, "sr-RS@latin": /^[0-9A-ZČĆŽŠĐ]+$/i, "sr-RS": /^[0-9А-ЯЂЈЉЊЋЏ]+$/i, "sv-SE": /^[0-9A-ZÅÄÖ]+$/i, "th-TH": /^[ก-๙\s]+$/i, "tr-TR": /^[0-9A-ZÇĞİıÖŞÜ]+$/i, "uk-UA": /^[0-9А-ЩЬЮЯЄIЇҐі]+$/i, "ku-IQ": /^[٠١٢٣٤٥٦٧٨٩0-9ئابپتجچحخدرڕزژسشعغفڤقکگلڵمنوۆھەیێيطؤثآإأكضصةظذ]+$/i, "vi-VN": /^[0-9A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴĐÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸ]+$/i, ar: /^[٠١٢٣٤٥٦٧٨٩0-9ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىيًٌٍَُِّْٰ]+$/, he: /^[0-9א-ת]+$/, fa: /^['0-9آاءأؤئبپتثجچحخدذرزژسشصضطظعغفقکگلمنوهةی۱۲۳۴۵۶۷۸۹۰']+$/i, "hi-IN": /^[\u0900-\u0963]+[\u0966-\u097F]*$/i };
        r.alphanumeric = n;
        var a = { "en-US": ".", ar: "\u066B" };
        r.decimal = a;
        var o = ["AU", "GB", "HK", "IN", "NZ", "ZA", "ZM"];
        r.englishLocales = o;
        for (var s, l = 0; l < o.length; l++)
          i[s = "en-".concat(o[l])] = i["en-US"], n[s] = n["en-US"], a[s] = a["en-US"];
        var u = ["AE", "BH", "DZ", "EG", "IQ", "JO", "KW", "LB", "LY", "MA", "QM", "QA", "SA", "SD", "SY", "TN", "YE"];
        r.arabicLocales = u;
        for (var d, f = 0; f < u.length; f++)
          i[d = "ar-".concat(u[f])] = i.ar, n[d] = n.ar, a[d] = a.ar;
        var c = ["IR", "AF"];
        r.farsiLocales = c;
        for (var p, h = 0; h < c.length; h++)
          n[p = "fa-".concat(c[h])] = n.fa, a[p] = a.ar;
        var m = ["ar-EG", "ar-LB", "ar-LY"];
        r.dotDecimal = m;
        var v = ["bg-BG", "cs-CZ", "da-DK", "de-DE", "el-GR", "en-ZM", "es-ES", "fr-CA", "fr-FR", "id-ID", "it-IT", "ku-IQ", "hi-IN", "hu-HU", "nb-NO", "nn-NO", "nl-NL", "pl-PL", "pt-PT", "ru-RU", "sl-SI", "sr-RS@latin", "sr-RS", "sv-SE", "tr-TR", "uk-UA", "vi-VN"];
        r.commaDecimal = v;
        for (var _ = 0; _ < m.length; _++)
          a[m[_]] = a["en-US"];
        for (var g = 0; g < v.length; g++)
          a[v[g]] = ",";
        i["fr-CA"] = i["fr-FR"], n["fr-CA"] = n["fr-FR"], i["pt-BR"] = i["pt-PT"], n["pt-BR"] = n["pt-PT"], a["pt-BR"] = a["pt-PT"], i["pl-Pl"] = i["pl-PL"], n["pl-Pl"] = n["pl-PL"], a["pl-Pl"] = a["pl-PL"], i["fa-AF"] = i.fa;
      }, {}], 6: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          return (0, n.default)(e2), e2.replace(new RegExp("[".concat(t2, "]+"), "g"), "");
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 7: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2, r2) {
          if ((0, i.default)(e2), (r2 = (0, a.default)(r2, s)).ignoreCase)
            return e2.toLowerCase().split((0, n.default)(t2).toLowerCase()).length > r2.minOccurrences;
          return e2.split((0, n.default)(t2)).length > r2.minOccurrences;
        };
        var i = o(e("./util/assertString")), n = o(e("./util/toString")), a = o(e("./util/merge"));
        function o(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        var s = { ignoreCase: false, minOccurrences: 1 };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99, "./util/merge": 101, "./util/toString": 103 }], 8: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          return (0, n.default)(e2), e2 === t2;
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 9: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), e2.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\//g, "&#x2F;").replace(/\\/g, "&#x5C;").replace(/`/g, "&#96;");
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 10: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          var t2 = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : String(new Date());
          (0, n.default)(e2);
          var r2 = (0, a.default)(t2), i2 = (0, a.default)(e2);
          return !!(i2 && r2 && r2 < i2);
        };
        var n = i(e("./util/assertString")), a = i(e("./toDate"));
        function i(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        t.exports = r.default, t.exports.default = r.default;
      }, { "./toDate": 93, "./util/assertString": 99 }], 11: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          var t2 = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : "en-US", r2 = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : {};
          (0, a.default)(e2);
          var i2 = e2, n2 = r2.ignore;
          if (n2)
            if (n2 instanceof RegExp)
              i2 = i2.replace(n2, "");
            else {
              if ("string" != typeof n2)
                throw new Error("ignore should be instance of a String or RegExp");
              i2 = i2.replace(new RegExp("[".concat(n2.replace(/[-[\]{}()*+?.,\\^$|#\\s]/g, "\\$&"), "]"), "g"), "");
            }
          if (t2 in o.alpha)
            return o.alpha[t2].test(i2);
          throw new Error("Invalid locale '".concat(t2, "'"));
        }, r.locales = void 0;
        var i, a = (i = e("./util/assertString")) && i.__esModule ? i : { default: i }, o = e("./alpha");
        var n = Object.keys(o.alpha);
        r.locales = n;
      }, { "./alpha": 5, "./util/assertString": 99 }], 12: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          var t2 = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : "en-US", r2 = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : {};
          (0, a.default)(e2);
          var i2 = e2, n2 = r2.ignore;
          if (n2)
            if (n2 instanceof RegExp)
              i2 = i2.replace(n2, "");
            else {
              if ("string" != typeof n2)
                throw new Error("ignore should be instance of a String or RegExp");
              i2 = i2.replace(new RegExp("[".concat(n2.replace(/[-[\]{}()*+?.,\\^$|#\\s]/g, "\\$&"), "]"), "g"), "");
            }
          if (t2 in o.alphanumeric)
            return o.alphanumeric[t2].test(i2);
          throw new Error("Invalid locale '".concat(t2, "'"));
        }, r.locales = void 0;
        var i, a = (i = e("./util/assertString")) && i.__esModule ? i : { default: i }, o = e("./alpha");
        var n = Object.keys(o.alphanumeric);
        r.locales = n;
      }, { "./alpha": 5, "./util/assertString": 99 }], 13: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), a.test(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /^[\x00-\x7F]+$/;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 14: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), !!a.CountryCodes.has(e2.slice(4, 6).toUpperCase()) && o.test(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i }, a = e("./isISO31661Alpha2");
        var o = /^[A-Za-z]{6}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$/;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./isISO31661Alpha2": 46, "./util/assertString": 99 }], 15: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          if ((0, n.default)(e2), e2.length % 8 == 0 && a.test(e2))
            return true;
          return false;
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /^[A-Z2-7]+=*$/;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 16: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          if ((0, n.default)(e2), a.test(e2))
            return true;
          return false;
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /^[A-HJ-NP-Za-km-z1-9]*$/;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 17: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          (0, n.default)(e2), t2 = (0, a.default)(t2, l);
          var r2 = e2.length;
          if (t2.urlSafe)
            return s.test(e2);
          if (r2 % 4 != 0 || o.test(e2))
            return false;
          var i2 = e2.indexOf("=");
          return -1 === i2 || i2 === r2 - 1 || i2 === r2 - 2 && "=" === e2[r2 - 1];
        };
        var n = i(e("./util/assertString")), a = i(e("./util/merge"));
        function i(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        var o = /[^A-Z0-9+\/=]/i, s = /^[A-Z0-9_\-]*$/i, l = { urlSafe: false };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99, "./util/merge": 101 }], 18: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          var t2 = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : String(new Date());
          (0, n.default)(e2);
          var r2 = (0, a.default)(t2), i2 = (0, a.default)(e2);
          return !!(i2 && r2 && i2 < r2);
        };
        var n = i(e("./util/assertString")), a = i(e("./toDate"));
        function i(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        t.exports = r.default, t.exports.default = r.default;
      }, { "./toDate": 93, "./util/assertString": 99 }], 19: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          var t2 = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : a;
          if ((0, n.default)(e2), t2.loose)
            return s.includes(e2.toLowerCase());
          return o.includes(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = { loose: false }, o = ["true", "false", "1", "0"], s = [].concat(o, ["yes", "no"]);
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 20: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          if ((0, n.default)(e2), e2.startsWith("bc1"))
            return a.test(e2);
          return o.test(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /^(bc1)[a-z0-9]{25,39}$/, o = /^(1|3)[A-HJ-NP-Za-km-z1-9]{25,39}$/;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 21: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          var r2, i2;
          (0, a.default)(e2), i2 = "object" === o(t2) ? (r2 = t2.min || 0, t2.max) : (r2 = arguments[1], arguments[2]);
          var n = encodeURI(e2).split(/%..|./).length - 1;
          return r2 <= n && (void 0 === i2 || n <= i2);
        };
        var i, a = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        function o(e2) {
          return (o = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e3) {
            return typeof e3;
          } : function(e3) {
            return e3 && "function" == typeof Symbol && e3.constructor === Symbol && e3 !== Symbol.prototype ? "symbol" : typeof e3;
          })(e2);
        }
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 22: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          (0, s.default)(e2);
          var t2 = e2.replace(/[- ]+/g, "");
          if (!l.test(t2))
            return false;
          for (var r2, i2, n, a = 0, o = t2.length - 1; 0 <= o; o--)
            r2 = t2.substring(o, o + 1), i2 = parseInt(r2, 10), a += n && 10 <= (i2 *= 2) ? i2 % 10 + 1 : i2, n = !n;
          return !(a % 10 != 0 || !t2);
        };
        var i, s = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var l = /^(?:4[0-9]{12}(?:[0-9]{3,6})?|5[1-5][0-9]{14}|(222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|6(?:011|5[0-9][0-9])[0-9]{12,15}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11}|6[27][0-9]{14}|^(81[0-9]{14,17}))$/;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 23: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          return (0, n.default)(e2), function(e3) {
            var r2 = "\\d{".concat(e3.digits_after_decimal[0], "}");
            e3.digits_after_decimal.forEach(function(e4, t4) {
              0 !== t4 && (r2 = "".concat(r2, "|\\d{").concat(e4, "}"));
            });
            var t3 = "(".concat(e3.symbol.replace(/\W/, function(e4) {
              return "\\".concat(e4);
            }), ")").concat(e3.require_symbol ? "" : "?"), i2 = "[1-9]\\d{0,2}(\\".concat(e3.thousands_separator, "\\d{3})*"), n2 = "(".concat(["0", "[1-9]\\d*", i2].join("|"), ")?"), a2 = "(\\".concat(e3.decimal_separator, "(").concat(r2, "))").concat(e3.require_decimal ? "" : "?"), o2 = n2 + (e3.allow_decimal || e3.require_decimal ? a2 : "");
            return e3.allow_negatives && !e3.parens_for_negatives && (e3.negative_sign_after_digits ? o2 += "-?" : e3.negative_sign_before_digits && (o2 = "-?" + o2)), e3.allow_negative_sign_placeholder ? o2 = "( (?!\\-))?".concat(o2) : e3.allow_space_after_symbol ? o2 = " ?".concat(o2) : e3.allow_space_after_digits && (o2 += "( (?!$))?"), e3.symbol_after_digits ? o2 += t3 : o2 = t3 + o2, e3.allow_negatives && (e3.parens_for_negatives ? o2 = "(\\(".concat(o2, "\\)|").concat(o2, ")") : e3.negative_sign_before_digits || e3.negative_sign_after_digits || (o2 = "-?" + o2)), new RegExp("^(?!-? )(?=.*\\d)".concat(o2, "$"));
          }(t2 = (0, i.default)(t2, o)).test(e2);
        };
        var i = a(e("./util/merge")), n = a(e("./util/assertString"));
        function a(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        var o = { symbol: "$", require_symbol: false, allow_space_after_symbol: false, symbol_after_digits: false, allow_negatives: true, parens_for_negatives: false, negative_sign_before_digits: false, negative_sign_after_digits: false, allow_negative_sign_placeholder: false, thousands_separator: ",", decimal_separator: ".", allow_decimal: true, require_decimal: false, digits_after_decimal: [2], allow_space_after_digits: false };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99, "./util/merge": 101 }], 24: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          (0, s.default)(e2);
          var t2 = e2.split(",");
          if (t2.length < 2)
            return false;
          var r2 = t2.shift().trim().split(";"), i2 = r2.shift();
          if ("data:" !== i2.substr(0, 5))
            return false;
          var n = i2.substr(5);
          if ("" !== n && !l.test(n))
            return false;
          for (var a = 0; a < r2.length; a++)
            if ((a !== r2.length - 1 || "base64" !== r2[a].toLowerCase()) && !u.test(r2[a]))
              return false;
          for (var o = 0; o < t2.length; o++)
            if (!d.test(t2[o]))
              return false;
          return true;
        };
        var i, s = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var l = /^[a-z]+\/[a-z0-9\-\+]+$/i, u = /^[a-z\-]+=[a-z0-9\-]+$/i, d = /^[a-z0-9!\$&'\(\)\*\+,;=\-\._~:@\/\?%\s]*$/i;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 25: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(t2, r2) {
          r2 = "string" == typeof r2 ? (0, h.default)({ format: r2 }, v) : (0, h.default)(r2, v);
          if ("string" == typeof t2 && (p = r2.format, /(^(y{4}|y{2})[.\/-](m{1,2})[.\/-](d{1,2})$)|(^(m{1,2})[.\/-](d{1,2})[.\/-]((y{4}|y{2})$))|(^(d{1,2})[.\/-](m{1,2})[.\/-]((y{4}|y{2})$))/gi.test(p))) {
            var e2, i2 = r2.delimiters.find(function(e3) {
              return -1 !== r2.format.indexOf(e3);
            }), n2 = r2.strictMode ? i2 : r2.delimiters.find(function(e3) {
              return -1 !== t2.indexOf(e3);
            }), a = function(e3, t3) {
              for (var r3 = [], i3 = Math.min(e3.length, t3.length), n3 = 0; n3 < i3; n3++)
                r3.push([e3[n3], t3[n3]]);
              return r3;
            }(t2.split(n2), r2.format.toLowerCase().split(i2)), o = {}, s = function(e3, t3) {
              var r3;
              if ("undefined" == typeof Symbol || null == e3[Symbol.iterator]) {
                if (Array.isArray(e3) || (r3 = m(e3)) || t3 && e3 && "number" == typeof e3.length) {
                  r3 && (e3 = r3);
                  var i3 = 0, n3 = function() {
                  };
                  return { s: n3, n: function() {
                    return i3 >= e3.length ? { done: true } : { done: false, value: e3[i3++] };
                  }, e: function(e4) {
                    throw e4;
                  }, f: n3 };
                }
                throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
              }
              var a2, o2 = true, s2 = false;
              return { s: function() {
                r3 = e3[Symbol.iterator]();
              }, n: function() {
                var e4 = r3.next();
                return o2 = e4.done, e4;
              }, e: function(e4) {
                s2 = true, a2 = e4;
              }, f: function() {
                try {
                  o2 || null == r3.return || r3.return();
                } finally {
                  if (s2)
                    throw a2;
                }
              } };
            }(a);
            try {
              for (s.s(); !(e2 = s.n()).done; ) {
                var l = (f = e2.value, c = 2, function(e3) {
                  if (Array.isArray(e3))
                    return e3;
                }(f) || function(e3, t3) {
                  if ("undefined" == typeof Symbol || !(Symbol.iterator in Object(e3)))
                    return;
                  var r3 = [], i3 = true, n3 = false, a2 = void 0;
                  try {
                    for (var o2, s2 = e3[Symbol.iterator](); !(i3 = (o2 = s2.next()).done) && (r3.push(o2.value), !t3 || r3.length !== t3); i3 = true)
                      ;
                  } catch (e4) {
                    n3 = true, a2 = e4;
                  } finally {
                    try {
                      i3 || null == s2.return || s2.return();
                    } finally {
                      if (n3)
                        throw a2;
                    }
                  }
                  return r3;
                }(f, c) || m(f, c) || function() {
                  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                }()), u = l[0], d = l[1];
                if (u.length !== d.length)
                  return false;
                o[d.charAt(0)] = u;
              }
            } catch (e3) {
              s.e(e3);
            } finally {
              s.f();
            }
            return new Date("".concat(o.m, "/").concat(o.d, "/").concat(o.y)).getDate() === +o.d;
          }
          var f, c;
          var p;
          return !r2.strictMode && "[object Date]" === Object.prototype.toString.call(t2) && isFinite(t2);
        };
        var i, h = (i = e("./util/merge")) && i.__esModule ? i : { default: i };
        function m(e2, t2) {
          if (e2) {
            if ("string" == typeof e2)
              return n(e2, t2);
            var r2 = Object.prototype.toString.call(e2).slice(8, -1);
            return "Object" === r2 && e2.constructor && (r2 = e2.constructor.name), "Map" === r2 || "Set" === r2 ? Array.from(e2) : "Arguments" === r2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r2) ? n(e2, t2) : void 0;
          }
        }
        function n(e2, t2) {
          (null == t2 || t2 > e2.length) && (t2 = e2.length);
          for (var r2 = 0, i2 = new Array(t2); r2 < t2; r2++)
            i2[r2] = e2[r2];
          return i2;
        }
        var v = { format: "YYYY/MM/DD", delimiters: ["/", "-"], strictMode: false };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/merge": 101 }], 26: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          if ((0, n.default)(e2), (t2 = (0, i.default)(t2, l)).locale in o.decimal)
            return !(0, a.default)(u, e2.replace(/ /g, "")) && (r2 = t2, new RegExp("^[-+]?([0-9]+)?(\\".concat(o.decimal[r2.locale], "[0-9]{").concat(r2.decimal_digits, "})").concat(r2.force_decimal ? "" : "?", "$"))).test(e2);
          var r2;
          throw new Error("Invalid locale '".concat(t2.locale, "'"));
        };
        var i = s(e("./util/merge")), n = s(e("./util/assertString")), a = s(e("./util/includes")), o = e("./alpha");
        function s(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        var l = { force_decimal: false, decimal_digits: "1,", locale: "en-US" }, u = ["", "-", "+"];
        t.exports = r.default, t.exports.default = r.default;
      }, { "./alpha": 5, "./util/assertString": 99, "./util/includes": 100, "./util/merge": 101 }], 27: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          return (0, i.default)(e2), (0, n.default)(e2) % parseInt(t2, 10) == 0;
        };
        var i = a(e("./util/assertString")), n = a(e("./toFloat"));
        function a(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        t.exports = r.default, t.exports.default = r.default;
      }, { "./toFloat": 94, "./util/assertString": 99 }], 28: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          (0, a.default)(e2);
          var t2 = Number(e2.slice(-1));
          return l.test(e2) && t2 === (n = e2, r2 = 10 - n.slice(0, -1).split("").map(function(e3, t3) {
            return Number(e3) * (r3 = n.length, i2 = t3, r3 !== o && r3 !== s ? i2 % 2 == 0 ? 1 : 3 : i2 % 2 == 0 ? 3 : 1);
            var r3, i2;
          }).reduce(function(e3, t3) {
            return e3 + t3;
          }, 0) % 10, r2 < 10 ? r2 : 0);
          var n, r2;
        };
        var i, a = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var o = 8, s = 14, l = /^(\d{8}|\d{13}|\d{14})$/;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 29: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          if ((0, m.default)(e2), (t2 = (0, v.default)(t2, E)).require_display_name || t2.allow_display_name) {
            var r2 = e2.match(A);
            if (r2) {
              var i2 = r2[1];
              if (e2 = e2.replace(i2, "").replace(/(^<|>$)/g, ""), i2.endsWith(" ") && (i2 = i2.substr(0, i2.length - 1)), !function(e3) {
                var t3 = e3.replace(/^"(.+)"$/, "$1");
                if (!t3.trim())
                  return false;
                if (/[\.";<>]/.test(t3)) {
                  if (t3 === e3)
                    return false;
                  var r3 = t3.split('"').length === t3.split('\\"').length;
                  if (!r3)
                    return false;
                }
                return true;
              }(i2))
                return false;
            } else if (t2.require_display_name)
              return false;
          }
          if (!t2.ignore_max_length && e2.length > R)
            return false;
          var n = e2.split("@"), a = n.pop(), o = a.toLowerCase();
          if (t2.host_blacklist.includes(o))
            return false;
          var s = n.join("@");
          if (t2.domain_specific_validation && ("gmail.com" === o || "googlemail.com" === o)) {
            var l = (s = s.toLowerCase()).split("+")[0];
            if (!(0, _.default)(l.replace(/\./g, ""), { min: 6, max: 30 }))
              return false;
            for (var u = l.split("."), d = 0; d < u.length; d++)
              if (!b.test(u[d]))
                return false;
          }
          if (!(false !== t2.ignore_max_length || (0, _.default)(s, { max: 64 }) && (0, _.default)(a, { max: 254 })))
            return false;
          if (!(0, g.default)(a, { require_tld: t2.require_tld })) {
            if (!t2.allow_ip_domain)
              return false;
            if (!(0, y.default)(a)) {
              if (!a.startsWith("[") || !a.endsWith("]"))
                return false;
              var f = a.substr(1, a.length - 2);
              if (0 === f.length || !(0, y.default)(f))
                return false;
            }
          }
          if ('"' === s[0])
            return s = s.slice(1, s.length - 1), t2.allow_utf8_local_part ? I.test(s) : O.test(s);
          for (var c = t2.allow_utf8_local_part ? M : S, p = s.split("."), h = 0; h < p.length; h++)
            if (!c.test(p[h]))
              return false;
          if (t2.blacklisted_chars && -1 !== s.search(new RegExp("[".concat(t2.blacklisted_chars, "]+"), "g")))
            return false;
          return true;
        };
        var m = i(e("./util/assertString")), v = i(e("./util/merge")), _ = i(e("./isByteLength")), g = i(e("./isFQDN")), y = i(e("./isIP"));
        function i(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        var E = { allow_display_name: false, require_display_name: false, allow_utf8_local_part: true, require_tld: true, blacklisted_chars: "", ignore_max_length: false, host_blacklist: [] }, A = /^([^\x00-\x1F\x7F-\x9F\cX]+)</i, S = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~]+$/i, b = /^[a-z\d]+$/, O = /^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f]))*$/i, M = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+$/i, I = /^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*$/i, R = 254;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./isByteLength": 21, "./isFQDN": 32, "./isIP": 42, "./util/assertString": 99, "./util/merge": 101 }], 30: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          return (0, i.default)(e2), 0 === ((t2 = (0, n.default)(t2, o)).ignore_whitespace ? e2.trim().length : e2.length);
        };
        var i = a(e("./util/assertString")), n = a(e("./util/merge"));
        function a(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        var o = { ignore_whitespace: false };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99, "./util/merge": 101 }], 31: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), a.test(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /^(0x)[0-9a-f]{40}$/i;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 32: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          (0, n.default)(e2), (t2 = (0, a.default)(t2, o)).allow_trailing_dot && "." === e2[e2.length - 1] && (e2 = e2.substring(0, e2.length - 1));
          true === t2.allow_wildcard && 0 === e2.indexOf("*.") && (e2 = e2.substring(2));
          var r2 = e2.split("."), i2 = r2[r2.length - 1];
          if (t2.require_tld) {
            if (r2.length < 2)
              return false;
            if (!/^([a-z\u00A1-\u00A8\u00AA-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]{2,}|xn[a-z0-9-]{2,})$/i.test(i2))
              return false;
            if (/\s/.test(i2))
              return false;
          }
          return !(!t2.allow_numeric_tld && /^\d+$/.test(i2)) && r2.every(function(e3) {
            return !(63 < e3.length || !/^[a-z_\u00a1-\uffff0-9-]+$/i.test(e3) || /[\uff01-\uff5e]/.test(e3) || /^-|-$/.test(e3) || !t2.allow_underscores && /_/.test(e3));
          });
        };
        var n = i(e("./util/assertString")), a = i(e("./util/merge"));
        function i(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        var o = { require_tld: true, allow_underscores: false, allow_trailing_dot: false, allow_numeric_tld: false, allow_wildcard: false };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99, "./util/merge": 101 }], 33: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          (0, n.default)(e2), t2 = t2 || {};
          var r2 = new RegExp("^(?:[-+])?(?:[0-9]+)?(?:\\".concat(t2.locale ? a.decimal[t2.locale] : ".", "[0-9]*)?(?:[eE][\\+\\-]?(?:[0-9]+))?$"));
          if ("" === e2 || "." === e2 || "-" === e2 || "+" === e2)
            return false;
          var i2 = parseFloat(e2.replace(",", "."));
          return r2.test(e2) && (!t2.hasOwnProperty("min") || i2 >= t2.min) && (!t2.hasOwnProperty("max") || i2 <= t2.max) && (!t2.hasOwnProperty("lt") || i2 < t2.lt) && (!t2.hasOwnProperty("gt") || i2 > t2.gt);
        }, r.locales = void 0;
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i }, a = e("./alpha");
        var o = Object.keys(a.decimal);
        r.locales = o;
      }, { "./alpha": 5, "./util/assertString": 99 }], 34: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), a.test(e2);
        }, r.fullWidth = void 0;
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /[^\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/;
        r.fullWidth = a;
      }, { "./util/assertString": 99 }], 35: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          (0, n.default)(e2);
          var t2 = e2.replace(/\s+/g, " ").replace(/\s?(hsla?\(|\)|,)\s?/gi, "$1");
          return -1 === t2.indexOf(",") ? o.test(t2) : a.test(t2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /^hsla?\(((\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?))(deg|grad|rad|turn)?(,(\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?)%){2}(,((\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?)%?))?\)$/i, o = /^hsla?\(((\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?))(deg|grad|rad|turn)?(\s(\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?)%){2}\s?(\/\s((\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?)%?)\s?)?\)$/i;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 36: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), a.test(e2);
        }, r.halfWidth = void 0;
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /[\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/;
        r.halfWidth = a;
      }, { "./util/assertString": 99 }], 37: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          return (0, n.default)(e2), new RegExp("^[a-fA-F0-9]{".concat(a[t2], "}$")).test(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = { md5: 32, md4: 32, sha1: 40, sha256: 64, sha384: 96, sha512: 128, ripemd128: 32, ripemd160: 40, tiger128: 32, tiger160: 40, tiger192: 48, crc32: 8, crc32b: 8 };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 38: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), a.test(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /^#?([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 39: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), a.test(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /^(0x|0h)?[0-9A-F]+$/i;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 40: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, o.default)(e2), i2 = e2, n2 = i2.replace(/[\s\-]+/gi, "").toUpperCase(), a = n2.slice(0, 2).toUpperCase(), a in s && s[a].test(n2) && (t2 = e2, r2 = t2.replace(/[^A-Z0-9]+/gi, "").toUpperCase(), 1 === (r2.slice(4) + r2.slice(0, 4)).replace(/[A-Z]/g, function(e3) {
            return e3.charCodeAt(0) - 55;
          }).match(/\d{1,7}/g).reduce(function(e3, t3) {
            return Number(e3 + t3) % 97;
          }, ""));
          var t2, r2;
          var i2, n2, a;
        }, r.locales = void 0;
        var i, o = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var s = { AD: /^(AD[0-9]{2})\d{8}[A-Z0-9]{12}$/, AE: /^(AE[0-9]{2})\d{3}\d{16}$/, AL: /^(AL[0-9]{2})\d{8}[A-Z0-9]{16}$/, AT: /^(AT[0-9]{2})\d{16}$/, AZ: /^(AZ[0-9]{2})[A-Z0-9]{4}\d{20}$/, BA: /^(BA[0-9]{2})\d{16}$/, BE: /^(BE[0-9]{2})\d{12}$/, BG: /^(BG[0-9]{2})[A-Z]{4}\d{6}[A-Z0-9]{8}$/, BH: /^(BH[0-9]{2})[A-Z]{4}[A-Z0-9]{14}$/, BR: /^(BR[0-9]{2})\d{23}[A-Z]{1}[A-Z0-9]{1}$/, BY: /^(BY[0-9]{2})[A-Z0-9]{4}\d{20}$/, CH: /^(CH[0-9]{2})\d{5}[A-Z0-9]{12}$/, CR: /^(CR[0-9]{2})\d{18}$/, CY: /^(CY[0-9]{2})\d{8}[A-Z0-9]{16}$/, CZ: /^(CZ[0-9]{2})\d{20}$/, DE: /^(DE[0-9]{2})\d{18}$/, DK: /^(DK[0-9]{2})\d{14}$/, DO: /^(DO[0-9]{2})[A-Z]{4}\d{20}$/, EE: /^(EE[0-9]{2})\d{16}$/, EG: /^(EG[0-9]{2})\d{25}$/, ES: /^(ES[0-9]{2})\d{20}$/, FI: /^(FI[0-9]{2})\d{14}$/, FO: /^(FO[0-9]{2})\d{14}$/, FR: /^(FR[0-9]{2})\d{10}[A-Z0-9]{11}\d{2}$/, GB: /^(GB[0-9]{2})[A-Z]{4}\d{14}$/, GE: /^(GE[0-9]{2})[A-Z0-9]{2}\d{16}$/, GI: /^(GI[0-9]{2})[A-Z]{4}[A-Z0-9]{15}$/, GL: /^(GL[0-9]{2})\d{14}$/, GR: /^(GR[0-9]{2})\d{7}[A-Z0-9]{16}$/, GT: /^(GT[0-9]{2})[A-Z0-9]{4}[A-Z0-9]{20}$/, HR: /^(HR[0-9]{2})\d{17}$/, HU: /^(HU[0-9]{2})\d{24}$/, IE: /^(IE[0-9]{2})[A-Z0-9]{4}\d{14}$/, IL: /^(IL[0-9]{2})\d{19}$/, IQ: /^(IQ[0-9]{2})[A-Z]{4}\d{15}$/, IR: /^(IR[0-9]{2})0\d{2}0\d{18}$/, IS: /^(IS[0-9]{2})\d{22}$/, IT: /^(IT[0-9]{2})[A-Z]{1}\d{10}[A-Z0-9]{12}$/, JO: /^(JO[0-9]{2})[A-Z]{4}\d{22}$/, KW: /^(KW[0-9]{2})[A-Z]{4}[A-Z0-9]{22}$/, KZ: /^(KZ[0-9]{2})\d{3}[A-Z0-9]{13}$/, LB: /^(LB[0-9]{2})\d{4}[A-Z0-9]{20}$/, LC: /^(LC[0-9]{2})[A-Z]{4}[A-Z0-9]{24}$/, LI: /^(LI[0-9]{2})\d{5}[A-Z0-9]{12}$/, LT: /^(LT[0-9]{2})\d{16}$/, LU: /^(LU[0-9]{2})\d{3}[A-Z0-9]{13}$/, LV: /^(LV[0-9]{2})[A-Z]{4}[A-Z0-9]{13}$/, MC: /^(MC[0-9]{2})\d{10}[A-Z0-9]{11}\d{2}$/, MD: /^(MD[0-9]{2})[A-Z0-9]{20}$/, ME: /^(ME[0-9]{2})\d{18}$/, MK: /^(MK[0-9]{2})\d{3}[A-Z0-9]{10}\d{2}$/, MR: /^(MR[0-9]{2})\d{23}$/, MT: /^(MT[0-9]{2})[A-Z]{4}\d{5}[A-Z0-9]{18}$/, MU: /^(MU[0-9]{2})[A-Z]{4}\d{19}[A-Z]{3}$/, MZ: /^(MZ[0-9]{2})\d{21}$/, NL: /^(NL[0-9]{2})[A-Z]{4}\d{10}$/, NO: /^(NO[0-9]{2})\d{11}$/, PK: /^(PK[0-9]{2})[A-Z0-9]{4}\d{16}$/, PL: /^(PL[0-9]{2})\d{24}$/, PS: /^(PS[0-9]{2})[A-Z0-9]{4}\d{21}$/, PT: /^(PT[0-9]{2})\d{21}$/, QA: /^(QA[0-9]{2})[A-Z]{4}[A-Z0-9]{21}$/, RO: /^(RO[0-9]{2})[A-Z]{4}[A-Z0-9]{16}$/, RS: /^(RS[0-9]{2})\d{18}$/, SA: /^(SA[0-9]{2})\d{2}[A-Z0-9]{18}$/, SC: /^(SC[0-9]{2})[A-Z]{4}\d{20}[A-Z]{3}$/, SE: /^(SE[0-9]{2})\d{20}$/, SI: /^(SI[0-9]{2})\d{15}$/, SK: /^(SK[0-9]{2})\d{20}$/, SM: /^(SM[0-9]{2})[A-Z]{1}\d{10}[A-Z0-9]{12}$/, SV: /^(SV[0-9]{2})[A-Z0-9]{4}\d{20}$/, TL: /^(TL[0-9]{2})\d{19}$/, TN: /^(TN[0-9]{2})\d{20}$/, TR: /^(TR[0-9]{2})\d{5}[A-Z0-9]{17}$/, UA: /^(UA[0-9]{2})\d{6}[A-Z0-9]{19}$/, VA: /^(VA[0-9]{2})\d{18}$/, VG: /^(VG[0-9]{2})[A-Z0-9]{4}\d{16}$/, XK: /^(XK[0-9]{2})\d{16}$/ };
        var n = Object.keys(s);
        r.locales = n;
      }, { "./util/assertString": 99 }], 41: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          (0, l.default)(e2);
          var r2 = u;
          (t2 = t2 || {}).allow_hyphens && (r2 = d);
          if (!r2.test(e2))
            return false;
          e2 = e2.replace(/-/g, "");
          for (var i2 = 0, n = 2, a = 0; a < 14; a++) {
            var o = e2.substring(14 - a - 1, 14 - a), s = parseInt(o, 10) * n;
            i2 += 10 <= s ? s % 10 + 1 : s, 1 === n ? n += 1 : n -= 1;
          }
          return (10 - i2 % 10) % 10 === parseInt(e2.substring(14, 15), 10);
        };
        var i, l = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var u = /^[0-9]{15}$/, d = /^\d{2}-\d{6}-\d{6}-\d{1}$/;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 42: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function e2(t2) {
          var r2 = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : "";
          (0, n.default)(t2);
          r2 = String(r2);
          if (!r2)
            return e2(t2, 4) || e2(t2, 6);
          if ("4" === r2) {
            if (!s.test(t2))
              return false;
            var i2 = t2.split(".").sort(function(e3, t3) {
              return e3 - t3;
            });
            return i2[3] <= 255;
          }
          if ("6" === r2)
            return !!u.test(t2);
          return false;
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = "(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])", o = "(".concat(a, "[.]){3}").concat(a), s = new RegExp("^".concat(o, "$")), l = "(?:[0-9a-fA-F]{1,4})", u = new RegExp("^(" + "(?:".concat(l, ":){7}(?:").concat(l, "|:)|") + "(?:".concat(l, ":){6}(?:").concat(o, "|:").concat(l, "|:)|") + "(?:".concat(l, ":){5}(?::").concat(o, "|(:").concat(l, "){1,2}|:)|") + "(?:".concat(l, ":){4}(?:(:").concat(l, "){0,1}:").concat(o, "|(:").concat(l, "){1,3}|:)|") + "(?:".concat(l, ":){3}(?:(:").concat(l, "){0,2}:").concat(o, "|(:").concat(l, "){1,4}|:)|") + "(?:".concat(l, ":){2}(?:(:").concat(l, "){0,3}:").concat(o, "|(:").concat(l, "){1,5}|:)|") + "(?:".concat(l, ":){1}(?:(:").concat(l, "){0,4}:").concat(o, "|(:").concat(l, "){1,6}|:)|") + "(?::((?::".concat(l, "){0,5}:").concat(o, "|(?::").concat(l, "){1,7}|:))") + ")(%[0-9a-zA-Z-.:]{1,})?$");
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 43: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          var t2 = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : "";
          (0, n.default)(e2);
          var r2 = e2.split("/");
          if (2 !== r2.length)
            return false;
          if (!o.test(r2[1]))
            return false;
          if (1 < r2[1].length && r2[1].startsWith("0"))
            return false;
          if (!(0, a.default)(r2[0], t2))
            return false;
          var i2 = null;
          switch (String(t2)) {
            case "4":
              i2 = s;
              break;
            case "6":
              i2 = l;
              break;
            default:
              i2 = (0, a.default)(r2[0], "6") ? l : s;
          }
          return r2[1] <= i2 && 0 <= r2[1];
        };
        var n = i(e("./util/assertString")), a = i(e("./isIP"));
        function i(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        var o = /^\d{1,3}$/, s = 32, l = 128;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./isIP": 42, "./util/assertString": 99 }], 44: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function e2(t2) {
          var r2 = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : "";
          (0, o.default)(t2);
          r2 = String(r2);
          if (!r2)
            return e2(t2, 10) || e2(t2, 13);
          var i2 = t2.replace(/[\s-]+/g, "");
          var n = 0;
          var a;
          if ("10" === r2) {
            if (!s.test(i2))
              return false;
            for (a = 0; a < 9; a++)
              n += (a + 1) * i2.charAt(a);
            if ("X" === i2.charAt(9) ? n += 100 : n += 10 * i2.charAt(9), n % 11 == 0)
              return !!i2;
          } else if ("13" === r2) {
            if (!l.test(i2))
              return false;
            for (a = 0; a < 12; a++)
              n += u[a % 2] * i2.charAt(a);
            if (i2.charAt(12) - (10 - n % 10) % 10 == 0)
              return !!i2;
          }
          return false;
        };
        var i, o = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var s = /^(?:[0-9]{9}X|[0-9]{10})$/, l = /^(?:[0-9]{13})$/, u = [1, 3];
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 45: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          if ((0, c.default)(e2), !p.test(e2))
            return false;
          for (var t2 = true, r2 = 0, i2 = e2.length - 2; 0 <= i2; i2--)
            if ("A" <= e2[i2] && e2[i2] <= "Z")
              for (var n = e2[i2].charCodeAt(0) - 55, a = n % 10, o = Math.trunc(n / 10), s = 0, l = [a, o]; s < l.length; s++) {
                var u = l[s];
                r2 += t2 ? 5 <= u ? 1 + 2 * (u - 5) : 2 * u : u, t2 = !t2;
              }
            else {
              var d = e2[i2].charCodeAt(0) - "0".charCodeAt(0);
              r2 += t2 ? 5 <= d ? 1 + 2 * (d - 5) : 2 * d : d, t2 = !t2;
            }
          var f = 10 * Math.trunc((r2 + 9) / 10) - r2;
          return +e2[e2.length - 1] === f;
        };
        var i, c = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var p = /^[A-Z]{2}[0-9A-Z]{9}[0-9]$/;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 46: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), a.has(e2.toUpperCase());
        }, r.CountryCodes = void 0;
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /* @__PURE__ */ new Set(["AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI", "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW"]);
        var o = a;
        r.CountryCodes = o;
      }, { "./util/assertString": 99 }], 47: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), a.has(e2.toUpperCase());
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /* @__PURE__ */ new Set(["AFG", "ALA", "ALB", "DZA", "ASM", "AND", "AGO", "AIA", "ATA", "ATG", "ARG", "ARM", "ABW", "AUS", "AUT", "AZE", "BHS", "BHR", "BGD", "BRB", "BLR", "BEL", "BLZ", "BEN", "BMU", "BTN", "BOL", "BES", "BIH", "BWA", "BVT", "BRA", "IOT", "BRN", "BGR", "BFA", "BDI", "KHM", "CMR", "CAN", "CPV", "CYM", "CAF", "TCD", "CHL", "CHN", "CXR", "CCK", "COL", "COM", "COG", "COD", "COK", "CRI", "CIV", "HRV", "CUB", "CUW", "CYP", "CZE", "DNK", "DJI", "DMA", "DOM", "ECU", "EGY", "SLV", "GNQ", "ERI", "EST", "ETH", "FLK", "FRO", "FJI", "FIN", "FRA", "GUF", "PYF", "ATF", "GAB", "GMB", "GEO", "DEU", "GHA", "GIB", "GRC", "GRL", "GRD", "GLP", "GUM", "GTM", "GGY", "GIN", "GNB", "GUY", "HTI", "HMD", "VAT", "HND", "HKG", "HUN", "ISL", "IND", "IDN", "IRN", "IRQ", "IRL", "IMN", "ISR", "ITA", "JAM", "JPN", "JEY", "JOR", "KAZ", "KEN", "KIR", "PRK", "KOR", "KWT", "KGZ", "LAO", "LVA", "LBN", "LSO", "LBR", "LBY", "LIE", "LTU", "LUX", "MAC", "MKD", "MDG", "MWI", "MYS", "MDV", "MLI", "MLT", "MHL", "MTQ", "MRT", "MUS", "MYT", "MEX", "FSM", "MDA", "MCO", "MNG", "MNE", "MSR", "MAR", "MOZ", "MMR", "NAM", "NRU", "NPL", "NLD", "NCL", "NZL", "NIC", "NER", "NGA", "NIU", "NFK", "MNP", "NOR", "OMN", "PAK", "PLW", "PSE", "PAN", "PNG", "PRY", "PER", "PHL", "PCN", "POL", "PRT", "PRI", "QAT", "REU", "ROU", "RUS", "RWA", "BLM", "SHN", "KNA", "LCA", "MAF", "SPM", "VCT", "WSM", "SMR", "STP", "SAU", "SEN", "SRB", "SYC", "SLE", "SGP", "SXM", "SVK", "SVN", "SLB", "SOM", "ZAF", "SGS", "SSD", "ESP", "LKA", "SDN", "SUR", "SJM", "SWZ", "SWE", "CHE", "SYR", "TWN", "TJK", "TZA", "THA", "TLS", "TGO", "TKL", "TON", "TTO", "TUN", "TUR", "TKM", "TCA", "TUV", "UGA", "UKR", "ARE", "GBR", "USA", "UMI", "URY", "UZB", "VUT", "VEN", "VNM", "VGB", "VIR", "WLF", "ESH", "YEM", "ZMB", "ZWE"]);
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 48: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), a.has(e2.toUpperCase());
        }, r.CurrencyCodes = void 0;
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /* @__PURE__ */ new Set(["AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BOV", "BRL", "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHE", "CHF", "CHW", "CLF", "CLP", "CNY", "COP", "COU", "CRC", "CUC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG", "HUF", "IDR", "ILS", "INR", "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KMF", "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRU", "MUR", "MVR", "MWK", "MXN", "MXV", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD", "SHP", "SLL", "SOS", "SRD", "SSP", "STN", "SVC", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH", "UGX", "USD", "USN", "UYI", "UYU", "UYW", "UZS", "VES", "VND", "VUV", "WST", "XAF", "XAG", "XAU", "XBA", "XBB", "XBC", "XBD", "XCD", "XDR", "XOF", "XPD", "XPF", "XPT", "XSU", "XTS", "XUA", "XXX", "YER", "ZAR", "ZMW", "ZWL"]);
        var o = a;
        r.CurrencyCodes = o;
      }, { "./util/assertString": 99 }], 49: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          var t2 = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : {};
          (0, n.default)(e2);
          var r2 = t2.strictSeparator ? o.test(e2) : a.test(e2);
          return r2 && t2.strict ? s(e2) : r2;
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-3])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/, o = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-3])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/, s = function(e2) {
          var t2 = e2.match(/^(\d{4})-?(\d{3})([ T]{1}\.*|$)/);
          if (t2) {
            var r2 = Number(t2[1]), i2 = Number(t2[2]);
            return r2 % 4 == 0 && r2 % 100 != 0 || r2 % 400 == 0 ? i2 <= 366 : i2 <= 365;
          }
          var n2 = e2.match(/(\d{4})-?(\d{0,2})-?(\d*)/).map(Number), a2 = n2[1], o2 = n2[2], s2 = n2[3], l = o2 ? "0".concat(o2).slice(-2) : o2, u = s2 ? "0".concat(s2).slice(-2) : s2, d = new Date("".concat(a2, "-").concat(l || "01", "-").concat(u || "01"));
          return !o2 || !s2 || d.getUTCFullYear() === a2 && d.getUTCMonth() + 1 === o2 && d.getUTCDate() === s2;
        };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 50: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), a.test(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /^[A-Z]{2}[0-9A-Z]{3}\d{2}\d{5}$/;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 51: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          var t2 = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : {};
          (0, s.default)(e2);
          var r2 = l;
          if (r2 = t2.require_hyphen ? r2.replace("?", "") : r2, !(r2 = t2.case_sensitive ? new RegExp(r2) : new RegExp(r2, "i")).test(e2))
            return false;
          for (var i2 = e2.replace("-", "").toUpperCase(), n = 0, a = 0; a < i2.length; a++) {
            var o = i2[a];
            n += ("X" === o ? 10 : +o) * (8 - a);
          }
          return n % 11 == 0;
        };
        var i, s = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var l = "^\\d{4}-?\\d{3}[\\dX]$";
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 52: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          {
            if ((0, n.default)(e2), t2 in o)
              return o[t2](e2);
            if ("any" === t2) {
              for (var r2 in o)
                if (o.hasOwnProperty(r2)) {
                  var i2 = o[r2];
                  if (i2(e2))
                    return true;
                }
              return false;
            }
          }
          throw new Error("Invalid locale '".concat(t2, "'"));
        };
        var n = i(e("./util/assertString")), a = i(e("./isInt"));
        function i(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        var o = { PL: function(e2) {
          (0, n.default)(e2);
          var i2 = { 1: 1, 2: 3, 3: 7, 4: 9, 5: 1, 6: 3, 7: 7, 8: 9, 9: 1, 10: 3, 11: 0 };
          if (null != e2 && 11 === e2.length && (0, a.default)(e2, { allow_leading_zeroes: true })) {
            var t2 = e2.split("").slice(0, -1).reduce(function(e3, t3, r3) {
              return e3 + Number(t3) * i2[r3 + 1];
            }, 0) % 10, r2 = Number(e2.charAt(e2.length - 1));
            if (0 === t2 && 0 === r2 || r2 === 10 - t2)
              return true;
          }
          return false;
        }, ES: function(e2) {
          (0, n.default)(e2);
          var t2 = { X: 0, Y: 1, Z: 2 }, r2 = e2.trim().toUpperCase();
          if (!/^[0-9X-Z][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/.test(r2))
            return false;
          var i2 = r2.slice(0, -1).replace(/[X,Y,Z]/g, function(e3) {
            return t2[e3];
          });
          return r2.endsWith(["T", "R", "W", "A", "G", "M", "Y", "F", "P", "D", "X", "B", "N", "J", "Z", "S", "Q", "V", "H", "L", "C", "K", "E"][i2 % 23]);
        }, FI: function(e2) {
          if ((0, n.default)(e2), 11 !== e2.length)
            return false;
          if (!e2.match(/^\d{6}[\-A\+]\d{3}[0-9ABCDEFHJKLMNPRSTUVWXY]{1}$/))
            return false;
          return "0123456789ABCDEFHJKLMNPRSTUVWXY"[(1e3 * parseInt(e2.slice(0, 6), 10) + parseInt(e2.slice(7, 10), 10)) % 31] === e2.slice(10, 11);
        }, IN: function(e2) {
          var r2 = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 0, 6, 7, 8, 9, 5], [2, 3, 4, 0, 1, 7, 8, 9, 5, 6], [3, 4, 0, 1, 2, 8, 9, 5, 6, 7], [4, 0, 1, 2, 3, 9, 5, 6, 7, 8], [5, 9, 8, 7, 6, 0, 4, 3, 2, 1], [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], [7, 6, 5, 9, 8, 2, 1, 0, 4, 3], [8, 7, 6, 5, 9, 3, 2, 1, 0, 4], [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]], i2 = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 7, 6, 2, 8, 3, 0, 9, 4], [5, 8, 0, 3, 7, 9, 6, 1, 4, 2], [8, 9, 1, 6, 0, 4, 3, 5, 2, 7], [9, 4, 5, 3, 1, 2, 6, 8, 7, 0], [4, 2, 8, 6, 5, 7, 3, 9, 0, 1], [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]], t2 = e2.trim();
          if (!/^[1-9]\d{3}\s?\d{4}\s?\d{4}$/.test(t2))
            return false;
          var n2 = 0;
          return t2.replace(/\s/g, "").split("").map(Number).reverse().forEach(function(e3, t3) {
            n2 = r2[n2][i2[t3 % 8][e3]];
          }), 0 === n2;
        }, IR: function(e2) {
          if (!e2.match(/^\d{10}$/))
            return false;
          if (e2 = "0000".concat(e2).substr(e2.length - 6), 0 === parseInt(e2.substr(3, 6), 10))
            return false;
          for (var t2 = parseInt(e2.substr(9, 1), 10), r2 = 0, i2 = 0; i2 < 9; i2++)
            r2 += parseInt(e2.substr(i2, 1), 10) * (10 - i2);
          return (r2 %= 11) < 2 && t2 === r2 || 2 <= r2 && t2 === 11 - r2;
        }, IT: function(e2) {
          return 9 === e2.length && ("CA00000AA" !== e2 && -1 < e2.search(/C[A-Z][0-9]{5}[A-Z]{2}/i));
        }, NO: function(e2) {
          var t2 = e2.trim();
          if (isNaN(Number(t2)))
            return false;
          if (11 !== t2.length)
            return false;
          if ("00000000000" === t2)
            return false;
          var r2 = t2.split("").map(Number), i2 = (11 - (3 * r2[0] + 7 * r2[1] + 6 * r2[2] + 1 * r2[3] + 8 * r2[4] + 9 * r2[5] + 4 * r2[6] + 5 * r2[7] + 2 * r2[8]) % 11) % 11, n2 = (11 - (5 * r2[0] + 4 * r2[1] + 3 * r2[2] + 2 * r2[3] + 7 * r2[4] + 6 * r2[5] + 5 * r2[6] + 4 * r2[7] + 3 * r2[8] + 2 * i2) % 11) % 11;
          return i2 === r2[9] && n2 === r2[10];
        }, TH: function(e2) {
          if (!e2.match(/^[1-8]\d{12}$/))
            return false;
          for (var t2 = 0, r2 = 0; r2 < 12; r2++)
            t2 += parseInt(e2[r2], 10) * (13 - r2);
          return e2[12] === ((11 - t2 % 11) % 10).toString();
        }, LK: function(e2) {
          return !(10 !== e2.length || !/^[1-9]\d{8}[vx]$/i.test(e2)) || !(12 !== e2.length || !/^[1-9]\d{11}$/i.test(e2));
        }, "he-IL": function(e2) {
          var t2 = e2.trim();
          if (!/^\d{9}$/.test(t2))
            return false;
          for (var r2, i2 = t2, n2 = 0, a2 = 0; a2 < i2.length; a2++)
            n2 += 9 < (r2 = Number(i2[a2]) * (a2 % 2 + 1)) ? r2 - 9 : r2;
          return n2 % 10 == 0;
        }, "ar-LY": function(e2) {
          var t2 = e2.trim();
          return !!/^(1|2)\d{11}$/.test(t2);
        }, "ar-TN": function(e2) {
          var t2 = e2.trim();
          return !!/^\d{8}$/.test(t2);
        }, "zh-CN": function(e2) {
          var t2, r2 = ["11", "12", "13", "14", "15", "21", "22", "23", "31", "32", "33", "34", "35", "36", "37", "41", "42", "43", "44", "45", "46", "50", "51", "52", "53", "54", "61", "62", "63", "64", "65", "71", "81", "82", "91"], n2 = ["7", "9", "10", "5", "8", "4", "2", "1", "6", "3", "7", "9", "10", "5", "8", "4", "2"], a2 = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"], o2 = function(e3) {
            return r2.includes(e3);
          }, s = function(e3) {
            var t3 = parseInt(e3.substring(0, 4), 10), r3 = parseInt(e3.substring(4, 6), 10), i2 = parseInt(e3.substring(6), 10), n3 = new Date(t3, r3 - 1, i2);
            return !(n3 > new Date()) && (n3.getFullYear() === t3 && n3.getMonth() === r3 - 1 && n3.getDate() === i2);
          }, l = function(e3) {
            return function(e4) {
              for (var t3 = e4.substring(0, 17), r3 = 0, i2 = 0; i2 < 17; i2++)
                r3 += parseInt(t3.charAt(i2), 10) * parseInt(n2[i2], 10);
              return a2[r3 % 11];
            }(e3) === e3.charAt(17).toUpperCase();
          };
          return !!/^\d{15}|(\d{17}(\d|x|X))$/.test(t2 = e2) && (15 === t2.length ? function(e3) {
            var t3 = /^[1-9]\d{7}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}$/.test(e3);
            if (!t3)
              return false;
            var r3 = e3.substring(0, 2);
            if (!(t3 = o2(r3)))
              return false;
            var i2 = "19".concat(e3.substring(6, 12));
            return !!(t3 = s(i2));
          }(t2) : function(e3) {
            var t3 = /^[1-9]\d{5}[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}(\d|x|X)$/.test(e3);
            if (!t3)
              return false;
            var r3 = e3.substring(0, 2);
            if (!(t3 = o2(r3)))
              return false;
            var i2 = e3.substring(6, 14);
            return !!(t3 = s(i2)) && l(e3);
          }(t2));
        }, "zh-TW": function(e2) {
          var n2 = { A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 34, J: 18, K: 19, L: 20, M: 21, N: 22, O: 35, P: 23, Q: 24, R: 25, S: 26, T: 27, U: 28, V: 29, W: 32, X: 30, Y: 31, Z: 33 }, t2 = e2.trim().toUpperCase();
          return !!/^[A-Z][0-9]{9}$/.test(t2) && Array.from(t2).reduce(function(e3, t3, r2) {
            if (0 !== r2)
              return 9 === r2 ? (10 - e3 % 10 - Number(t3)) % 10 == 0 : e3 + Number(t3) * (9 - r2);
            var i2 = n2[t3];
            return i2 % 10 * 9 + Math.floor(i2 / 10);
          }, 0);
        } };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./isInt": 54, "./util/assertString": 99 }], 53: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          var r2;
          {
            if ((0, n.default)(e2), "[object Array]" === Object.prototype.toString.call(t2)) {
              var i2 = [];
              for (r2 in t2)
                ({}).hasOwnProperty.call(t2, r2) && (i2[r2] = (0, a.default)(t2[r2]));
              return 0 <= i2.indexOf(e2);
            }
            if ("object" === o(t2))
              return t2.hasOwnProperty(e2);
            if (t2 && "function" == typeof t2.indexOf)
              return 0 <= t2.indexOf(e2);
          }
          return false;
        };
        var n = i(e("./util/assertString")), a = i(e("./util/toString"));
        function i(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        function o(e2) {
          return (o = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e3) {
            return typeof e3;
          } : function(e3) {
            return e3 && "function" == typeof Symbol && e3.constructor === Symbol && e3 !== Symbol.prototype ? "symbol" : typeof e3;
          })(e2);
        }
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99, "./util/toString": 103 }], 54: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          (0, s.default)(e2);
          var r2 = (t2 = t2 || {}).hasOwnProperty("allow_leading_zeroes") && !t2.allow_leading_zeroes ? l : u, i2 = !t2.hasOwnProperty("min") || e2 >= t2.min, n = !t2.hasOwnProperty("max") || e2 <= t2.max, a = !t2.hasOwnProperty("lt") || e2 < t2.lt, o = !t2.hasOwnProperty("gt") || e2 > t2.gt;
          return r2.test(e2) && i2 && n && a && o;
        };
        var i, s = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var l = /^(?:[-+]?(?:0|[1-9][0-9]*))$/, u = /^[-+]?[0-9]+$/;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 55: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          (0, n.default)(e2);
          try {
            t2 = (0, a.default)(t2, s);
            var r2 = [];
            t2.allow_primitives && (r2 = [null, false, true]);
            var i2 = JSON.parse(e2);
            return r2.includes(i2) || !!i2 && "object" === o(i2);
          } catch (e3) {
          }
          return false;
        };
        var n = i(e("./util/assertString")), a = i(e("./util/merge"));
        function i(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        function o(e2) {
          return (o = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e3) {
            return typeof e3;
          } : function(e3) {
            return e3 && "function" == typeof Symbol && e3.constructor === Symbol && e3 !== Symbol.prototype ? "symbol" : typeof e3;
          })(e2);
        }
        var s = { allow_primitives: false };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99, "./util/merge": 101 }], 56: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          (0, i.default)(e2);
          var t2 = e2.split("."), r2 = t2.length;
          if (3 < r2 || r2 < 2)
            return false;
          return t2.reduce(function(e3, t3) {
            return e3 && (0, n.default)(t3, { urlSafe: true });
          }, true);
        };
        var i = a(e("./util/assertString")), n = a(e("./isBase64"));
        function a(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        t.exports = r.default, t.exports.default = r.default;
      }, { "./isBase64": 17, "./util/assertString": 99 }], 57: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          if ((0, i.default)(e2), t2 = (0, n.default)(t2, d), !e2.includes(","))
            return false;
          var r2 = e2.split(",");
          if (r2[0].startsWith("(") && !r2[1].endsWith(")") || r2[1].endsWith(")") && !r2[0].startsWith("("))
            return false;
          if (t2.checkDMS)
            return l.test(r2[0]) && u.test(r2[1]);
          return o.test(r2[0]) && s.test(r2[1]);
        };
        var i = a(e("./util/assertString")), n = a(e("./util/merge"));
        function a(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        var o = /^\(?[+-]?(90(\.0+)?|[1-8]?\d(\.\d+)?)$/, s = /^\s?[+-]?(180(\.0+)?|1[0-7]\d(\.\d+)?|\d{1,2}(\.\d+)?)\)?$/, l = /^(([1-8]?\d)\D+([1-5]?\d|60)\D+([1-5]?\d|60)(\.\d+)?|90\D+0\D+0)\D+[NSns]?$/i, u = /^\s*([1-7]?\d{1,2}\D+([1-5]?\d|60)\D+([1-5]?\d|60)(\.\d+)?|180\D+0\D+0)\D+[EWew]?$/i, d = { checkDMS: false };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99, "./util/merge": 101 }], 58: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          var r2, i2;
          (0, o.default)(e2), i2 = "object" === s(t2) ? (r2 = t2.min || 0, t2.max) : (r2 = arguments[1] || 0, arguments[2]);
          var n = e2.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g) || [], a = e2.length - n.length;
          return r2 <= a && (void 0 === i2 || a <= i2);
        };
        var i, o = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        function s(e2) {
          return (s = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e3) {
            return typeof e3;
          } : function(e3) {
            return e3 && "function" == typeof Symbol && e3.constructor === Symbol && e3 !== Symbol.prototype ? "symbol" : typeof e3;
          })(e2);
        }
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 59: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          {
            if ((0, n.default)(e2), t2 in a)
              return a[t2](e2);
            if ("any" === t2) {
              for (var r2 in a) {
                var i2 = a[r2];
                if (i2(e2))
                  return true;
              }
              return false;
            }
          }
          throw new Error("Invalid locale '".concat(t2, "'"));
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = { "cs-CZ": function(e2) {
          return /^(([ABCDEFHKIJKLMNPRSTUVXYZ]|[0-9])-?){5,8}$/.test(e2);
        }, "de-DE": function(e2) {
          return /^((AW|UL|AK|GA|AÖ|LF|AZ|AM|AS|ZE|AN|AB|A|KG|KH|BA|EW|BZ|HY|KM|BT|HP|B|BC|BI|BO|FN|TT|ÜB|BN|AH|BS|FR|HB|ZZ|BB|BK|BÖ|OC|OK|CW|CE|C|CO|LH|CB|KW|LC|LN|DA|DI|DE|DH|SY|NÖ|DO|DD|DU|DN|D|EI|EA|EE|FI|EM|EL|EN|PF|ED|EF|ER|AU|ZP|E|ES|NT|EU|FL|FO|FT|FF|F|FS|FD|FÜ|GE|G|GI|GF|GS|ZR|GG|GP|GR|NY|ZI|GÖ|GZ|GT|HA|HH|HM|HU|WL|HZ|WR|RN|HK|HD|HN|HS|GK|HE|HF|RZ|HI|HG|HO|HX|IK|IL|IN|J|JL|KL|KA|KS|KF|KE|KI|KT|KO|KN|KR|KC|KU|K|LD|LL|LA|L|OP|LM|LI|LB|LU|LÖ|HL|LG|MD|GN|MZ|MA|ML|MR|MY|AT|DM|MC|NZ|RM|RG|MM|ME|MB|MI|FG|DL|HC|MW|RL|MK|MG|MÜ|WS|MH|M|MS|NU|NB|ND|NM|NK|NW|NR|NI|NF|DZ|EB|OZ|TG|TO|N|OA|GM|OB|CA|EH|FW|OF|OL|OE|OG|BH|LR|OS|AA|GD|OH|KY|NP|WK|PB|PA|PE|PI|PS|P|PM|PR|RA|RV|RE|R|H|SB|WN|RS|RD|RT|BM|NE|GV|RP|SU|GL|RO|GÜ|RH|EG|RW|PN|SK|MQ|RU|SZ|RI|SL|SM|SC|HR|FZ|VS|SW|SN|CR|SE|SI|SO|LP|SG|NH|SP|IZ|ST|BF|TE|HV|OD|SR|S|AC|DW|ZW|TF|TS|TR|TÜ|UM|PZ|TP|UE|UN|UH|MN|KK|VB|V|AE|PL|RC|VG|GW|PW|VR|VK|KB|WA|WT|BE|WM|WE|AP|MO|WW|FB|WZ|WI|WB|JE|WF|WO|W|WÜ|BL|Z|GC)[- ]?[A-Z]{1,2}[- ]?\d{1,4}|(AIC|FDB|ABG|SLN|SAW|KLZ|BUL|ESB|NAB|SUL|WST|ABI|AZE|BTF|KÖT|DKB|FEU|ROT|ALZ|SMÜ|WER|AUR|NOR|DÜW|BRK|HAB|TÖL|WOR|BAD|BAR|BER|BIW|EBS|KEM|MÜB|PEG|BGL|BGD|REI|WIL|BKS|BIR|WAT|BOR|BOH|BOT|BRB|BLK|HHM|NEB|NMB|WSF|LEO|HDL|WMS|WZL|BÜS|CHA|KÖZ|ROD|WÜM|CLP|NEC|COC|ZEL|COE|CUX|DAH|LDS|DEG|DEL|RSL|DLG|DGF|LAN|HEI|MED|DON|KIB|ROK|JÜL|MON|SLE|EBE|EIC|HIG|WBS|BIT|PRÜ|LIB|EMD|WIT|ERH|HÖS|ERZ|ANA|ASZ|MAB|MEK|STL|SZB|FDS|HCH|HOR|WOL|FRG|GRA|WOS|FRI|FFB|GAP|GER|BRL|CLZ|GTH|NOH|HGW|GRZ|LÖB|NOL|WSW|DUD|HMÜ|OHA|KRU|HAL|HAM|HBS|QLB|HVL|NAU|HAS|EBN|GEO|HOH|HDH|ERK|HER|WAN|HEF|ROF|HBN|ALF|HSK|USI|NAI|REH|SAN|KÜN|ÖHR|HOL|WAR|ARN|BRG|GNT|HOG|WOH|KEH|MAI|PAR|RID|ROL|KLE|GEL|KUS|KYF|ART|SDH|LDK|DIL|MAL|VIB|LER|BNA|GHA|GRM|MTL|WUR|LEV|LIF|STE|WEL|LIP|VAI|LUP|HGN|LBZ|LWL|PCH|STB|DAN|MKK|SLÜ|MSP|TBB|MGH|MTK|BIN|MSH|EIL|HET|SGH|BID|MYK|MSE|MST|MÜR|WRN|MEI|GRH|RIE|MZG|MIL|OBB|BED|FLÖ|MOL|FRW|SEE|SRB|AIB|MOS|BCH|ILL|SOB|NMS|NEA|SEF|UFF|NEW|VOH|NDH|TDO|NWM|GDB|GVM|WIS|NOM|EIN|GAN|LAU|HEB|OHV|OSL|SFB|ERB|LOS|BSK|KEL|BSB|MEL|WTL|OAL|FÜS|MOD|OHZ|OPR|BÜR|PAF|PLÖ|CAS|GLA|REG|VIT|ECK|SIM|GOA|EMS|DIZ|GOH|RÜD|SWA|NES|KÖN|MET|LRO|BÜZ|DBR|ROS|TET|HRO|ROW|BRV|HIP|PAN|GRI|SHK|EIS|SRO|SOK|LBS|SCZ|MER|QFT|SLF|SLS|HOM|SLK|ASL|BBG|SBK|SFT|SHG|MGN|MEG|ZIG|SAD|NEN|OVI|SHA|BLB|SIG|SON|SPN|FOR|GUB|SPB|IGB|WND|STD|STA|SDL|OBG|HST|BOG|SHL|PIR|FTL|SEB|SÖM|SÜW|TIR|SAB|TUT|ANG|SDT|LÜN|LSZ|MHL|VEC|VER|VIE|OVL|ANK|OVP|SBG|UEM|UER|WLG|GMN|NVP|RDG|RÜG|DAU|FKB|WAF|WAK|SLZ|WEN|SOG|APD|WUG|GUN|ESW|WIZ|WES|DIN|BRA|BÜD|WHV|HWI|GHC|WTM|WOB|WUN|MAK|SEL|OCH|HOT|WDA)[- ]?(([A-Z][- ]?\d{1,4})|([A-Z]{2}[- ]?\d{1,3})))[- ]?(E|H)?$/.test(e2);
        }, "de-LI": function(e2) {
          return /^FL[- ]?\d{1,5}[UZ]?$/.test(e2);
        }, "fi-FI": function(e2) {
          return /^(?=.{4,7})(([A-Z]{1,3}|[0-9]{1,3})[\s-]?([A-Z]{1,3}|[0-9]{1,5}))$/.test(e2);
        }, "pt-PT": function(e2) {
          return /^([A-Z]{2}|[0-9]{2})[ -·]?([A-Z]{2}|[0-9]{2})[ -·]?([A-Z]{2}|[0-9]{2})$/.test(e2);
        }, "sq-AL": function(e2) {
          return /^[A-Z]{2}[- ]?((\d{3}[- ]?(([A-Z]{2})|T))|(R[- ]?\d{3}))$/.test(e2);
        }, "pt-BR": function(e2) {
          return /^[A-Z]{3}[ -]?[0-9][A-Z][0-9]{2}|[A-Z]{3}[ -]?[0-9]{4}$/.test(e2);
        } };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 60: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), "en_US_POSIX" === e2 || "ca_ES_VALENCIA" === e2 || a.test(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /^[A-Za-z]{2,4}([_-]([A-Za-z]{4}|[\d]{3}))?([_-]([A-Za-z]{2}|[\d]{3}))?$/;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 61: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), e2 === e2.toLowerCase();
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 62: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          if ((0, n.default)(e2), t2 && (t2.no_colons || t2.no_separators))
            return o.test(e2);
          return a.test(e2) || s.test(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /^(?:[0-9a-fA-F]{2}([-:\s]))([0-9a-fA-F]{2}\1){4}([0-9a-fA-F]{2})$/, o = /^([0-9a-fA-F]){12}$/, s = /^([0-9a-fA-F]{4}\.){2}([0-9a-fA-F]{4})$/;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 63: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), a.test(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /^[a-f0-9]{32}$/;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 64: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), a.test(e2.trim());
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /^magnet:\?xt(?:\.1)?=urn:(?:aich|bitprint|btih|ed2k|ed2khash|kzhash|md5|sha1|tree:tiger):[a-z0-9]{32}(?:[a-z0-9]{8})?($|&)/i;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 65: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), a.test(e2) || o.test(e2) || s.test(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /^(application|audio|font|image|message|model|multipart|text|video)\/[a-zA-Z0-9\.\-\+]{1,100}$/i, o = /^text\/[a-zA-Z0-9\.\-\+]{1,100};\s?charset=("[a-zA-Z0-9\.\-\+\s]{0,70}"|[a-zA-Z0-9\.\-\+]{0,70})(\s?\([a-zA-Z0-9\.\-\+\s]{1,20}\))?$/i, s = /^multipart\/[a-zA-Z0-9\.\-\+]{1,100}(;\s?(boundary|charset)=("[a-zA-Z0-9\.\-\+\s]{0,70}"|[a-zA-Z0-9\.\-\+]{0,70})(\s?\([a-zA-Z0-9\.\-\+\s]{1,20}\))?){0,2}$/i;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 66: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(r2, e2, t2) {
          if ((0, a.default)(r2), t2 && t2.strictMode && !r2.startsWith("+"))
            return false;
          {
            if (Array.isArray(e2))
              return e2.some(function(e3) {
                if (o.hasOwnProperty(e3)) {
                  var t3 = o[e3];
                  if (t3.test(r2))
                    return true;
                }
                return false;
              });
            if (e2 in o)
              return o[e2].test(r2);
            if (!e2 || "any" === e2) {
              for (var i2 in o)
                if (o.hasOwnProperty(i2)) {
                  var n2 = o[i2];
                  if (n2.test(r2))
                    return true;
                }
              return false;
            }
          }
          throw new Error("Invalid locale '".concat(e2, "'"));
        }, r.locales = void 0;
        var i, a = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var o = { "am-AM": /^(\+?374|0)((10|[9|7][0-9])\d{6}$|[2-4]\d{7}$)/, "ar-AE": /^((\+?971)|0)?5[024568]\d{7}$/, "ar-BH": /^(\+?973)?(3|6)\d{7}$/, "ar-DZ": /^(\+?213|0)(5|6|7)\d{8}$/, "ar-LB": /^(\+?961)?((3|81)\d{6}|7\d{7})$/, "ar-EG": /^((\+?20)|0)?1[0125]\d{8}$/, "ar-IQ": /^(\+?964|0)?7[0-9]\d{8}$/, "ar-JO": /^(\+?962|0)?7[789]\d{7}$/, "ar-KW": /^(\+?965)[569]\d{7}$/, "ar-LY": /^((\+?218)|0)?(9[1-6]\d{7}|[1-8]\d{7,9})$/, "ar-MA": /^(?:(?:\+|00)212|0)[5-7]\d{8}$/, "ar-OM": /^((\+|00)968)?(9[1-9])\d{6}$/, "ar-PS": /^(\+?970|0)5[6|9](\d{7})$/, "ar-SA": /^(!?(\+?966)|0)?5\d{8}$/, "ar-SY": /^(!?(\+?963)|0)?9\d{8}$/, "ar-TN": /^(\+?216)?[2459]\d{7}$/, "az-AZ": /^(\+994|0)(5[015]|7[07]|99)\d{7}$/, "bs-BA": /^((((\+|00)3876)|06))((([0-3]|[5-6])\d{6})|(4\d{7}))$/, "be-BY": /^(\+?375)?(24|25|29|33|44)\d{7}$/, "bg-BG": /^(\+?359|0)?8[789]\d{7}$/, "bn-BD": /^(\+?880|0)1[13456789][0-9]{8}$/, "ca-AD": /^(\+376)?[346]\d{5}$/, "cs-CZ": /^(\+?420)? ?[1-9][0-9]{2} ?[0-9]{3} ?[0-9]{3}$/, "da-DK": /^(\+?45)?\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/, "de-DE": /^((\+49|0)[1|3])([0|5][0-45-9]\d|6([23]|0\d?)|7([0-57-9]|6\d))\d{7,9}$/, "de-AT": /^(\+43|0)\d{1,4}\d{3,12}$/, "de-CH": /^(\+41|0)([1-9])\d{1,9}$/, "de-LU": /^(\+352)?((6\d1)\d{6})$/, "dv-MV": /^(\+?960)?(7[2-9]|91|9[3-9])\d{7}$/, "el-GR": /^(\+?30|0)?(69\d{8})$/, "en-AU": /^(\+?61|0)4\d{8}$/, "en-BM": /^(\+?1)?441(((3|7)\d{6}$)|(5[0-3][0-9]\d{4}$)|(59\d{5}))/, "en-GB": /^(\+?44|0)7\d{9}$/, "en-GG": /^(\+?44|0)1481\d{6}$/, "en-GH": /^(\+233|0)(20|50|24|54|27|57|26|56|23|28|55|59)\d{7}$/, "en-GY": /^(\+592|0)6\d{6}$/, "en-HK": /^(\+?852[-\s]?)?[456789]\d{3}[-\s]?\d{4}$/, "en-MO": /^(\+?853[-\s]?)?[6]\d{3}[-\s]?\d{4}$/, "en-IE": /^(\+?353|0)8[356789]\d{7}$/, "en-IN": /^(\+?91|0)?[6789]\d{9}$/, "en-KE": /^(\+?254|0)(7|1)\d{8}$/, "en-KI": /^((\+686|686)?)?( )?((6|7)(2|3|8)[0-9]{6})$/, "en-MT": /^(\+?356|0)?(99|79|77|21|27|22|25)[0-9]{6}$/, "en-MU": /^(\+?230|0)?\d{8}$/, "en-NA": /^(\+?264|0)(6|8)\d{7}$/, "en-NG": /^(\+?234|0)?[789]\d{9}$/, "en-NZ": /^(\+?64|0)[28]\d{7,9}$/, "en-PK": /^((00|\+)?92|0)3[0-6]\d{8}$/, "en-PH": /^(09|\+639)\d{9}$/, "en-RW": /^(\+?250|0)?[7]\d{8}$/, "en-SG": /^(\+65)?[3689]\d{7}$/, "en-SL": /^(\+?232|0)\d{8}$/, "en-TZ": /^(\+?255|0)?[67]\d{8}$/, "en-UG": /^(\+?256|0)?[7]\d{8}$/, "en-US": /^((\+1|1)?( |-)?)?(\([2-9][0-9]{2}\)|[2-9][0-9]{2})( |-)?([2-9][0-9]{2}( |-)?[0-9]{4})$/, "en-ZA": /^(\+?27|0)\d{9}$/, "en-ZM": /^(\+?26)?09[567]\d{7}$/, "en-ZW": /^(\+263)[0-9]{9}$/, "en-BW": /^(\+?267)?(7[1-8]{1})\d{6}$/, "es-AR": /^\+?549(11|[2368]\d)\d{8}$/, "es-BO": /^(\+?591)?(6|7)\d{7}$/, "es-CO": /^(\+?57)?3(0(0|1|2|4|5)|1\d|2[0-4]|5(0|1))\d{7}$/, "es-CL": /^(\+?56|0)[2-9]\d{1}\d{7}$/, "es-CR": /^(\+506)?[2-8]\d{7}$/, "es-CU": /^(\+53|0053)?5\d{7}/, "es-DO": /^(\+?1)?8[024]9\d{7}$/, "es-HN": /^(\+?504)?[9|8]\d{7}$/, "es-EC": /^(\+?593|0)([2-7]|9[2-9])\d{7}$/, "es-ES": /^(\+?34)?[6|7]\d{8}$/, "es-PE": /^(\+?51)?9\d{8}$/, "es-MX": /^(\+?52)?(1|01)?\d{10,11}$/, "es-PA": /^(\+?507)\d{7,8}$/, "es-PY": /^(\+?595|0)9[9876]\d{7}$/, "es-SV": /^(\+?503)?[67]\d{7}$/, "es-UY": /^(\+598|0)9[1-9][\d]{6}$/, "es-VE": /^(\+?58)?(2|4)\d{9}$/, "et-EE": /^(\+?372)?\s?(5|8[1-4])\s?([0-9]\s?){6,7}$/, "fa-IR": /^(\+?98[\-\s]?|0)9[0-39]\d[\-\s]?\d{3}[\-\s]?\d{4}$/, "fi-FI": /^(\+?358|0)\s?(4(0|1|2|4|5|6)?|50)\s?(\d\s?){4,8}\d$/, "fj-FJ": /^(\+?679)?\s?\d{3}\s?\d{4}$/, "fo-FO": /^(\+?298)?\s?\d{2}\s?\d{2}\s?\d{2}$/, "fr-BF": /^(\+226|0)[67]\d{7}$/, "fr-CM": /^(\+?237)6[0-9]{8}$/, "fr-FR": /^(\+?33|0)[67]\d{8}$/, "fr-GF": /^(\+?594|0|00594)[67]\d{8}$/, "fr-GP": /^(\+?590|0|00590)[67]\d{8}$/, "fr-MQ": /^(\+?596|0|00596)[67]\d{8}$/, "fr-PF": /^(\+?689)?8[789]\d{6}$/, "fr-RE": /^(\+?262|0|00262)[67]\d{8}$/, "he-IL": /^(\+972|0)([23489]|5[012345689]|77)[1-9]\d{6}$/, "hu-HU": /^(\+?36|06)(20|30|31|50|70)\d{7}$/, "id-ID": /^(\+?62|0)8(1[123456789]|2[1238]|3[1238]|5[12356789]|7[78]|9[56789]|8[123456789])([\s?|\d]{5,11})$/, "it-IT": /^(\+?39)?\s?3\d{2} ?\d{6,7}$/, "it-SM": /^((\+378)|(0549)|(\+390549)|(\+3780549))?6\d{5,9}$/, "ja-JP": /^(\+81[ \-]?(\(0\))?|0)[6789]0[ \-]?\d{4}[ \-]?\d{4}$/, "ka-GE": /^(\+?995)?(5|79)\d{7}$/, "kk-KZ": /^(\+?7|8)?7\d{9}$/, "kl-GL": /^(\+?299)?\s?\d{2}\s?\d{2}\s?\d{2}$/, "ko-KR": /^((\+?82)[ \-]?)?0?1([0|1|6|7|8|9]{1})[ \-]?\d{3,4}[ \-]?\d{4}$/, "lt-LT": /^(\+370|8)\d{8}$/, "lv-LV": /^(\+?371)2\d{7}$/, "ms-MY": /^(\+?6?01){1}(([0145]{1}(\-|\s)?\d{7,8})|([236789]{1}(\s|\-)?\d{7}))$/, "mz-MZ": /^(\+?258)?8[234567]\d{7}$/, "nb-NO": /^(\+?47)?[49]\d{7}$/, "ne-NP": /^(\+?977)?9[78]\d{8}$/, "nl-BE": /^(\+?32|0)4\d{8}$/, "nl-NL": /^(((\+|00)?31\(0\))|((\+|00)?31)|0)6{1}\d{8}$/, "nn-NO": /^(\+?47)?[49]\d{7}$/, "pl-PL": /^(\+?48)? ?[5-8]\d ?\d{3} ?\d{2} ?\d{2}$/, "pt-BR": /^((\+?55\ ?[1-9]{2}\ ?)|(\+?55\ ?\([1-9]{2}\)\ ?)|(0[1-9]{2}\ ?)|(\([1-9]{2}\)\ ?)|([1-9]{2}\ ?))((\d{4}\-?\d{4})|(9[2-9]{1}\d{3}\-?\d{4}))$/, "pt-PT": /^(\+?351)?9[1236]\d{7}$/, "pt-AO": /^(\+244)\d{9}$/, "ro-RO": /^(\+?4?0)\s?7\d{2}(\/|\s|\.|\-)?\d{3}(\s|\.|\-)?\d{3}$/, "ru-RU": /^(\+?7|8)?9\d{9}$/, "si-LK": /^(?:0|94|\+94)?(7(0|1|2|4|5|6|7|8)( |-)?)\d{7}$/, "sl-SI": /^(\+386\s?|0)(\d{1}\s?\d{3}\s?\d{2}\s?\d{2}|\d{2}\s?\d{3}\s?\d{3})$/, "sk-SK": /^(\+?421)? ?[1-9][0-9]{2} ?[0-9]{3} ?[0-9]{3}$/, "sq-AL": /^(\+355|0)6[789]\d{6}$/, "sr-RS": /^(\+3816|06)[- \d]{5,9}$/, "sv-SE": /^(\+?46|0)[\s\-]?7[\s\-]?[02369]([\s\-]?\d){7}$/, "tg-TJ": /^(\+?992)?[5][5]\d{7}$/, "th-TH": /^(\+66|66|0)\d{9}$/, "tr-TR": /^(\+?90|0)?5\d{9}$/, "tk-TM": /^(\+993|993|8)\d{8}$/, "uk-UA": /^(\+?38|8)?0\d{9}$/, "uz-UZ": /^(\+?998)?(6[125-79]|7[1-69]|88|9\d)\d{7}$/, "vi-VN": /^((\+?84)|0)((3([2-9]))|(5([25689]))|(7([0|6-9]))|(8([1-9]))|(9([0-9])))([0-9]{7})$/, "zh-CN": /^((\+|00)86)?(1[3-9]|9[28])\d{9}$/, "zh-TW": /^(\+?886\-?|0)?9\d{8}$/, "dz-BT": /^(\+?975|0)?(17|16|77|02)\d{6}$/ };
        o["en-CA"] = o["en-US"], o["fr-CA"] = o["en-CA"], o["fr-BE"] = o["nl-BE"], o["zh-HK"] = o["en-HK"], o["zh-MO"] = o["en-MO"], o["ga-IE"] = o["en-IE"], o["fr-CH"] = o["de-CH"], o["it-CH"] = o["fr-CH"];
        var n = Object.keys(o);
        r.locales = n;
      }, { "./util/assertString": 99 }], 67: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, i.default)(e2), (0, n.default)(e2) && 24 === e2.length;
        };
        var i = a(e("./util/assertString")), n = a(e("./isHexadecimal"));
        function a(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        t.exports = r.default, t.exports.default = r.default;
      }, { "./isHexadecimal": 39, "./util/assertString": 99 }], 68: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), a.test(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /[^\x00-\x7F]/;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 69: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          if ((0, n.default)(e2), t2 && t2.no_symbols)
            return o.test(e2);
          return new RegExp("^[+-]?([0-9]*[".concat((t2 || {}).locale ? a.decimal[t2.locale] : ".", "])?[0-9]+$")).test(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i }, a = e("./alpha");
        var o = /^[0-9]+$/;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./alpha": 5, "./util/assertString": 99 }], 70: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), a.test(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /^(0o)?[0-7]+$/i;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 71: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          (0, n.default)(e2);
          var r2 = e2.replace(/\s/g, "").toUpperCase();
          return t2.toUpperCase() in a && a[t2].test(r2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = { AM: /^[A-Z]{2}\d{7}$/, AR: /^[A-Z]{3}\d{6}$/, AT: /^[A-Z]\d{7}$/, AU: /^[A-Z]\d{7}$/, BE: /^[A-Z]{2}\d{6}$/, BG: /^\d{9}$/, BR: /^[A-Z]{2}\d{6}$/, BY: /^[A-Z]{2}\d{7}$/, CA: /^[A-Z]{2}\d{6}$/, CH: /^[A-Z]\d{7}$/, CN: /^G\d{8}$|^E(?![IO])[A-Z0-9]\d{7}$/, CY: /^[A-Z](\d{6}|\d{8})$/, CZ: /^\d{8}$/, DE: /^[CFGHJKLMNPRTVWXYZ0-9]{9}$/, DK: /^\d{9}$/, DZ: /^\d{9}$/, EE: /^([A-Z]\d{7}|[A-Z]{2}\d{7})$/, ES: /^[A-Z0-9]{2}([A-Z0-9]?)\d{6}$/, FI: /^[A-Z]{2}\d{7}$/, FR: /^\d{2}[A-Z]{2}\d{5}$/, GB: /^\d{9}$/, GR: /^[A-Z]{2}\d{7}$/, HR: /^\d{9}$/, HU: /^[A-Z]{2}(\d{6}|\d{7})$/, IE: /^[A-Z0-9]{2}\d{7}$/, IN: /^[A-Z]{1}-?\d{7}$/, ID: /^[A-C]\d{7}$/, IR: /^[A-Z]\d{8}$/, IS: /^(A)\d{7}$/, IT: /^[A-Z0-9]{2}\d{7}$/, JP: /^[A-Z]{2}\d{7}$/, KR: /^[MS]\d{8}$/, LT: /^[A-Z0-9]{8}$/, LU: /^[A-Z0-9]{8}$/, LV: /^[A-Z0-9]{2}\d{7}$/, LY: /^[A-Z0-9]{8}$/, MT: /^\d{7}$/, MZ: /^([A-Z]{2}\d{7})|(\d{2}[A-Z]{2}\d{5})$/, MY: /^[AHK]\d{8}$/, NL: /^[A-Z]{2}[A-Z0-9]{6}\d$/, PL: /^[A-Z]{2}\d{7}$/, PT: /^[A-Z]\d{6}$/, RO: /^\d{8,9}$/, RU: /^\d{9}$/, SE: /^\d{8}$/, SL: /^(P)[A-Z]\d{7}$/, SK: /^[0-9A-Z]\d{7}$/, TR: /^[A-Z]\d{8}$/, UA: /^[A-Z]{2}\d{6}$/, US: /^\d{9}$/ };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 72: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2, { min: 0, max: 65535 });
        };
        var i, n = (i = e("./isInt")) && i.__esModule ? i : { default: i };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./isInt": 54 }], 73: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          {
            if ((0, n.default)(e2), t2 in l)
              return l[t2].test(e2);
            if ("any" === t2) {
              for (var r2 in l)
                if (l.hasOwnProperty(r2)) {
                  var i2 = l[r2];
                  if (i2.test(e2))
                    return true;
                }
              return false;
            }
          }
          throw new Error("Invalid locale '".concat(t2, "'"));
        }, r.locales = void 0;
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /^\d{4}$/, o = /^\d{5}$/, s = /^\d{6}$/, l = { AD: /^AD\d{3}$/, AT: a, AU: a, AZ: /^AZ\d{4}$/, BE: a, BG: a, BR: /^\d{5}-\d{3}$/, BY: /2[1-4]{1}\d{4}$/, CA: /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][\s\-]?\d[ABCEGHJ-NPRSTV-Z]\d$/i, CH: a, CN: /^(0[1-7]|1[012356]|2[0-7]|3[0-6]|4[0-7]|5[1-7]|6[1-7]|7[1-5]|8[1345]|9[09])\d{4}$/, CZ: /^\d{3}\s?\d{2}$/, DE: o, DK: a, DO: o, DZ: o, EE: o, ES: /^(5[0-2]{1}|[0-4]{1}\d{1})\d{3}$/, FI: o, FR: /^\d{2}\s?\d{3}$/, GB: /^(gir\s?0aa|[a-z]{1,2}\d[\da-z]?\s?(\d[a-z]{2})?)$/i, GR: /^\d{3}\s?\d{2}$/, HR: /^([1-5]\d{4}$)/, HT: /^HT\d{4}$/, HU: a, ID: o, IE: /^(?!.*(?:o))[A-Za-z]\d[\dw]\s\w{4}$/i, IL: /^(\d{5}|\d{7})$/, IN: /^((?!10|29|35|54|55|65|66|86|87|88|89)[1-9][0-9]{5})$/, IR: /\b(?!(\d)\1{3})[13-9]{4}[1346-9][013-9]{5}\b/, IS: /^\d{3}$/, IT: o, JP: /^\d{3}\-\d{4}$/, KE: o, KR: /^(\d{5}|\d{6})$/, LI: /^(948[5-9]|949[0-7])$/, LT: /^LT\-\d{5}$/, LU: a, LV: /^LV\-\d{4}$/, LK: o, MX: o, MT: /^[A-Za-z]{3}\s{0,1}\d{4}$/, MY: o, NL: /^\d{4}\s?[a-z]{2}$/i, NO: a, NP: /^(10|21|22|32|33|34|44|45|56|57)\d{3}$|^(977)$/i, NZ: a, PL: /^\d{2}\-\d{3}$/, PR: /^00[679]\d{2}([ -]\d{4})?$/, PT: /^\d{4}\-\d{3}?$/, RO: s, RU: s, SA: o, SE: /^[1-9]\d{2}\s?\d{2}$/, SG: s, SI: a, SK: /^\d{3}\s?\d{2}$/, TH: o, TN: a, TW: /^\d{3}(\d{2})?$/, UA: o, US: /^\d{5}(-\d{4})?$/, ZA: a, ZM: o }, u = Object.keys(l);
        r.locales = u;
      }, { "./util/assertString": 99 }], 74: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), c.test(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /([01][0-9]|2[0-3])/, o = /[0-5][0-9]/, s = new RegExp("[-+]".concat(a.source, ":").concat(o.source)), l = new RegExp("([zZ]|".concat(s.source, ")")), u = new RegExp("".concat(a.source, ":").concat(o.source, ":").concat(/([0-5][0-9]|60)/.source).concat(/(\.[0-9]+)?/.source)), d = new RegExp("".concat(/[0-9]{4}/.source, "-").concat(/(0[1-9]|1[0-2])/.source, "-").concat(/([12]\d|0[1-9]|3[01])/.source)), f = new RegExp("".concat(u.source).concat(l.source)), c = new RegExp("^".concat(d.source, "[ tT]").concat(f.source, "$"));
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 75: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          var t2 = !(1 < arguments.length && void 0 !== arguments[1]) || arguments[1];
          return (0, n.default)(e2), t2 ? a.test(e2) || o.test(e2) || s.test(e2) || l.test(e2) : a.test(e2) || o.test(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /^rgb\((([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]),){2}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\)$/, o = /^rgba\((([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]),){3}(0?\.\d|1(\.0)?|0(\.0)?)\)$/, s = /^rgb\((([0-9]%|[1-9][0-9]%|100%),){2}([0-9]%|[1-9][0-9]%|100%)\)/, l = /^rgba\((([0-9]%|[1-9][0-9]%|100%),){3}(0?\.\d|1(\.0)?|0(\.0)?)\)/;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 76: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, i.default)(e2), a.test(e2);
        };
        var i = n(e("./util/assertString"));
        function n(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        var a = (0, n(e("./util/multilineRegex")).default)(["^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)", "(?:-((?:0|[1-9]\\d*|\\d*[a-z-][0-9a-z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-z-][0-9a-z-]*))*))", "?(?:\\+([0-9a-z-]+(?:\\.[0-9a-z-]+)*))?$"], "i");
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99, "./util/multilineRegex": 102 }], 77: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), a.test(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /^[^\s-_](?!.*?[-_]{2,})[a-z0-9-\\][^\s]*[^-_\s]$/;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 78: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          var t2 = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : null;
          (0, u.default)(e2);
          var r2 = (i2 = e2, o = i2, s = {}, Array.from(o).forEach(function(e3) {
            s[e3] ? s[e3] += 1 : s[e3] = 1;
          }), n = s, a = { length: i2.length, uniqueChars: Object.keys(n).length, uppercaseCount: 0, lowercaseCount: 0, numberCount: 0, symbolCount: 0 }, Object.keys(n).forEach(function(e3) {
            d.test(e3) ? a.uppercaseCount += n[e3] : f.test(e3) ? a.lowercaseCount += n[e3] : c.test(e3) ? a.numberCount += n[e3] : p.test(e3) && (a.symbolCount += n[e3]);
          }), a);
          var i2, n, a, o, s;
          if ((t2 = (0, l.default)(t2 || {}, h)).returnScore)
            return function(e3, t3) {
              var r3 = 0;
              r3 += e3.uniqueChars * t3.pointsPerUnique, r3 += (e3.length - e3.uniqueChars) * t3.pointsPerRepeat, 0 < e3.lowercaseCount && (r3 += t3.pointsForContainingLower);
              0 < e3.uppercaseCount && (r3 += t3.pointsForContainingUpper);
              0 < e3.numberCount && (r3 += t3.pointsForContainingNumber);
              0 < e3.symbolCount && (r3 += t3.pointsForContainingSymbol);
              return r3;
            }(r2, t2);
          return r2.length >= t2.minLength && r2.lowercaseCount >= t2.minLowercase && r2.uppercaseCount >= t2.minUppercase && r2.numberCount >= t2.minNumbers && r2.symbolCount >= t2.minSymbols;
        };
        var l = i(e("./util/merge")), u = i(e("./util/assertString"));
        function i(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        var d = /^[A-Z]$/, f = /^[a-z]$/, c = /^[0-9]$/, p = /^[-#!$@%^&*()_+|~=`{}\[\]:";'<>?,.\/ ]$/, h = { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1, returnScore: false, pointsPerUnique: 1, pointsPerRepeat: 0.5, pointsForContainingLower: 10, pointsForContainingUpper: 10, pointsForContainingNumber: 10, pointsForContainingSymbol: 10 };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99, "./util/merge": 101 }], 79: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), a.test(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 80: [function(e, t, r) {
        "use strict";
        function o(e2) {
          return (o = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e3) {
            return typeof e3;
          } : function(e3) {
            return e3 && "function" == typeof Symbol && e3.constructor === Symbol && e3 !== Symbol.prototype ? "symbol" : typeof e3;
          })(e2);
        }
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          var t2 = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : "en-US";
          (0, i.default)(e2);
          var r2 = e2.slice(0);
          if (t2 in f)
            return t2 in h && (r2 = r2.replace(h[t2], "")), !!f[t2].test(r2) && (!(t2 in c) || c[t2](r2));
          throw new Error("Invalid locale '".concat(t2, "'"));
        };
        var i = n(e("./util/assertString")), l = function(e2) {
          if (e2 && e2.__esModule)
            return e2;
          if (null === e2 || "object" !== o(e2) && "function" != typeof e2)
            return { default: e2 };
          var t2 = s();
          if (t2 && t2.has(e2))
            return t2.get(e2);
          var r2 = {}, i2 = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var n2 in e2)
            if (Object.prototype.hasOwnProperty.call(e2, n2)) {
              var a2 = i2 ? Object.getOwnPropertyDescriptor(e2, n2) : null;
              a2 && (a2.get || a2.set) ? Object.defineProperty(r2, n2, a2) : r2[n2] = e2[n2];
            }
          r2.default = e2, t2 && t2.set(e2, r2);
          return r2;
        }(e("./util/algorithms")), v = n(e("./isDate"));
        function s() {
          if ("function" != typeof WeakMap)
            return null;
          var e2 = /* @__PURE__ */ new WeakMap();
          return s = function() {
            return e2;
          }, e2;
        }
        function n(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        function a(e2) {
          return function(e3) {
            if (Array.isArray(e3))
              return u(e3);
          }(e2) || function(e3) {
            if ("undefined" != typeof Symbol && Symbol.iterator in Object(e3))
              return Array.from(e3);
          }(e2) || function(e3, t2) {
            if (!e3)
              return;
            if ("string" == typeof e3)
              return u(e3, t2);
            var r2 = Object.prototype.toString.call(e3).slice(8, -1);
            "Object" === r2 && e3.constructor && (r2 = e3.constructor.name);
            if ("Map" === r2 || "Set" === r2)
              return Array.from(e3);
            if ("Arguments" === r2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r2))
              return u(e3, t2);
          }(e2) || function() {
            throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
          }();
        }
        function u(e2, t2) {
          (null == t2 || t2 > e2.length) && (t2 = e2.length);
          for (var r2 = 0, i2 = new Array(t2); r2 < t2; r2++)
            i2[r2] = e2[r2];
          return i2;
        }
        var d = { andover: ["10", "12"], atlanta: ["60", "67"], austin: ["50", "53"], brookhaven: ["01", "02", "03", "04", "05", "06", "11", "13", "14", "16", "21", "22", "23", "25", "34", "51", "52", "54", "55", "56", "57", "58", "59", "65"], cincinnati: ["30", "32", "35", "36", "37", "38", "61"], fresno: ["15", "24"], internet: ["20", "26", "27", "45", "46", "47"], kansas: ["40", "44"], memphis: ["94", "95"], ogden: ["80", "90"], philadelphia: ["33", "39", "41", "42", "43", "46", "48", "62", "63", "64", "66", "68", "71", "72", "73", "74", "75", "76", "77", "81", "82", "83", "84", "85", "86", "87", "88", "91", "92", "93", "98", "99"], sba: ["31"] };
        function _(e2) {
          for (var t2 = false, r2 = false, i2 = 0; i2 < 3; i2++)
            if (!t2 && /[AEIOU]/.test(e2[i2]))
              t2 = true;
            else if (!r2 && t2 && "X" === e2[i2])
              r2 = true;
            else if (0 < i2) {
              if (t2 && !r2 && !/[AEIOU]/.test(e2[i2]))
                return false;
              if (r2 && !/X/.test(e2[i2]))
                return false;
            }
          return true;
        }
        var f = { "bg-BG": /^\d{10}$/, "cs-CZ": /^\d{6}\/{0,1}\d{3,4}$/, "de-AT": /^\d{9}$/, "de-DE": /^[1-9]\d{10}$/, "dk-DK": /^\d{6}-{0,1}\d{4}$/, "el-CY": /^[09]\d{7}[A-Z]$/, "el-GR": /^([0-4]|[7-9])\d{8}$/, "en-GB": /^\d{10}$|^(?!GB|NK|TN|ZZ)(?![DFIQUV])[A-Z](?![DFIQUVO])[A-Z]\d{6}[ABCD ]$/i, "en-IE": /^\d{7}[A-W][A-IW]{0,1}$/i, "en-US": /^\d{2}[- ]{0,1}\d{7}$/, "es-ES": /^(\d{0,8}|[XYZKLM]\d{7})[A-HJ-NP-TV-Z]$/i, "et-EE": /^[1-6]\d{6}(00[1-9]|0[1-9][0-9]|[1-6][0-9]{2}|70[0-9]|710)\d$/, "fi-FI": /^\d{6}[-+A]\d{3}[0-9A-FHJ-NPR-Y]$/i, "fr-BE": /^\d{11}$/, "fr-FR": /^[0-3]\d{12}$|^[0-3]\d\s\d{2}(\s\d{3}){3}$/, "fr-LU": /^\d{13}$/, "hr-HR": /^\d{11}$/, "hu-HU": /^8\d{9}$/, "it-IT": /^[A-Z]{6}[L-NP-V0-9]{2}[A-EHLMPRST][L-NP-V0-9]{2}[A-ILMZ][L-NP-V0-9]{3}[A-Z]$/i, "lv-LV": /^\d{6}-{0,1}\d{5}$/, "mt-MT": /^\d{3,7}[APMGLHBZ]$|^([1-8])\1\d{7}$/i, "nl-NL": /^\d{9}$/, "pl-PL": /^\d{10,11}$/, "pt-BR": /(?:^\d{11}$)|(?:^\d{14}$)/, "pt-PT": /^\d{9}$/, "ro-RO": /^\d{13}$/, "sk-SK": /^\d{6}\/{0,1}\d{3,4}$/, "sl-SI": /^[1-9]\d{7}$/, "sv-SE": /^(\d{6}[-+]{0,1}\d{4}|(18|19|20)\d{6}[-+]{0,1}\d{4})$/ };
        f["lb-LU"] = f["fr-LU"], f["lt-LT"] = f["et-EE"], f["nl-BE"] = f["fr-BE"];
        var c = { "bg-BG": function(e2) {
          var t2 = e2.slice(0, 2), r2 = parseInt(e2.slice(2, 4), 10);
          t2 = 40 < r2 ? (r2 -= 40, "20".concat(t2)) : 20 < r2 ? (r2 -= 20, "18".concat(t2)) : "19".concat(t2), r2 < 10 && (r2 = "0".concat(r2));
          var i2 = "".concat(t2, "/").concat(r2, "/").concat(e2.slice(4, 6));
          if (!(0, v.default)(i2, "YYYY/MM/DD"))
            return false;
          for (var n2 = e2.split("").map(function(e3) {
            return parseInt(e3, 10);
          }), a2 = [2, 4, 8, 5, 10, 9, 7, 3, 6], o2 = 0, s2 = 0; s2 < a2.length; s2++)
            o2 += n2[s2] * a2[s2];
          return (o2 = o2 % 11 == 10 ? 0 : o2 % 11) === n2[9];
        }, "cs-CZ": function(e2) {
          e2 = e2.replace(/\W/, "");
          var t2 = parseInt(e2.slice(0, 2), 10);
          if (10 === e2.length)
            t2 = t2 < 54 ? "20".concat(t2) : "19".concat(t2);
          else {
            if ("000" === e2.slice(6))
              return false;
            if (!(t2 < 54))
              return false;
            t2 = "19".concat(t2);
          }
          3 === t2.length && (t2 = [t2.slice(0, 2), "0", t2.slice(2)].join(""));
          var r2 = parseInt(e2.slice(2, 4), 10);
          if (50 < r2 && (r2 -= 50), 20 < r2) {
            if (parseInt(t2, 10) < 2004)
              return false;
            r2 -= 20;
          }
          r2 < 10 && (r2 = "0".concat(r2));
          var i2 = "".concat(t2, "/").concat(r2, "/").concat(e2.slice(4, 6));
          if (!(0, v.default)(i2, "YYYY/MM/DD"))
            return false;
          if (10 === e2.length && parseInt(e2, 10) % 11 != 0) {
            var n2 = parseInt(e2.slice(0, 9), 10) % 11;
            if (!(parseInt(t2, 10) < 1986 && 10 === n2))
              return false;
            if (0 !== parseInt(e2.slice(9), 10))
              return false;
          }
          return true;
        }, "de-AT": function(e2) {
          return l.luhnCheck(e2);
        }, "de-DE": function(e2) {
          for (var t2 = e2.split("").map(function(e3) {
            return parseInt(e3, 10);
          }), r2 = [], i2 = 0; i2 < t2.length - 1; i2++) {
            r2.push("");
            for (var n2 = 0; n2 < t2.length - 1; n2++)
              t2[i2] === t2[n2] && (r2[i2] += n2);
          }
          if (2 !== (r2 = r2.filter(function(e3) {
            return 1 < e3.length;
          })).length && 3 !== r2.length)
            return false;
          if (3 === r2[0].length) {
            for (var a2 = r2[0].split("").map(function(e3) {
              return parseInt(e3, 10);
            }), o2 = 0, s2 = 0; s2 < a2.length - 1; s2++)
              a2[s2] + 1 === a2[s2 + 1] && (o2 += 1);
            if (2 === o2)
              return false;
          }
          return l.iso7064Check(e2);
        }, "dk-DK": function(e2) {
          e2 = e2.replace(/\W/, "");
          var t2 = parseInt(e2.slice(4, 6), 10);
          switch (e2.slice(6, 7)) {
            case "0":
            case "1":
            case "2":
            case "3":
              t2 = "19".concat(t2);
              break;
            case "4":
            case "9":
              t2 = t2 < 37 ? "20".concat(t2) : "19".concat(t2);
              break;
            default:
              if (t2 < 37)
                t2 = "20".concat(t2);
              else {
                if (!(58 < t2))
                  return false;
                t2 = "18".concat(t2);
              }
          }
          3 === t2.length && (t2 = [t2.slice(0, 2), "0", t2.slice(2)].join(""));
          var r2 = "".concat(t2, "/").concat(e2.slice(2, 4), "/").concat(e2.slice(0, 2));
          if (!(0, v.default)(r2, "YYYY/MM/DD"))
            return false;
          for (var i2 = e2.split("").map(function(e3) {
            return parseInt(e3, 10);
          }), n2 = 0, a2 = 4, o2 = 0; o2 < 9; o2++)
            n2 += i2[o2] * a2, 1 == (a2 -= 1) && (a2 = 7);
          return 1 != (n2 %= 11) && (0 === n2 ? 0 === i2[9] : i2[9] === 11 - n2);
        }, "el-CY": function(e2) {
          for (var t2 = e2.slice(0, 8).split("").map(function(e3) {
            return parseInt(e3, 10);
          }), r2 = 0, i2 = 1; i2 < t2.length; i2 += 2)
            r2 += t2[i2];
          for (var n2 = 0; n2 < t2.length; n2 += 2)
            t2[n2] < 2 ? r2 += 1 - t2[n2] : (r2 += 2 * (t2[n2] - 2) + 5, 4 < t2[n2] && (r2 += 2));
          return String.fromCharCode(r2 % 26 + 65) === e2.charAt(8);
        }, "el-GR": function(e2) {
          for (var t2 = e2.split("").map(function(e3) {
            return parseInt(e3, 10);
          }), r2 = 0, i2 = 0; i2 < 8; i2++)
            r2 += t2[i2] * Math.pow(2, 8 - i2);
          return r2 % 11 % 10 === t2[8];
        }, "en-IE": function(e2) {
          var t2 = l.reverseMultiplyAndSum(e2.split("").slice(0, 7).map(function(e3) {
            return parseInt(e3, 10);
          }), 8);
          return 9 === e2.length && "W" !== e2[8] && (t2 += 9 * (e2[8].charCodeAt(0) - 64)), 0 == (t2 %= 23) ? "W" === e2[7].toUpperCase() : e2[7].toUpperCase() === String.fromCharCode(64 + t2);
        }, "en-US": function(e2) {
          return -1 !== function() {
            var e3 = [];
            for (var t2 in d)
              d.hasOwnProperty(t2) && e3.push.apply(e3, a(d[t2]));
            return e3;
          }().indexOf(e2.substr(0, 2));
        }, "es-ES": function(e2) {
          var t2 = e2.toUpperCase().split("");
          if (isNaN(parseInt(t2[0], 10)) && 1 < t2.length) {
            var r2 = 0;
            switch (t2[0]) {
              case "Y":
                r2 = 1;
                break;
              case "Z":
                r2 = 2;
            }
            t2.splice(0, 1, r2);
          } else
            for (; t2.length < 9; )
              t2.unshift(0);
          t2 = t2.join("");
          var i2 = parseInt(t2.slice(0, 8), 10) % 23;
          return t2[8] === ["T", "R", "W", "A", "G", "M", "Y", "F", "P", "D", "X", "B", "N", "J", "Z", "S", "Q", "V", "H", "L", "C", "K", "E"][i2];
        }, "et-EE": function(e2) {
          var t2 = e2.slice(1, 3);
          switch (e2.slice(0, 1)) {
            case "1":
            case "2":
              t2 = "18".concat(t2);
              break;
            case "3":
            case "4":
              t2 = "19".concat(t2);
              break;
            default:
              t2 = "20".concat(t2);
          }
          var r2 = "".concat(t2, "/").concat(e2.slice(3, 5), "/").concat(e2.slice(5, 7));
          if (!(0, v.default)(r2, "YYYY/MM/DD"))
            return false;
          for (var i2 = e2.split("").map(function(e3) {
            return parseInt(e3, 10);
          }), n2 = 0, a2 = 1, o2 = 0; o2 < 10; o2++)
            n2 += i2[o2] * a2, 10 === (a2 += 1) && (a2 = 1);
          if (n2 % 11 == 10) {
            a2 = 3;
            for (var s2 = n2 = 0; s2 < 10; s2++)
              n2 += i2[s2] * a2, 10 === (a2 += 1) && (a2 = 1);
            if (n2 % 11 == 10)
              return 0 === i2[10];
          }
          return n2 % 11 === i2[10];
        }, "fi-FI": function(e2) {
          var t2 = e2.slice(4, 6);
          switch (e2.slice(6, 7)) {
            case "+":
              t2 = "18".concat(t2);
              break;
            case "-":
              t2 = "19".concat(t2);
              break;
            default:
              t2 = "20".concat(t2);
          }
          var r2 = "".concat(t2, "/").concat(e2.slice(2, 4), "/").concat(e2.slice(0, 2));
          if (!(0, v.default)(r2, "YYYY/MM/DD"))
            return false;
          var i2 = parseInt(e2.slice(0, 6) + e2.slice(7, 10), 10) % 31;
          return i2 < 10 ? i2 === parseInt(e2.slice(10), 10) : ["A", "B", "C", "D", "E", "F", "H", "J", "K", "L", "M", "N", "P", "R", "S", "T", "U", "V", "W", "X", "Y"][i2 -= 10] === e2.slice(10);
        }, "fr-BE": function(e2) {
          if ("00" !== e2.slice(2, 4) || "00" !== e2.slice(4, 6)) {
            var t2 = "".concat(e2.slice(0, 2), "/").concat(e2.slice(2, 4), "/").concat(e2.slice(4, 6));
            if (!(0, v.default)(t2, "YY/MM/DD"))
              return false;
          }
          var r2 = 97 - parseInt(e2.slice(0, 9), 10) % 97, i2 = parseInt(e2.slice(9, 11), 10);
          return r2 === i2 || (r2 = 97 - parseInt("2".concat(e2.slice(0, 9)), 10) % 97) === i2;
        }, "fr-FR": function(e2) {
          return e2 = e2.replace(/\s/g, ""), parseInt(e2.slice(0, 10), 10) % 511 === parseInt(e2.slice(10, 13), 10);
        }, "fr-LU": function(e2) {
          var t2 = "".concat(e2.slice(0, 4), "/").concat(e2.slice(4, 6), "/").concat(e2.slice(6, 8));
          return !!(0, v.default)(t2, "YYYY/MM/DD") && !!l.luhnCheck(e2.slice(0, 12)) && l.verhoeffCheck("".concat(e2.slice(0, 11)).concat(e2[12]));
        }, "hr-HR": function(e2) {
          return l.iso7064Check(e2);
        }, "hu-HU": function(e2) {
          for (var t2 = e2.split("").map(function(e3) {
            return parseInt(e3, 10);
          }), r2 = 8, i2 = 1; i2 < 9; i2++)
            r2 += t2[i2] * (i2 + 1);
          return r2 % 11 === t2[9];
        }, "it-IT": function(e2) {
          var t2 = e2.toUpperCase().split("");
          if (!_(t2.slice(0, 3)))
            return false;
          if (!_(t2.slice(3, 6)))
            return false;
          for (var r2 = { L: "0", M: "1", N: "2", P: "3", Q: "4", R: "5", S: "6", T: "7", U: "8", V: "9" }, i2 = 0, n2 = [6, 7, 9, 10, 12, 13, 14]; i2 < n2.length; i2++) {
            var a2 = n2[i2];
            t2[a2] in r2 && t2.splice(a2, 1, r2[t2[a2]]);
          }
          var o2 = { A: "01", B: "02", C: "03", D: "04", E: "05", H: "06", L: "07", M: "08", P: "09", R: "10", S: "11", T: "12" }[t2[8]], s2 = parseInt(t2[9] + t2[10], 10);
          40 < s2 && (s2 -= 40), s2 < 10 && (s2 = "0".concat(s2));
          var l2 = "".concat(t2[6]).concat(t2[7], "/").concat(o2, "/").concat(s2);
          if (!(0, v.default)(l2, "YY/MM/DD"))
            return false;
          for (var u2 = 0, d2 = 1; d2 < t2.length - 1; d2 += 2) {
            var f2 = parseInt(t2[d2], 10);
            isNaN(f2) && (f2 = t2[d2].charCodeAt(0) - 65), u2 += f2;
          }
          for (var c2 = { A: 1, B: 0, C: 5, D: 7, E: 9, F: 13, G: 15, H: 17, I: 19, J: 21, K: 2, L: 4, M: 18, N: 20, O: 11, P: 3, Q: 6, R: 8, S: 12, T: 14, U: 16, V: 10, W: 22, X: 25, Y: 24, Z: 23, 0: 1, 1: 0 }, p2 = 0; p2 < t2.length - 1; p2 += 2) {
            var h2 = 0;
            if (t2[p2] in c2)
              h2 = c2[t2[p2]];
            else {
              var m = parseInt(t2[p2], 10);
              h2 = 2 * m + 1, 4 < m && (h2 += 2);
            }
            u2 += h2;
          }
          return String.fromCharCode(65 + u2 % 26) === t2[15];
        }, "lv-LV": function(e2) {
          var t2 = (e2 = e2.replace(/\W/, "")).slice(0, 2);
          if ("32" === t2)
            return true;
          if ("00" !== e2.slice(2, 4)) {
            var r2 = e2.slice(4, 6);
            switch (e2[6]) {
              case "0":
                r2 = "18".concat(r2);
                break;
              case "1":
                r2 = "19".concat(r2);
                break;
              default:
                r2 = "20".concat(r2);
            }
            var i2 = "".concat(r2, "/").concat(e2.slice(2, 4), "/").concat(t2);
            if (!(0, v.default)(i2, "YYYY/MM/DD"))
              return false;
          }
          for (var n2 = 1101, a2 = [1, 6, 3, 7, 9, 10, 5, 8, 4, 2], o2 = 0; o2 < e2.length - 1; o2++)
            n2 -= parseInt(e2[o2], 10) * a2[o2];
          return parseInt(e2[10], 10) === n2 % 11;
        }, "mt-MT": function(e2) {
          if (9 !== e2.length) {
            for (var t2 = e2.toUpperCase().split(""); t2.length < 8; )
              t2.unshift(0);
            switch (e2[7]) {
              case "A":
              case "P":
                if (0 === parseInt(t2[6], 10))
                  return false;
                break;
              default:
                var r2 = parseInt(t2.join("").slice(0, 5), 10);
                if (32e3 < r2)
                  return false;
                if (r2 === parseInt(t2.join("").slice(5, 7), 10))
                  return false;
            }
          }
          return true;
        }, "nl-NL": function(e2) {
          return l.reverseMultiplyAndSum(e2.split("").slice(0, 8).map(function(e3) {
            return parseInt(e3, 10);
          }), 9) % 11 === parseInt(e2[8], 10);
        }, "pl-PL": function(e2) {
          if (10 === e2.length) {
            for (var t2 = [6, 5, 7, 2, 3, 4, 5, 6, 7], r2 = 0, i2 = 0; i2 < t2.length; i2++)
              r2 += parseInt(e2[i2], 10) * t2[i2];
            return 10 != (r2 %= 11) && r2 === parseInt(e2[9], 10);
          }
          var n2 = e2.slice(0, 2), a2 = parseInt(e2.slice(2, 4), 10);
          80 < a2 ? (n2 = "18".concat(n2), a2 -= 80) : 60 < a2 ? (n2 = "22".concat(n2), a2 -= 60) : 40 < a2 ? (n2 = "21".concat(n2), a2 -= 40) : 20 < a2 ? (n2 = "20".concat(n2), a2 -= 20) : n2 = "19".concat(n2), a2 < 10 && (a2 = "0".concat(a2));
          var o2 = "".concat(n2, "/").concat(a2, "/").concat(e2.slice(4, 6));
          if (!(0, v.default)(o2, "YYYY/MM/DD"))
            return false;
          for (var s2 = 0, l2 = 1, u2 = 0; u2 < e2.length - 1; u2++)
            s2 += parseInt(e2[u2], 10) * l2 % 10, 10 < (l2 += 2) ? l2 = 1 : 5 === l2 && (l2 += 2);
          return (s2 = 10 - s2 % 10) === parseInt(e2[10], 10);
        }, "pt-BR": function(e2) {
          if (11 === e2.length) {
            var t2, r2;
            if (t2 = 0, "11111111111" === e2 || "22222222222" === e2 || "33333333333" === e2 || "44444444444" === e2 || "55555555555" === e2 || "66666666666" === e2 || "77777777777" === e2 || "88888888888" === e2 || "99999999999" === e2 || "00000000000" === e2)
              return false;
            for (var i2 = 1; i2 <= 9; i2++)
              t2 += parseInt(e2.substring(i2 - 1, i2), 10) * (11 - i2);
            if (10 == (r2 = 10 * t2 % 11) && (r2 = 0), r2 !== parseInt(e2.substring(9, 10), 10))
              return false;
            t2 = 0;
            for (var n2 = 1; n2 <= 10; n2++)
              t2 += parseInt(e2.substring(n2 - 1, n2), 10) * (12 - n2);
            return 10 == (r2 = 10 * t2 % 11) && (r2 = 0), r2 === parseInt(e2.substring(10, 11), 10);
          }
          if ("00000000000000" === e2 || "11111111111111" === e2 || "22222222222222" === e2 || "33333333333333" === e2 || "44444444444444" === e2 || "55555555555555" === e2 || "66666666666666" === e2 || "77777777777777" === e2 || "88888888888888" === e2 || "99999999999999" === e2)
            return false;
          for (var a2 = e2.length - 2, o2 = e2.substring(0, a2), s2 = e2.substring(a2), l2 = 0, u2 = a2 - 7, d2 = a2; 1 <= d2; d2--)
            l2 += o2.charAt(a2 - d2) * u2, (u2 -= 1) < 2 && (u2 = 9);
          var f2 = l2 % 11 < 2 ? 0 : 11 - l2 % 11;
          if (f2 !== parseInt(s2.charAt(0), 10))
            return false;
          a2 += 1, o2 = e2.substring(0, a2), l2 = 0, u2 = a2 - 7;
          for (var c2 = a2; 1 <= c2; c2--)
            l2 += o2.charAt(a2 - c2) * u2, (u2 -= 1) < 2 && (u2 = 9);
          return (f2 = l2 % 11 < 2 ? 0 : 11 - l2 % 11) === parseInt(s2.charAt(1), 10);
        }, "pt-PT": function(e2) {
          var t2 = 11 - l.reverseMultiplyAndSum(e2.split("").slice(0, 8).map(function(e3) {
            return parseInt(e3, 10);
          }), 9) % 11;
          return 9 < t2 ? 0 === parseInt(e2[8], 10) : t2 === parseInt(e2[8], 10);
        }, "ro-RO": function(e2) {
          if ("9000" === e2.slice(0, 4))
            return true;
          var t2 = e2.slice(1, 3);
          switch (e2[0]) {
            case "1":
            case "2":
              t2 = "19".concat(t2);
              break;
            case "3":
            case "4":
              t2 = "18".concat(t2);
              break;
            case "5":
            case "6":
              t2 = "20".concat(t2);
          }
          var r2 = "".concat(t2, "/").concat(e2.slice(3, 5), "/").concat(e2.slice(5, 7));
          if (8 === r2.length) {
            if (!(0, v.default)(r2, "YY/MM/DD"))
              return false;
          } else if (!(0, v.default)(r2, "YYYY/MM/DD"))
            return false;
          for (var i2 = e2.split("").map(function(e3) {
            return parseInt(e3, 10);
          }), n2 = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9], a2 = 0, o2 = 0; o2 < n2.length; o2++)
            a2 += i2[o2] * n2[o2];
          return a2 % 11 == 10 ? 1 === i2[12] : i2[12] === a2 % 11;
        }, "sk-SK": function(e2) {
          if (9 === e2.length) {
            if ("000" === (e2 = e2.replace(/\W/, "")).slice(6))
              return false;
            var t2 = parseInt(e2.slice(0, 2), 10);
            if (53 < t2)
              return false;
            t2 = t2 < 10 ? "190".concat(t2) : "19".concat(t2);
            var r2 = parseInt(e2.slice(2, 4), 10);
            50 < r2 && (r2 -= 50), r2 < 10 && (r2 = "0".concat(r2));
            var i2 = "".concat(t2, "/").concat(r2, "/").concat(e2.slice(4, 6));
            if (!(0, v.default)(i2, "YYYY/MM/DD"))
              return false;
          }
          return true;
        }, "sl-SI": function(e2) {
          var t2 = 11 - l.reverseMultiplyAndSum(e2.split("").slice(0, 7).map(function(e3) {
            return parseInt(e3, 10);
          }), 8) % 11;
          return 10 === t2 ? 0 === parseInt(e2[7], 10) : t2 === parseInt(e2[7], 10);
        }, "sv-SE": function(e2) {
          var t2 = e2.slice(0);
          11 < e2.length && (t2 = t2.slice(2));
          var r2 = "", i2 = t2.slice(2, 4), n2 = parseInt(t2.slice(4, 6), 10);
          if (11 < e2.length)
            r2 = e2.slice(0, 4);
          else if (r2 = e2.slice(0, 2), 11 === e2.length && n2 < 60) {
            var a2 = new Date().getFullYear().toString(), o2 = parseInt(a2.slice(0, 2), 10);
            if (a2 = parseInt(a2, 10), "-" === e2[6])
              r2 = parseInt("".concat(o2).concat(r2), 10) > a2 ? "".concat(o2 - 1).concat(r2) : "".concat(o2).concat(r2);
            else if (r2 = "".concat(o2 - 1).concat(r2), a2 - parseInt(r2, 10) < 100)
              return false;
          }
          60 < n2 && (n2 -= 60), n2 < 10 && (n2 = "0".concat(n2));
          var s2 = "".concat(r2, "/").concat(i2, "/").concat(n2);
          if (8 === s2.length) {
            if (!(0, v.default)(s2, "YY/MM/DD"))
              return false;
          } else if (!(0, v.default)(s2, "YYYY/MM/DD"))
            return false;
          return l.luhnCheck(e2.replace(/\W/, ""));
        } };
        c["lb-LU"] = c["fr-LU"], c["lt-LT"] = c["et-EE"], c["nl-BE"] = c["fr-BE"];
        var p = /[-\\\/!@#$%\^&\*\(\)\+\=\[\]]+/g, h = { "de-AT": p, "de-DE": /[\/\\]/g, "fr-BE": p };
        h["nl-BE"] = h["fr-BE"], t.exports = r.default, t.exports.default = r.default;
      }, { "./isDate": 25, "./util/algorithms": 98, "./util/assertString": 99 }], 81: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          if ((0, _.default)(e2), !e2 || /[\s<>]/.test(e2))
            return false;
          if (0 === e2.indexOf("mailto:"))
            return false;
          if ((t2 = (0, E.default)(t2, S)).validate_length && 2083 <= e2.length)
            return false;
          if (!t2.allow_fragments && e2.includes("#"))
            return false;
          if (!t2.allow_query_components && (e2.includes("?") || e2.includes("&")))
            return false;
          var r2, i2, n, a, o, s, l, u;
          if (1 < (l = (e2 = (l = (e2 = (l = e2.split("#")).shift()).split("?")).shift()).split("://")).length) {
            if (r2 = l.shift().toLowerCase(), t2.require_valid_protocol && -1 === t2.protocols.indexOf(r2))
              return false;
          } else {
            if (t2.require_protocol)
              return false;
            if ("//" === e2.substr(0, 2)) {
              if (!t2.allow_protocol_relative_urls)
                return false;
              l[0] = e2.substr(2);
            }
          }
          if ("" === (e2 = l.join("://")))
            return false;
          if ("" === (e2 = (l = e2.split("/")).shift()) && !t2.require_host)
            return true;
          if (1 < (l = e2.split("@")).length) {
            if (t2.disallow_auth)
              return false;
            if ("" === l[0])
              return false;
            if (0 <= (i2 = l.shift()).indexOf(":") && 2 < i2.split(":").length)
              return false;
            var d = i2.split(":"), f = (m = 2, function(e3) {
              if (Array.isArray(e3))
                return e3;
            }(h = d) || function(e3, t3) {
              if ("undefined" != typeof Symbol && Symbol.iterator in Object(e3)) {
                var r3 = [], i3 = true, n2 = false, a2 = void 0;
                try {
                  for (var o2, s2 = e3[Symbol.iterator](); !(i3 = (o2 = s2.next()).done) && (r3.push(o2.value), !t3 || r3.length !== t3); i3 = true)
                    ;
                } catch (e4) {
                  n2 = true, a2 = e4;
                } finally {
                  try {
                    i3 || null == s2.return || s2.return();
                  } finally {
                    if (n2)
                      throw a2;
                  }
                }
                return r3;
              }
            }(h, m) || function(e3, t3) {
              if (e3) {
                if ("string" == typeof e3)
                  return A(e3, t3);
                var r3 = Object.prototype.toString.call(e3).slice(8, -1);
                return "Object" === r3 && e3.constructor && (r3 = e3.constructor.name), "Map" === r3 || "Set" === r3 ? Array.from(e3) : "Arguments" === r3 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r3) ? A(e3, t3) : void 0;
              }
            }(h, m) || function() {
              throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }()), c = f[0], p = f[1];
            if ("" === c && "" === p)
              return false;
          }
          var h, m;
          a = l.join("@"), u = s = null;
          var v = a.match(b);
          v ? (n = "", u = v[1], s = v[2] || null) : (l = a.split(":"), n = l.shift(), l.length && (s = l.join(":")));
          if (null !== s && 0 < s.length) {
            if (o = parseInt(s, 10), !/^[0-9]+$/.test(s) || o <= 0 || 65535 < o)
              return false;
          } else if (t2.require_port)
            return false;
          if (t2.host_whitelist)
            return O(n, t2.host_whitelist);
          if (!((0, y.default)(n) || (0, g.default)(n, t2) || u && (0, y.default)(u, 6)))
            return false;
          if (n = n || u, t2.host_blacklist && O(n, t2.host_blacklist))
            return false;
          return true;
        };
        var _ = i(e("./util/assertString")), g = i(e("./isFQDN")), y = i(e("./isIP")), E = i(e("./util/merge"));
        function i(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        function A(e2, t2) {
          (null == t2 || t2 > e2.length) && (t2 = e2.length);
          for (var r2 = 0, i2 = new Array(t2); r2 < t2; r2++)
            i2[r2] = e2[r2];
          return i2;
        }
        var S = { protocols: ["http", "https", "ftp"], require_tld: true, require_protocol: false, require_host: true, require_port: false, require_valid_protocol: true, allow_underscores: false, allow_trailing_dot: false, allow_protocol_relative_urls: false, allow_fragments: true, allow_query_components: true, validate_length: true }, b = /^\[([^\]]+)\](?::([0-9]+))?$/;
        function O(e2, t2) {
          for (var r2 = 0; r2 < t2.length; r2++) {
            var i2 = t2[r2];
            if (e2 === i2 || (n = i2, "[object RegExp]" === Object.prototype.toString.call(n) && i2.test(e2)))
              return true;
          }
          var n;
          return false;
        }
        t.exports = r.default, t.exports.default = r.default;
      }, { "./isFQDN": 32, "./isIP": 42, "./util/assertString": 99, "./util/merge": 101 }], 82: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          (0, n.default)(e2);
          var r2 = a[[void 0, null].includes(t2) ? "all" : t2];
          return !!r2 && r2.test(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = { 1: /^[0-9A-F]{8}-[0-9A-F]{4}-1[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i, 2: /^[0-9A-F]{8}-[0-9A-F]{4}-2[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i, 3: /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i, 4: /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i, 5: /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i, all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 83: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), e2 === e2.toUpperCase();
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 84: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          if ((0, n.default)(e2), (0, n.default)(t2), t2 in a)
            return a[t2].test(e2);
          throw new Error("Invalid country code: '".concat(t2, "'"));
        }, r.vatMatchers = void 0;
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        var a = { GB: /^GB((\d{3} \d{4} ([0-8][0-9]|9[0-6]))|(\d{9} \d{3})|(((GD[0-4])|(HA[5-9]))[0-9]{2}))$/, IT: /^(IT)?[0-9]{11}$/, NL: /^(NL)?[0-9]{9}B[0-9]{2}$/ };
        r.vatMatchers = a;
      }, { "./util/assertString": 99 }], 85: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), a.fullWidth.test(e2) && o.halfWidth.test(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i }, a = e("./isFullWidth"), o = e("./isHalfWidth");
        t.exports = r.default, t.exports.default = r.default;
      }, { "./isFullWidth": 34, "./isHalfWidth": 36, "./util/assertString": 99 }], 86: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          (0, n.default)(e2);
          for (var r2 = e2.length - 1; 0 <= r2; r2--)
            if (-1 === t2.indexOf(e2[r2]))
              return false;
          return true;
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 87: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          (0, n.default)(e2);
          var r2 = t2 ? new RegExp("^[".concat(t2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "]+"), "g") : /^\s+/g;
          return e2.replace(r2, "");
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 88: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2, r2) {
          (0, n.default)(e2), "[object RegExp]" !== Object.prototype.toString.call(t2) && (t2 = new RegExp(t2, r2));
          return t2.test(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 89: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          t2 = (0, o.default)(t2, s);
          var r2 = e2.split("@"), i2 = r2.pop(), n = [r2.join("@"), i2];
          if (n[1] = n[1].toLowerCase(), "gmail.com" === n[1] || "googlemail.com" === n[1]) {
            if (t2.gmail_remove_subaddress && (n[0] = n[0].split("+")[0]), t2.gmail_remove_dots && (n[0] = n[0].replace(/\.+/g, c)), !n[0].length)
              return false;
            (t2.all_lowercase || t2.gmail_lowercase) && (n[0] = n[0].toLowerCase()), n[1] = t2.gmail_convert_googlemaildotcom ? "gmail.com" : n[1];
          } else if (0 <= l.indexOf(n[1])) {
            if (t2.icloud_remove_subaddress && (n[0] = n[0].split("+")[0]), !n[0].length)
              return false;
            (t2.all_lowercase || t2.icloud_lowercase) && (n[0] = n[0].toLowerCase());
          } else if (0 <= u.indexOf(n[1])) {
            if (t2.outlookdotcom_remove_subaddress && (n[0] = n[0].split("+")[0]), !n[0].length)
              return false;
            (t2.all_lowercase || t2.outlookdotcom_lowercase) && (n[0] = n[0].toLowerCase());
          } else if (0 <= d.indexOf(n[1])) {
            if (t2.yahoo_remove_subaddress) {
              var a = n[0].split("-");
              n[0] = 1 < a.length ? a.slice(0, -1).join("-") : a[0];
            }
            if (!n[0].length)
              return false;
            (t2.all_lowercase || t2.yahoo_lowercase) && (n[0] = n[0].toLowerCase());
          } else
            0 <= f.indexOf(n[1]) ? ((t2.all_lowercase || t2.yandex_lowercase) && (n[0] = n[0].toLowerCase()), n[1] = "yandex.ru") : t2.all_lowercase && (n[0] = n[0].toLowerCase());
          return n.join("@");
        };
        var i, o = (i = e("./util/merge")) && i.__esModule ? i : { default: i };
        var s = { all_lowercase: true, gmail_lowercase: true, gmail_remove_dots: true, gmail_remove_subaddress: true, gmail_convert_googlemaildotcom: true, outlookdotcom_lowercase: true, outlookdotcom_remove_subaddress: true, yahoo_lowercase: true, yahoo_remove_subaddress: true, yandex_lowercase: true, icloud_lowercase: true, icloud_remove_subaddress: true }, l = ["icloud.com", "me.com"], u = ["hotmail.at", "hotmail.be", "hotmail.ca", "hotmail.cl", "hotmail.co.il", "hotmail.co.nz", "hotmail.co.th", "hotmail.co.uk", "hotmail.com", "hotmail.com.ar", "hotmail.com.au", "hotmail.com.br", "hotmail.com.gr", "hotmail.com.mx", "hotmail.com.pe", "hotmail.com.tr", "hotmail.com.vn", "hotmail.cz", "hotmail.de", "hotmail.dk", "hotmail.es", "hotmail.fr", "hotmail.hu", "hotmail.id", "hotmail.ie", "hotmail.in", "hotmail.it", "hotmail.jp", "hotmail.kr", "hotmail.lv", "hotmail.my", "hotmail.ph", "hotmail.pt", "hotmail.sa", "hotmail.sg", "hotmail.sk", "live.be", "live.co.uk", "live.com", "live.com.ar", "live.com.mx", "live.de", "live.es", "live.eu", "live.fr", "live.it", "live.nl", "msn.com", "outlook.at", "outlook.be", "outlook.cl", "outlook.co.il", "outlook.co.nz", "outlook.co.th", "outlook.com", "outlook.com.ar", "outlook.com.au", "outlook.com.br", "outlook.com.gr", "outlook.com.pe", "outlook.com.tr", "outlook.com.vn", "outlook.cz", "outlook.de", "outlook.dk", "outlook.es", "outlook.fr", "outlook.hu", "outlook.id", "outlook.ie", "outlook.in", "outlook.it", "outlook.jp", "outlook.kr", "outlook.lv", "outlook.my", "outlook.ph", "outlook.pt", "outlook.sa", "outlook.sg", "outlook.sk", "passport.com"], d = ["rocketmail.com", "yahoo.ca", "yahoo.co.uk", "yahoo.com", "yahoo.de", "yahoo.fr", "yahoo.in", "yahoo.it", "ymail.com"], f = ["yandex.ru", "yandex.ua", "yandex.kz", "yandex.com", "yandex.by", "ya.ru"];
        function c(e2) {
          return 1 < e2.length ? e2 : "";
        }
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/merge": 101 }], 90: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          if ((0, n.default)(e2), t2) {
            var r2 = new RegExp("[".concat(t2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "]+$"), "g");
            return e2.replace(r2, "");
          }
          var i2 = e2.length - 1;
          for (; /\s/.test(e2.charAt(i2)); )
            i2 -= 1;
          return e2.slice(0, i2 + 1);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 91: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          (0, i.default)(e2);
          var r2 = t2 ? "\\x00-\\x09\\x0B\\x0C\\x0E-\\x1F\\x7F" : "\\x00-\\x1F\\x7F";
          return (0, n.default)(e2, r2);
        };
        var i = a(e("./util/assertString")), n = a(e("./blacklist"));
        function a(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        t.exports = r.default, t.exports.default = r.default;
      }, { "./blacklist": 6, "./util/assertString": 99 }], 92: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          if ((0, n.default)(e2), t2)
            return "1" === e2 || /^true$/i.test(e2);
          return "0" !== e2 && !/^false$/i.test(e2) && "" !== e2;
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 93: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), e2 = Date.parse(e2), isNaN(e2) ? null : new Date(e2);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 94: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2) ? parseFloat(e2) : NaN;
        };
        var i, n = (i = e("./isFloat")) && i.__esModule ? i : { default: i };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./isFloat": 33 }], 95: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          return (0, n.default)(e2), parseInt(e2, t2 || 10);
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 96: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          return (0, i.default)((0, n.default)(e2, t2), t2);
        };
        var i = a(e("./rtrim")), n = a(e("./ltrim"));
        function a(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        t.exports = r.default, t.exports.default = r.default;
      }, { "./ltrim": 87, "./rtrim": 90 }], 97: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          return (0, n.default)(e2), e2.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x2F;/g, "/").replace(/&#x5C;/g, "\\").replace(/&#96;/g, "`").replace(/&amp;/g, "&");
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 98: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.iso7064Check = function(e2) {
          for (var t2 = 10, r2 = 0; r2 < e2.length - 1; r2++)
            t2 = (parseInt(e2[r2], 10) + t2) % 10 == 0 ? 9 : (parseInt(e2[r2], 10) + t2) % 10 * 2 % 11;
          return (t2 = 1 === t2 ? 0 : 11 - t2) === parseInt(e2[10], 10);
        }, r.luhnCheck = function(e2) {
          for (var t2 = 0, r2 = false, i = e2.length - 1; 0 <= i; i--) {
            if (r2) {
              var n = 2 * parseInt(e2[i], 10);
              t2 += 9 < n ? n.toString().split("").map(function(e3) {
                return parseInt(e3, 10);
              }).reduce(function(e3, t3) {
                return e3 + t3;
              }, 0) : n;
            } else
              t2 += parseInt(e2[i], 10);
            r2 = !r2;
          }
          return t2 % 10 == 0;
        }, r.reverseMultiplyAndSum = function(e2, t2) {
          for (var r2 = 0, i = 0; i < e2.length; i++)
            r2 += e2[i] * (t2 - i);
          return r2;
        }, r.verhoeffCheck = function(e2) {
          for (var t2 = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 0, 6, 7, 8, 9, 5], [2, 3, 4, 0, 1, 7, 8, 9, 5, 6], [3, 4, 0, 1, 2, 8, 9, 5, 6, 7], [4, 0, 1, 2, 3, 9, 5, 6, 7, 8], [5, 9, 8, 7, 6, 0, 4, 3, 2, 1], [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], [7, 6, 5, 9, 8, 2, 1, 0, 4, 3], [8, 7, 6, 5, 9, 3, 2, 1, 0, 4], [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]], r2 = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 7, 6, 2, 8, 3, 0, 9, 4], [5, 8, 0, 3, 7, 9, 6, 1, 4, 2], [8, 9, 1, 6, 0, 4, 3, 5, 2, 7], [9, 4, 5, 3, 1, 2, 6, 8, 7, 0], [4, 2, 8, 6, 5, 7, 3, 9, 0, 1], [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]], i = e2.split("").reverse().join(""), n = 0, a = 0; a < i.length; a++)
            n = t2[n][r2[a % 8][parseInt(i[a], 10)]];
          return 0 === n;
        };
      }, {}], 99: [function(e, t, r) {
        "use strict";
        function i(e2) {
          return (i = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e3) {
            return typeof e3;
          } : function(e3) {
            return e3 && "function" == typeof Symbol && e3.constructor === Symbol && e3 !== Symbol.prototype ? "symbol" : typeof e3;
          })(e2);
        }
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          if (!("string" == typeof e2 || e2 instanceof String)) {
            var t2 = i(e2);
            throw null === e2 ? t2 = "null" : "object" === t2 && (t2 = e2.constructor.name), new TypeError("Expected a string but received a ".concat(t2));
          }
        }, t.exports = r.default, t.exports.default = r.default;
      }, {}], 100: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = void 0;
        var i = function(e2, t2) {
          return e2.some(function(e3) {
            return t2 === e3;
          });
        };
        r.default = i, t.exports = r.default, t.exports.default = r.default;
      }, {}], 101: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function() {
          var e2 = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {}, t2 = 1 < arguments.length ? arguments[1] : void 0;
          for (var r2 in t2)
            void 0 === e2[r2] && (e2[r2] = t2[r2]);
          return e2;
        }, t.exports = r.default, t.exports.default = r.default;
      }, {}], 102: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          var r2 = e2.join("");
          return new RegExp(r2, t2);
        }, t.exports = r.default, t.exports.default = r.default;
      }, {}], 103: [function(e, t, r) {
        "use strict";
        function i(e2) {
          return (i = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e3) {
            return typeof e3;
          } : function(e3) {
            return e3 && "function" == typeof Symbol && e3.constructor === Symbol && e3 !== Symbol.prototype ? "symbol" : typeof e3;
          })(e2);
        }
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2) {
          "object" === i(e2) && null !== e2 ? e2 = "function" == typeof e2.toString ? e2.toString() : "[object Object]" : (null == e2 || isNaN(e2) && !e2.length) && (e2 = "");
          return String(e2);
        }, t.exports = r.default, t.exports.default = r.default;
      }, {}], 104: [function(e, t, r) {
        "use strict";
        Object.defineProperty(r, "__esModule", { value: true }), r.default = function(e2, t2) {
          return (0, n.default)(e2), e2.replace(new RegExp("[^".concat(t2, "]+"), "g"), "");
        };
        var i, n = (i = e("./util/assertString")) && i.__esModule ? i : { default: i };
        t.exports = r.default, t.exports.default = r.default;
      }, { "./util/assertString": 99 }], 105: [function(e, t, r) {
        "use strict";
        t.exports = { INVALID_TYPE: "Expected type {0} but found type {1}", INVALID_FORMAT: "Object didn't pass validation for format {0}: {1}", ENUM_MISMATCH: "No enum match for: {0}", ENUM_CASE_MISMATCH: "Enum does not match case for: {0}", ANY_OF_MISSING: "Data does not match any schemas from 'anyOf'", ONE_OF_MISSING: "Data does not match any schemas from 'oneOf'", ONE_OF_MULTIPLE: "Data is valid against more than one schema from 'oneOf'", NOT_PASSED: "Data matches schema from 'not'", ARRAY_LENGTH_SHORT: "Array is too short ({0}), minimum {1}", ARRAY_LENGTH_LONG: "Array is too long ({0}), maximum {1}", ARRAY_UNIQUE: "Array items are not unique (indexes {0} and {1})", ARRAY_ADDITIONAL_ITEMS: "Additional items not allowed", MULTIPLE_OF: "Value {0} is not a multiple of {1}", MINIMUM: "Value {0} is less than minimum {1}", MINIMUM_EXCLUSIVE: "Value {0} is equal or less than exclusive minimum {1}", MAXIMUM: "Value {0} is greater than maximum {1}", MAXIMUM_EXCLUSIVE: "Value {0} is equal or greater than exclusive maximum {1}", OBJECT_PROPERTIES_MINIMUM: "Too few properties defined ({0}), minimum {1}", OBJECT_PROPERTIES_MAXIMUM: "Too many properties defined ({0}), maximum {1}", OBJECT_MISSING_REQUIRED_PROPERTY: "Missing required property: {0}", OBJECT_ADDITIONAL_PROPERTIES: "Additional properties not allowed: {0}", OBJECT_DEPENDENCY_KEY: "Dependency failed - key must exist: {0} (due to key: {1})", MIN_LENGTH: "String is too short ({0} chars), minimum {1}", MAX_LENGTH: "String is too long ({0} chars), maximum {1}", PATTERN: "String does not match pattern {0}: {1}", KEYWORD_TYPE_EXPECTED: "Keyword '{0}' is expected to be of type '{1}'", KEYWORD_UNDEFINED_STRICT: "Keyword '{0}' must be defined in strict mode", KEYWORD_UNEXPECTED: "Keyword '{0}' is not expected to appear in the schema", KEYWORD_MUST_BE: "Keyword '{0}' must be {1}", KEYWORD_DEPENDENCY: "Keyword '{0}' requires keyword '{1}'", KEYWORD_PATTERN: "Keyword '{0}' is not a valid RegExp pattern: {1}", KEYWORD_VALUE_TYPE: "Each element of keyword '{0}' array must be a '{1}'", UNKNOWN_FORMAT: "There is no validation function for format '{0}'", CUSTOM_MODE_FORCE_PROPERTIES: "{0} must define at least one property if present", REF_UNRESOLVED: "Reference has not been resolved during compilation: {0}", UNRESOLVABLE_REFERENCE: "Reference could not be resolved: {0}", SCHEMA_NOT_REACHABLE: "Validator was not able to read schema with uri: {0}", SCHEMA_TYPE_EXPECTED: "Schema is expected to be of type 'object'", SCHEMA_NOT_AN_OBJECT: "Schema is not an object: {0}", ASYNC_TIMEOUT: "{0} asynchronous task(s) have timed out after {1} ms", PARENT_SCHEMA_VALIDATION_FAILED: "Schema failed to validate against its parent schema, see inner errors for details.", REMOTE_NOT_VALID: "Remote reference didn't compile successfully: {0}" };
      }, {}], 106: [function(e, t, r) {
        var i = e("validator"), n = { date: function(e2) {
          if ("string" != typeof e2)
            return true;
          var t2 = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(e2);
          return null !== t2 && !(t2[2] < "01" || "12" < t2[2] || t2[3] < "01" || "31" < t2[3]);
        }, "date-time": function(e2) {
          if ("string" != typeof e2)
            return true;
          var t2 = e2.toLowerCase().split("t");
          if (!n.date(t2[0]))
            return false;
          var r2 = /^([0-9]{2}):([0-9]{2}):([0-9]{2})(.[0-9]+)?(z|([+-][0-9]{2}:[0-9]{2}))$/.exec(t2[1]);
          return null !== r2 && !("23" < r2[1] || "59" < r2[2] || "59" < r2[3]);
        }, email: function(e2) {
          return "string" != typeof e2 || i.isEmail(e2, { require_tld: true });
        }, hostname: function(e2) {
          if ("string" != typeof e2)
            return true;
          var t2 = /^[a-zA-Z](([-0-9a-zA-Z]+)?[0-9a-zA-Z])?(\.[a-zA-Z](([-0-9a-zA-Z]+)?[0-9a-zA-Z])?)*$/.test(e2);
          if (t2) {
            if (255 < e2.length)
              return false;
            for (var r2 = e2.split("."), i2 = 0; i2 < r2.length; i2++)
              if (63 < r2[i2].length)
                return false;
          }
          return t2;
        }, "host-name": function(e2) {
          return n.hostname.call(this, e2);
        }, ipv4: function(e2) {
          return "string" != typeof e2 || i.isIP(e2, 4);
        }, ipv6: function(e2) {
          return "string" != typeof e2 || i.isIP(e2, 6);
        }, regex: function(e2) {
          try {
            return RegExp(e2), true;
          } catch (e3) {
            return false;
          }
        }, uri: function(e2) {
          return this.options.strictUris ? n["strict-uri"].apply(this, arguments) : "string" != typeof e2 || RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?").test(e2);
        }, "strict-uri": function(e2) {
          return "string" != typeof e2 || i.isURL(e2);
        } };
        t.exports = n;
      }, { validator: 4 }], 107: [function(e, t, p) {
        "use strict";
        var o = e("./FormatValidators"), s = e("./Report"), h = e("./Utils"), m = function(t2, e2) {
          return t2 && Array.isArray(t2.includeErrors) && 0 < t2.includeErrors.length && !e2.some(function(e3) {
            return t2.includeErrors.includes(e3);
          });
        }, u = { multipleOf: function(e2, t2, r) {
          if (!m(this.validateOptions, ["MULTIPLE_OF"]) && "number" == typeof r) {
            var i = String(t2.multipleOf), n = Math.pow(10, i.length - i.indexOf(".") - 1);
            "integer" !== h.whatIs(r * n / (t2.multipleOf * n)) && e2.addError("MULTIPLE_OF", [r, t2.multipleOf], null, t2);
          }
        }, maximum: function(e2, t2, r) {
          m(this.validateOptions, ["MAXIMUM", "MAXIMUM_EXCLUSIVE"]) || "number" == typeof r && (true !== t2.exclusiveMaximum ? r > t2.maximum && e2.addError("MAXIMUM", [r, t2.maximum], null, t2) : r >= t2.maximum && e2.addError("MAXIMUM_EXCLUSIVE", [r, t2.maximum], null, t2));
        }, exclusiveMaximum: function() {
        }, minimum: function(e2, t2, r) {
          m(this.validateOptions, ["MINIMUM", "MINIMUM_EXCLUSIVE"]) || "number" == typeof r && (true !== t2.exclusiveMinimum ? r < t2.minimum && e2.addError("MINIMUM", [r, t2.minimum], null, t2) : r <= t2.minimum && e2.addError("MINIMUM_EXCLUSIVE", [r, t2.minimum], null, t2));
        }, exclusiveMinimum: function() {
        }, maxLength: function(e2, t2, r) {
          m(this.validateOptions, ["MAX_LENGTH"]) || "string" == typeof r && h.ucs2decode(r).length > t2.maxLength && e2.addError("MAX_LENGTH", [r.length, t2.maxLength], null, t2);
        }, minLength: function(e2, t2, r) {
          m(this.validateOptions, ["MIN_LENGTH"]) || "string" == typeof r && h.ucs2decode(r).length < t2.minLength && e2.addError("MIN_LENGTH", [r.length, t2.minLength], null, t2);
        }, pattern: function(e2, t2, r) {
          m(this.validateOptions, ["PATTERN"]) || "string" == typeof r && false === RegExp(t2.pattern).test(r) && e2.addError("PATTERN", [t2.pattern, r], null, t2);
        }, additionalItems: function(e2, t2, r) {
          m(this.validateOptions, ["ARRAY_ADDITIONAL_ITEMS"]) || Array.isArray(r) && false === t2.additionalItems && Array.isArray(t2.items) && r.length > t2.items.length && e2.addError("ARRAY_ADDITIONAL_ITEMS", null, null, t2);
        }, items: function() {
        }, maxItems: function(e2, t2, r) {
          m(this.validateOptions, ["ARRAY_LENGTH_LONG"]) || Array.isArray(r) && r.length > t2.maxItems && e2.addError("ARRAY_LENGTH_LONG", [r.length, t2.maxItems], null, t2);
        }, minItems: function(e2, t2, r) {
          m(this.validateOptions, ["ARRAY_LENGTH_SHORT"]) || Array.isArray(r) && r.length < t2.minItems && e2.addError("ARRAY_LENGTH_SHORT", [r.length, t2.minItems], null, t2);
        }, uniqueItems: function(e2, t2, r) {
          if (!m(this.validateOptions, ["ARRAY_UNIQUE"]) && Array.isArray(r) && true === t2.uniqueItems) {
            var i = [];
            false === h.isUniqueArray(r, i) && e2.addError("ARRAY_UNIQUE", i, null, t2);
          }
        }, maxProperties: function(e2, t2, r) {
          if (!m(this.validateOptions, ["OBJECT_PROPERTIES_MAXIMUM"]) && "object" === h.whatIs(r)) {
            var i = Object.keys(r).length;
            i > t2.maxProperties && e2.addError("OBJECT_PROPERTIES_MAXIMUM", [i, t2.maxProperties], null, t2);
          }
        }, minProperties: function(e2, t2, r) {
          if (!m(this.validateOptions, ["OBJECT_PROPERTIES_MINIMUM"]) && "object" === h.whatIs(r)) {
            var i = Object.keys(r).length;
            i < t2.minProperties && e2.addError("OBJECT_PROPERTIES_MINIMUM", [i, t2.minProperties], null, t2);
          }
        }, required: function(e2, t2, r) {
          if (!m(this.validateOptions, ["OBJECT_MISSING_REQUIRED_PROPERTY"]) && "object" === h.whatIs(r))
            for (var i = t2.required.length; i--; ) {
              var n = t2.required[i];
              void 0 === r[n] && e2.addError("OBJECT_MISSING_REQUIRED_PROPERTY", [n], null, t2);
            }
        }, additionalProperties: function(e2, t2, r) {
          if (void 0 === t2.properties && void 0 === t2.patternProperties)
            return u.properties.call(this, e2, t2, r);
        }, patternProperties: function(e2, t2, r) {
          if (void 0 === t2.properties)
            return u.properties.call(this, e2, t2, r);
        }, properties: function(e2, t2, r) {
          if (!m(this.validateOptions, ["OBJECT_ADDITIONAL_PROPERTIES"]) && "object" === h.whatIs(r)) {
            var i = void 0 !== t2.properties ? t2.properties : {}, n = void 0 !== t2.patternProperties ? t2.patternProperties : {};
            if (false === t2.additionalProperties) {
              var a = Object.keys(r), o2 = Object.keys(i), s2 = Object.keys(n);
              a = h.difference(a, o2);
              for (var l = s2.length; l--; )
                for (var u2 = RegExp(s2[l]), d = a.length; d--; )
                  true === u2.test(a[d]) && a.splice(d, 1);
              if (0 < a.length) {
                var f = this.options.assumeAdditional.length;
                if (f)
                  for (; f--; ) {
                    var c = a.indexOf(this.options.assumeAdditional[f]);
                    -1 !== c && a.splice(c, 1);
                  }
                var p2 = a.length;
                if (p2)
                  for (; p2--; )
                    e2.addError("OBJECT_ADDITIONAL_PROPERTIES", [a[p2]], null, t2);
              }
            }
          }
        }, dependencies: function(e2, t2, r) {
          if (!m(this.validateOptions, ["OBJECT_DEPENDENCY_KEY"]) && "object" === h.whatIs(r))
            for (var i = Object.keys(t2.dependencies), n = i.length; n--; ) {
              var a = i[n];
              if (r[a]) {
                var o2 = t2.dependencies[a];
                if ("object" === h.whatIs(o2))
                  p.validate.call(this, e2, o2, r);
                else
                  for (var s2 = o2.length; s2--; ) {
                    var l = o2[s2];
                    void 0 === r[l] && e2.addError("OBJECT_DEPENDENCY_KEY", [l, a], null, t2);
                  }
              }
            }
        }, enum: function(e2, t2, r) {
          if (!m(this.validateOptions, ["ENUM_CASE_MISMATCH", "ENUM_MISMATCH"])) {
            for (var i = false, n = false, a = t2.enum.length; a--; ) {
              if (h.areEqual(r, t2.enum[a])) {
                i = true;
                break;
              }
              h.areEqual(r, t2.enum[a]), n = true;
            }
            if (false === i) {
              var o2 = n && this.options.enumCaseInsensitiveComparison ? "ENUM_CASE_MISMATCH" : "ENUM_MISMATCH";
              e2.addError(o2, [r], null, t2);
            }
          }
        }, type: function(e2, t2, r) {
          if (!m(this.validateOptions, ["INVALID_TYPE"])) {
            var i = h.whatIs(r);
            "string" == typeof t2.type ? i === t2.type || "integer" === i && "number" === t2.type || e2.addError("INVALID_TYPE", [t2.type, i], null, t2) : -1 !== t2.type.indexOf(i) || "integer" === i && -1 !== t2.type.indexOf("number") || e2.addError("INVALID_TYPE", [t2.type, i], null, t2);
          }
        }, allOf: function(e2, t2, r) {
          for (var i = t2.allOf.length; i--; ) {
            var n = p.validate.call(this, e2, t2.allOf[i], r);
            if (this.options.breakOnFirstError && false === n)
              break;
          }
        }, anyOf: function(e2, t2, r) {
          for (var i = [], n = false, a = t2.anyOf.length; a-- && false === n; ) {
            var o2 = new s(e2);
            i.push(o2), n = p.validate.call(this, o2, t2.anyOf[a], r);
          }
          false === n && e2.addError("ANY_OF_MISSING", void 0, i, t2);
        }, oneOf: function(e2, t2, r) {
          for (var i = 0, n = [], a = t2.oneOf.length; a--; ) {
            var o2 = new s(e2, { maxErrors: 1 });
            n.push(o2), true === p.validate.call(this, o2, t2.oneOf[a], r) && i++;
          }
          0 === i ? e2.addError("ONE_OF_MISSING", void 0, n, t2) : 1 < i && e2.addError("ONE_OF_MULTIPLE", null, null, t2);
        }, not: function(e2, t2, r) {
          var i = new s(e2);
          true === p.validate.call(this, i, t2.not, r) && e2.addError("NOT_PASSED", null, null, t2);
        }, definitions: function() {
        }, format: function(r, i, n) {
          var e2 = o[i.format];
          if ("function" == typeof e2) {
            if (m(this.validateOptions, ["INVALID_FORMAT"]))
              return;
            if (2 === e2.length) {
              var a = h.clone(r.path);
              r.addAsyncTask(e2, [n], function(e3) {
                if (true !== e3) {
                  var t2 = r.path;
                  r.path = a, r.addError("INVALID_FORMAT", [i.format, n], null, i), r.path = t2;
                }
              });
            } else
              true !== e2.call(this, n) && r.addError("INVALID_FORMAT", [i.format, n], null, i);
          } else
            true !== this.options.ignoreUnknownFormats && r.addError("UNKNOWN_FORMAT", [i.format], null, i);
        } };
        p.JsonValidators = u, p.validate = function(e2, t2, r) {
          e2.commonErrorMessage = "JSON_OBJECT_VALIDATION_FAILED";
          var i = h.whatIs(t2);
          if ("object" !== i)
            return e2.addError("SCHEMA_NOT_AN_OBJECT", [i], null, t2), false;
          var n = Object.keys(t2);
          if (0 === n.length)
            return true;
          var a = false;
          if (e2.rootSchema || (e2.rootSchema = t2, a = true), void 0 !== t2.$ref) {
            for (var o2 = 99; t2.$ref && 0 < o2; ) {
              if (!t2.__$refResolved) {
                e2.addError("REF_UNRESOLVED", [t2.$ref], null, t2);
                break;
              }
              if (t2.__$refResolved === t2)
                break;
              t2 = t2.__$refResolved, n = Object.keys(t2), o2--;
            }
            if (0 === o2)
              throw new Error("Circular dependency by $ref references!");
          }
          var s2 = h.whatIs(r);
          if (t2.type && (n.splice(n.indexOf("type"), 1), u.type.call(this, e2, t2, r), e2.errors.length && this.options.breakOnFirstError))
            return false;
          for (var l = n.length; l-- && !(u[n[l]] && (u[n[l]].call(this, e2, t2, r), e2.errors.length && this.options.breakOnFirstError)); )
            ;
          return 0 !== e2.errors.length && false !== this.options.breakOnFirstError || ("array" === s2 ? function(e3, t3, r2) {
            var i2 = r2.length;
            if (Array.isArray(t3.items))
              for (; i2--; )
                i2 < t3.items.length ? (e3.path.push(i2), p.validate.call(this, e3, t3.items[i2], r2[i2]), e3.path.pop()) : "object" == typeof t3.additionalItems && (e3.path.push(i2), p.validate.call(this, e3, t3.additionalItems, r2[i2]), e3.path.pop());
            else if ("object" == typeof t3.items)
              for (; i2--; )
                e3.path.push(i2), p.validate.call(this, e3, t3.items, r2[i2]), e3.path.pop();
          }.call(this, e2, t2, r) : "object" === s2 && function(e3, t3, r2) {
            var i2 = t3.additionalProperties;
            true !== i2 && void 0 !== i2 || (i2 = {});
            for (var n2 = t3.properties ? Object.keys(t3.properties) : [], a2 = t3.patternProperties ? Object.keys(t3.patternProperties) : [], o3 = Object.keys(r2), s3 = o3.length; s3--; ) {
              var l2 = o3[s3], u2 = r2[l2], d = [];
              -1 !== n2.indexOf(l2) && d.push(t3.properties[l2]);
              for (var f = a2.length; f--; ) {
                var c = a2[f];
                true === RegExp(c).test(l2) && d.push(t3.patternProperties[c]);
              }
              for (0 === d.length && false !== i2 && d.push(i2), f = d.length; f--; )
                e3.path.push(l2), p.validate.call(this, e3, d[f], u2), e3.path.pop();
            }
          }.call(this, e2, t2, r)), "function" == typeof this.options.customValidator && this.options.customValidator.call(this, e2, t2, r), a && (e2.rootSchema = void 0), 0 === e2.errors.length;
        };
      }, { "./FormatValidators": 106, "./Report": 109, "./Utils": 113 }], 108: [function(e, t, r) {
        "function" != typeof Number.isFinite && (Number.isFinite = function(e2) {
          return "number" == typeof e2 && (e2 == e2 && e2 !== 1 / 0 && e2 !== -1 / 0);
        });
      }, {}], 109: [function(e, t, r) {
        (function(d) {
          (function() {
            "use strict";
            var r2 = e("lodash.get"), n = e("./Errors"), f = e("./Utils");
            function i(e2, t2) {
              this.parentReport = e2 instanceof i ? e2 : void 0, this.options = e2 instanceof i ? e2.options : e2 || {}, this.reportOptions = t2 || {}, this.errors = [], this.path = [], this.asyncTasks = [], this.rootSchema = void 0, this.commonErrorMessage = void 0, this.json = void 0;
            }
            i.prototype.isValid = function() {
              if (0 < this.asyncTasks.length)
                throw new Error("Async tasks pending, can't answer isValid");
              return 0 === this.errors.length;
            }, i.prototype.addAsyncTask = function(e2, t2, r3) {
              this.asyncTasks.push([e2, t2, r3]);
            }, i.prototype.getAncestor = function(e2) {
              if (this.parentReport)
                return this.parentReport.getSchemaId() === e2 ? this.parentReport : this.parentReport.getAncestor(e2);
            }, i.prototype.processAsyncTasks = function(e2, r3) {
              var t2 = e2 || 2e3, i2 = this.asyncTasks.length, n2 = i2, a = false, o = this;
              function s() {
                d.nextTick(function() {
                  var e3 = 0 === o.errors.length, t3 = e3 ? null : o.errors;
                  r3(t3, e3);
                });
              }
              function l(t3) {
                return function(e3) {
                  a || (t3(e3), 0 == --i2 && s());
                };
              }
              if (0 === i2 || 0 < this.errors.length && this.options.breakOnFirstError)
                s();
              else {
                for (; n2--; ) {
                  var u = this.asyncTasks[n2];
                  u[0].apply(null, u[1].concat(l(u[2])));
                }
                setTimeout(function() {
                  0 < i2 && (a = true, o.addError("ASYNC_TIMEOUT", [i2, t2]), r3(o.errors, false));
                }, t2);
              }
            }, i.prototype.getPath = function(e2) {
              var t2 = [];
              return this.parentReport && (t2 = t2.concat(this.parentReport.path)), t2 = t2.concat(this.path), true !== e2 && (t2 = "#/" + t2.map(function(e3) {
                return e3 = e3.toString(), f.isAbsoluteUri(e3) ? "uri(" + e3 + ")" : e3.replace(/\~/g, "~0").replace(/\//g, "~1");
              }).join("/")), t2;
            }, i.prototype.getSchemaId = function() {
              if (!this.rootSchema)
                return null;
              var e2 = [];
              for (this.parentReport && (e2 = e2.concat(this.parentReport.path)), e2 = e2.concat(this.path); 0 < e2.length; ) {
                var t2 = r2(this.rootSchema, e2);
                if (t2 && t2.id)
                  return t2.id;
                e2.pop();
              }
              return this.rootSchema.id;
            }, i.prototype.hasError = function(e2, t2) {
              for (var r3 = this.errors.length; r3--; )
                if (this.errors[r3].code === e2) {
                  for (var i2 = true, n2 = this.errors[r3].params.length; n2--; )
                    this.errors[r3].params[n2] !== t2[n2] && (i2 = false);
                  if (i2)
                    return i2;
                }
              return false;
            }, i.prototype.addError = function(e2, t2, r3, i2) {
              if (!e2)
                throw new Error("No errorCode passed into addError()");
              this.addCustomError(e2, n[e2], t2, r3, i2);
            }, i.prototype.getJson = function() {
              for (var e2 = this; void 0 === e2.json; )
                if (void 0 === (e2 = e2.parentReport))
                  return;
              return e2.json;
            }, i.prototype.addCustomError = function(e2, t2, r3, i2, n2) {
              if (!(this.errors.length >= this.reportOptions.maxErrors)) {
                if (!t2)
                  throw new Error("No errorMessage known for code " + e2);
                for (var a = (r3 = r3 || []).length; a--; ) {
                  var o = f.whatIs(r3[a]), s = "object" === o || "null" === o ? JSON.stringify(r3[a]) : r3[a];
                  t2 = t2.replace("{" + a + "}", s);
                }
                var l = { code: e2, params: r3, message: t2, path: this.getPath(this.options.reportPathAsArray), schemaId: this.getSchemaId() };
                if (l[f.schemaSymbol] = n2, l[f.jsonSymbol] = this.getJson(), n2 && "string" == typeof n2 ? l.description = n2 : n2 && "object" == typeof n2 && (n2.title && (l.title = n2.title), n2.description && (l.description = n2.description)), null != i2) {
                  for (Array.isArray(i2) || (i2 = [i2]), l.inner = [], a = i2.length; a--; )
                    for (var u = i2[a], d2 = u.errors.length; d2--; )
                      l.inner.push(u.errors[d2]);
                  0 === l.inner.length && (l.inner = void 0);
                }
                this.errors.push(l);
              }
            }, t.exports = i;
          }).call(this);
        }).call(this, e("_process"));
      }, { "./Errors": 105, "./Utils": 113, _process: 3, "lodash.get": 1 }], 110: [function(e, t, r) {
        "use strict";
        var n = e("lodash.isequal"), _ = e("./Report"), g = e("./SchemaCompilation"), y = e("./SchemaValidation"), a = e("./Utils");
        function E(e2) {
          var t2 = e2.indexOf("#");
          return -1 === t2 ? e2 : e2.slice(0, t2);
        }
        function A(e2, t2) {
          if ("object" == typeof e2 && null !== e2) {
            if (!t2)
              return e2;
            if (e2.id && (e2.id === t2 || "#" === e2.id[0] && e2.id.substring(1) === t2))
              return e2;
            var r2, i;
            if (Array.isArray(e2)) {
              for (r2 = e2.length; r2--; )
                if (i = A(e2[r2], t2))
                  return i;
            } else {
              var n2 = Object.keys(e2);
              for (r2 = n2.length; r2--; ) {
                var a2 = n2[r2];
                if (0 !== a2.indexOf("__$") && (i = A(e2[a2], t2)))
                  return i;
              }
            }
          }
        }
        r.cacheSchemaByUri = function(e2, t2) {
          var r2 = E(e2);
          r2 && (this.cache[r2] = t2);
        }, r.removeFromCacheByUri = function(e2) {
          var t2 = E(e2);
          t2 && delete this.cache[t2];
        }, r.checkCacheForUri = function(e2) {
          var t2 = E(e2);
          return !!t2 && null != this.cache[t2];
        }, r.getSchema = function(e2, t2) {
          return "object" == typeof t2 && (t2 = r.getSchemaByReference.call(this, e2, t2)), "string" == typeof t2 && (t2 = r.getSchemaByUri.call(this, e2, t2)), t2;
        }, r.getSchemaByReference = function(e2, t2) {
          for (var r2 = this.referenceCache.length; r2--; )
            if (n(this.referenceCache[r2][0], t2))
              return this.referenceCache[r2][1];
          var i = a.cloneDeep(t2);
          return this.referenceCache.push([t2, i]), i;
        }, r.getSchemaByUri = function(e2, t2, r2) {
          var i, n2, a2, o = E(t2), s = -1 === (n2 = (i = t2).indexOf("#")) ? void 0 : i.slice(n2 + 1), l = o ? this.cache[o] : r2;
          if (l && o && l !== r2) {
            var u;
            e2.path.push(o);
            var d = e2.getAncestor(l.id);
            if (d)
              u = d;
            else if (u = new _(e2), g.compileSchema.call(this, u, l)) {
              var f = this.options;
              try {
                this.options = l.__$validationOptions || this.options, y.validateSchema.call(this, u, l);
              } finally {
                this.options = f;
              }
            }
            var c = u.isValid();
            if (c || e2.addError("REMOTE_NOT_VALID", [t2], u), e2.path.pop(), !c)
              return;
          }
          if (l && s)
            for (var p = s.split("/"), h = 0, m = p.length; l && h < m; h++) {
              var v = (a2 = p[h], decodeURIComponent(a2).replace(/~[0-1]/g, function(e3) {
                return "~1" === e3 ? "/" : "~";
              }));
              l = 0 === h ? A(l, v) : l[v];
            }
          return l;
        }, r.getRemotePath = E;
      }, { "./Report": 109, "./SchemaCompilation": 111, "./SchemaValidation": 112, "./Utils": 113, "lodash.isequal": 2 }], 111: [function(e, t, _) {
        "use strict";
        var g = e("./Report"), y = e("./SchemaCache"), E = e("./Utils");
        function A(e2, t2) {
          if (E.isAbsoluteUri(t2))
            return t2;
          var r, i = e2.join(""), n = E.isAbsoluteUri(i), a = E.isRelativeUri(i), o = E.isRelativeUri(t2);
          n && o ? (r = i.match(/\/[^\/]*$/)) && (i = i.slice(0, r.index + 1)) : a && o ? i = "" : (r = i.match(/[^#/]+$/)) && (i = i.slice(0, r.index));
          var s = i + t2;
          return s = s.replace(/##/, "#");
        }
        var S = function(e2, t2) {
          for (var r = t2.length, i = 0; r--; ) {
            var n = new g(e2);
            _.compileSchema.call(this, n, t2[r]) && i++, e2.errors = e2.errors.concat(n.errors);
          }
          return i;
        };
        function b(e2, t2) {
          for (var r = e2.length; r--; )
            if (e2[r].id === t2)
              return e2[r];
          return null;
        }
        _.compileSchema = function(e2, t2) {
          if (e2.commonErrorMessage = "SCHEMA_COMPILATION_FAILED", "string" == typeof t2) {
            var r = y.getSchemaByUri.call(this, e2, t2);
            if (!r)
              return e2.addError("SCHEMA_NOT_REACHABLE", [t2]), false;
            t2 = r;
          }
          if (Array.isArray(t2))
            return function(e3, t3) {
              var r2, i2 = 0;
              do {
                for (var n2 = e3.errors.length; n2--; )
                  "UNRESOLVABLE_REFERENCE" === e3.errors[n2].code && e3.errors.splice(n2, 1);
                for (r2 = i2, i2 = S.call(this, e3, t3), n2 = t3.length; n2--; ) {
                  var a2 = t3[n2];
                  if (a2.__$missingReferences) {
                    for (var o2 = a2.__$missingReferences.length; o2--; ) {
                      var s2 = a2.__$missingReferences[o2], l2 = b(t3, s2.ref);
                      l2 && (s2.obj["__" + s2.key + "Resolved"] = l2, a2.__$missingReferences.splice(o2, 1));
                    }
                    0 === a2.__$missingReferences.length && delete a2.__$missingReferences;
                  }
                }
              } while (i2 !== t3.length && i2 !== r2);
              return e3.isValid();
            }.call(this, e2, t2);
          if (t2.__$compiled && t2.id && false === y.checkCacheForUri.call(this, t2.id) && (t2.__$compiled = void 0), t2.__$compiled)
            return true;
          t2.id && "string" == typeof t2.id && y.cacheSchemaByUri.call(this, t2.id, t2);
          var i = false;
          e2.rootSchema || (e2.rootSchema = t2, i = true);
          var n = e2.isValid();
          delete t2.__$missingReferences;
          for (var a = function e3(t3, r2, i2, n2) {
            if (r2 = r2 || [], i2 = i2 || [], n2 = n2 || [], "object" != typeof t3 || null === t3)
              return r2;
            var a2;
            if ("string" == typeof t3.id && i2.push(t3.id), "string" == typeof t3.$ref && void 0 === t3.__$refResolved && r2.push({ ref: A(i2, t3.$ref), key: "$ref", obj: t3, path: n2.slice(0) }), "string" == typeof t3.$schema && void 0 === t3.__$schemaResolved && r2.push({ ref: A(i2, t3.$schema), key: "$schema", obj: t3, path: n2.slice(0) }), Array.isArray(t3))
              for (a2 = t3.length; a2--; )
                n2.push(a2.toString()), e3(t3[a2], r2, i2, n2), n2.pop();
            else {
              var o2 = Object.keys(t3);
              for (a2 = o2.length; a2--; )
                0 !== o2[a2].indexOf("__$") && (n2.push(o2[a2]), e3(t3[o2[a2]], r2, i2, n2), n2.pop());
            }
            return "string" == typeof t3.id && i2.pop(), r2;
          }.call(this, t2), o = a.length; o--; ) {
            var s = a[o], l = y.getSchemaByUri.call(this, e2, s.ref, t2);
            if (!l) {
              var u = this.getSchemaReader();
              if (u) {
                var d = u(s.ref);
                if (d) {
                  d.id = s.ref;
                  var f = new g(e2);
                  _.compileSchema.call(this, f, d) ? l = y.getSchemaByUri.call(this, e2, s.ref, t2) : e2.errors = e2.errors.concat(f.errors);
                }
              }
            }
            if (!l) {
              var c = e2.hasError("REMOTE_NOT_VALID", [s.ref]), p = E.isAbsoluteUri(s.ref), h = false, m = true === this.options.ignoreUnresolvableReferences;
              p && (h = y.checkCacheForUri.call(this, s.ref)), c || m && p || h || (Array.prototype.push.apply(e2.path, s.path), e2.addError("UNRESOLVABLE_REFERENCE", [s.ref]), e2.path = e2.path.slice(0, -s.path.length), n && (t2.__$missingReferences = t2.__$missingReferences || [], t2.__$missingReferences.push(s)));
            }
            s.obj["__" + s.key + "Resolved"] = l;
          }
          var v = e2.isValid();
          return v ? t2.__$compiled = true : t2.id && "string" == typeof t2.id && y.removeFromCacheByUri.call(this, t2.id), i && (e2.rootSchema = void 0), v;
        };
      }, { "./Report": 109, "./SchemaCache": 110, "./Utils": 113 }], 112: [function(e, t, d) {
        "use strict";
        var r = e("./FormatValidators"), f = e("./JsonValidation"), c = e("./Report"), p = e("./Utils"), h = { $ref: function(e2, t2) {
          "string" != typeof t2.$ref && e2.addError("KEYWORD_TYPE_EXPECTED", ["$ref", "string"]);
        }, $schema: function(e2, t2) {
          "string" != typeof t2.$schema && e2.addError("KEYWORD_TYPE_EXPECTED", ["$schema", "string"]);
        }, multipleOf: function(e2, t2) {
          "number" != typeof t2.multipleOf ? e2.addError("KEYWORD_TYPE_EXPECTED", ["multipleOf", "number"]) : t2.multipleOf <= 0 && e2.addError("KEYWORD_MUST_BE", ["multipleOf", "strictly greater than 0"]);
        }, maximum: function(e2, t2) {
          "number" != typeof t2.maximum && e2.addError("KEYWORD_TYPE_EXPECTED", ["maximum", "number"]);
        }, exclusiveMaximum: function(e2, t2) {
          "boolean" != typeof t2.exclusiveMaximum ? e2.addError("KEYWORD_TYPE_EXPECTED", ["exclusiveMaximum", "boolean"]) : void 0 === t2.maximum && e2.addError("KEYWORD_DEPENDENCY", ["exclusiveMaximum", "maximum"]);
        }, minimum: function(e2, t2) {
          "number" != typeof t2.minimum && e2.addError("KEYWORD_TYPE_EXPECTED", ["minimum", "number"]);
        }, exclusiveMinimum: function(e2, t2) {
          "boolean" != typeof t2.exclusiveMinimum ? e2.addError("KEYWORD_TYPE_EXPECTED", ["exclusiveMinimum", "boolean"]) : void 0 === t2.minimum && e2.addError("KEYWORD_DEPENDENCY", ["exclusiveMinimum", "minimum"]);
        }, maxLength: function(e2, t2) {
          "integer" !== p.whatIs(t2.maxLength) ? e2.addError("KEYWORD_TYPE_EXPECTED", ["maxLength", "integer"]) : t2.maxLength < 0 && e2.addError("KEYWORD_MUST_BE", ["maxLength", "greater than, or equal to 0"]);
        }, minLength: function(e2, t2) {
          "integer" !== p.whatIs(t2.minLength) ? e2.addError("KEYWORD_TYPE_EXPECTED", ["minLength", "integer"]) : t2.minLength < 0 && e2.addError("KEYWORD_MUST_BE", ["minLength", "greater than, or equal to 0"]);
        }, pattern: function(t2, r2) {
          if ("string" != typeof r2.pattern)
            t2.addError("KEYWORD_TYPE_EXPECTED", ["pattern", "string"]);
          else
            try {
              RegExp(r2.pattern);
            } catch (e2) {
              t2.addError("KEYWORD_PATTERN", ["pattern", r2.pattern]);
            }
        }, additionalItems: function(e2, t2) {
          var r2 = p.whatIs(t2.additionalItems);
          "boolean" !== r2 && "object" !== r2 ? e2.addError("KEYWORD_TYPE_EXPECTED", ["additionalItems", ["boolean", "object"]]) : "object" === r2 && (e2.path.push("additionalItems"), d.validateSchema.call(this, e2, t2.additionalItems), e2.path.pop());
        }, items: function(e2, t2) {
          var r2 = p.whatIs(t2.items);
          if ("object" === r2)
            e2.path.push("items"), d.validateSchema.call(this, e2, t2.items), e2.path.pop();
          else if ("array" === r2)
            for (var i = t2.items.length; i--; )
              e2.path.push("items"), e2.path.push(i.toString()), d.validateSchema.call(this, e2, t2.items[i]), e2.path.pop(), e2.path.pop();
          else
            e2.addError("KEYWORD_TYPE_EXPECTED", ["items", ["array", "object"]]);
          true === this.options.forceAdditional && void 0 === t2.additionalItems && Array.isArray(t2.items) && e2.addError("KEYWORD_UNDEFINED_STRICT", ["additionalItems"]), this.options.assumeAdditional && void 0 === t2.additionalItems && Array.isArray(t2.items) && (t2.additionalItems = false);
        }, maxItems: function(e2, t2) {
          "number" != typeof t2.maxItems ? e2.addError("KEYWORD_TYPE_EXPECTED", ["maxItems", "integer"]) : t2.maxItems < 0 && e2.addError("KEYWORD_MUST_BE", ["maxItems", "greater than, or equal to 0"]);
        }, minItems: function(e2, t2) {
          "integer" !== p.whatIs(t2.minItems) ? e2.addError("KEYWORD_TYPE_EXPECTED", ["minItems", "integer"]) : t2.minItems < 0 && e2.addError("KEYWORD_MUST_BE", ["minItems", "greater than, or equal to 0"]);
        }, uniqueItems: function(e2, t2) {
          "boolean" != typeof t2.uniqueItems && e2.addError("KEYWORD_TYPE_EXPECTED", ["uniqueItems", "boolean"]);
        }, maxProperties: function(e2, t2) {
          "integer" !== p.whatIs(t2.maxProperties) ? e2.addError("KEYWORD_TYPE_EXPECTED", ["maxProperties", "integer"]) : t2.maxProperties < 0 && e2.addError("KEYWORD_MUST_BE", ["maxProperties", "greater than, or equal to 0"]);
        }, minProperties: function(e2, t2) {
          "integer" !== p.whatIs(t2.minProperties) ? e2.addError("KEYWORD_TYPE_EXPECTED", ["minProperties", "integer"]) : t2.minProperties < 0 && e2.addError("KEYWORD_MUST_BE", ["minProperties", "greater than, or equal to 0"]);
        }, required: function(e2, t2) {
          if ("array" !== p.whatIs(t2.required))
            e2.addError("KEYWORD_TYPE_EXPECTED", ["required", "array"]);
          else if (0 === t2.required.length)
            e2.addError("KEYWORD_MUST_BE", ["required", "an array with at least one element"]);
          else {
            for (var r2 = t2.required.length; r2--; )
              "string" != typeof t2.required[r2] && e2.addError("KEYWORD_VALUE_TYPE", ["required", "string"]);
            false === p.isUniqueArray(t2.required) && e2.addError("KEYWORD_MUST_BE", ["required", "an array with unique items"]);
          }
        }, additionalProperties: function(e2, t2) {
          var r2 = p.whatIs(t2.additionalProperties);
          "boolean" !== r2 && "object" !== r2 ? e2.addError("KEYWORD_TYPE_EXPECTED", ["additionalProperties", ["boolean", "object"]]) : "object" === r2 && (e2.path.push("additionalProperties"), d.validateSchema.call(this, e2, t2.additionalProperties), e2.path.pop());
        }, properties: function(e2, t2) {
          if ("object" === p.whatIs(t2.properties)) {
            for (var r2 = Object.keys(t2.properties), i = r2.length; i--; ) {
              var n = r2[i], a = t2.properties[n];
              e2.path.push("properties"), e2.path.push(n), d.validateSchema.call(this, e2, a), e2.path.pop(), e2.path.pop();
            }
            true === this.options.forceAdditional && void 0 === t2.additionalProperties && e2.addError("KEYWORD_UNDEFINED_STRICT", ["additionalProperties"]), this.options.assumeAdditional && void 0 === t2.additionalProperties && (t2.additionalProperties = false), true === this.options.forceProperties && 0 === r2.length && e2.addError("CUSTOM_MODE_FORCE_PROPERTIES", ["properties"]);
          } else
            e2.addError("KEYWORD_TYPE_EXPECTED", ["properties", "object"]);
        }, patternProperties: function(t2, e2) {
          if ("object" === p.whatIs(e2.patternProperties)) {
            for (var r2 = Object.keys(e2.patternProperties), i = r2.length; i--; ) {
              var n = r2[i], a = e2.patternProperties[n];
              try {
                RegExp(n);
              } catch (e3) {
                t2.addError("KEYWORD_PATTERN", ["patternProperties", n]);
              }
              t2.path.push("patternProperties"), t2.path.push(n.toString()), d.validateSchema.call(this, t2, a), t2.path.pop(), t2.path.pop();
            }
            true === this.options.forceProperties && 0 === r2.length && t2.addError("CUSTOM_MODE_FORCE_PROPERTIES", ["patternProperties"]);
          } else
            t2.addError("KEYWORD_TYPE_EXPECTED", ["patternProperties", "object"]);
        }, dependencies: function(e2, t2) {
          if ("object" !== p.whatIs(t2.dependencies))
            e2.addError("KEYWORD_TYPE_EXPECTED", ["dependencies", "object"]);
          else
            for (var r2 = Object.keys(t2.dependencies), i = r2.length; i--; ) {
              var n = r2[i], a = t2.dependencies[n], o = p.whatIs(a);
              if ("object" === o)
                e2.path.push("dependencies"), e2.path.push(n), d.validateSchema.call(this, e2, a), e2.path.pop(), e2.path.pop();
              else if ("array" === o) {
                var s = a.length;
                for (0 === s && e2.addError("KEYWORD_MUST_BE", ["dependencies", "not empty array"]); s--; )
                  "string" != typeof a[s] && e2.addError("KEYWORD_VALUE_TYPE", ["dependensices", "string"]);
                false === p.isUniqueArray(a) && e2.addError("KEYWORD_MUST_BE", ["dependencies", "an array with unique items"]);
              } else
                e2.addError("KEYWORD_VALUE_TYPE", ["dependencies", "object or array"]);
            }
        }, enum: function(e2, t2) {
          false === Array.isArray(t2.enum) ? e2.addError("KEYWORD_TYPE_EXPECTED", ["enum", "array"]) : 0 === t2.enum.length ? e2.addError("KEYWORD_MUST_BE", ["enum", "an array with at least one element"]) : false === p.isUniqueArray(t2.enum) && e2.addError("KEYWORD_MUST_BE", ["enum", "an array with unique elements"]);
        }, type: function(e2, t2) {
          var r2 = ["array", "boolean", "integer", "number", "null", "object", "string"], i = r2.join(","), n = Array.isArray(t2.type);
          if (n) {
            for (var a = t2.type.length; a--; )
              -1 === r2.indexOf(t2.type[a]) && e2.addError("KEYWORD_TYPE_EXPECTED", ["type", i]);
            false === p.isUniqueArray(t2.type) && e2.addError("KEYWORD_MUST_BE", ["type", "an object with unique properties"]);
          } else
            "string" == typeof t2.type ? -1 === r2.indexOf(t2.type) && e2.addError("KEYWORD_TYPE_EXPECTED", ["type", i]) : e2.addError("KEYWORD_TYPE_EXPECTED", ["type", ["string", "array"]]);
          true === this.options.noEmptyStrings && ("string" === t2.type || n && -1 !== t2.type.indexOf("string")) && void 0 === t2.minLength && void 0 === t2.enum && void 0 === t2.format && (t2.minLength = 1), true === this.options.noEmptyArrays && ("array" === t2.type || n && -1 !== t2.type.indexOf("array")) && void 0 === t2.minItems && (t2.minItems = 1), true === this.options.forceProperties && ("object" === t2.type || n && -1 !== t2.type.indexOf("object")) && void 0 === t2.properties && void 0 === t2.patternProperties && e2.addError("KEYWORD_UNDEFINED_STRICT", ["properties"]), true === this.options.forceItems && ("array" === t2.type || n && -1 !== t2.type.indexOf("array")) && void 0 === t2.items && e2.addError("KEYWORD_UNDEFINED_STRICT", ["items"]), true === this.options.forceMinItems && ("array" === t2.type || n && -1 !== t2.type.indexOf("array")) && void 0 === t2.minItems && e2.addError("KEYWORD_UNDEFINED_STRICT", ["minItems"]), true === this.options.forceMaxItems && ("array" === t2.type || n && -1 !== t2.type.indexOf("array")) && void 0 === t2.maxItems && e2.addError("KEYWORD_UNDEFINED_STRICT", ["maxItems"]), true === this.options.forceMinLength && ("string" === t2.type || n && -1 !== t2.type.indexOf("string")) && void 0 === t2.minLength && void 0 === t2.format && void 0 === t2.enum && void 0 === t2.pattern && e2.addError("KEYWORD_UNDEFINED_STRICT", ["minLength"]), true === this.options.forceMaxLength && ("string" === t2.type || n && -1 !== t2.type.indexOf("string")) && void 0 === t2.maxLength && void 0 === t2.format && void 0 === t2.enum && void 0 === t2.pattern && e2.addError("KEYWORD_UNDEFINED_STRICT", ["maxLength"]);
        }, allOf: function(e2, t2) {
          if (false === Array.isArray(t2.allOf))
            e2.addError("KEYWORD_TYPE_EXPECTED", ["allOf", "array"]);
          else if (0 === t2.allOf.length)
            e2.addError("KEYWORD_MUST_BE", ["allOf", "an array with at least one element"]);
          else
            for (var r2 = t2.allOf.length; r2--; )
              e2.path.push("allOf"), e2.path.push(r2.toString()), d.validateSchema.call(this, e2, t2.allOf[r2]), e2.path.pop(), e2.path.pop();
        }, anyOf: function(e2, t2) {
          if (false === Array.isArray(t2.anyOf))
            e2.addError("KEYWORD_TYPE_EXPECTED", ["anyOf", "array"]);
          else if (0 === t2.anyOf.length)
            e2.addError("KEYWORD_MUST_BE", ["anyOf", "an array with at least one element"]);
          else
            for (var r2 = t2.anyOf.length; r2--; )
              e2.path.push("anyOf"), e2.path.push(r2.toString()), d.validateSchema.call(this, e2, t2.anyOf[r2]), e2.path.pop(), e2.path.pop();
        }, oneOf: function(e2, t2) {
          if (false === Array.isArray(t2.oneOf))
            e2.addError("KEYWORD_TYPE_EXPECTED", ["oneOf", "array"]);
          else if (0 === t2.oneOf.length)
            e2.addError("KEYWORD_MUST_BE", ["oneOf", "an array with at least one element"]);
          else
            for (var r2 = t2.oneOf.length; r2--; )
              e2.path.push("oneOf"), e2.path.push(r2.toString()), d.validateSchema.call(this, e2, t2.oneOf[r2]), e2.path.pop(), e2.path.pop();
        }, not: function(e2, t2) {
          "object" !== p.whatIs(t2.not) ? e2.addError("KEYWORD_TYPE_EXPECTED", ["not", "object"]) : (e2.path.push("not"), d.validateSchema.call(this, e2, t2.not), e2.path.pop());
        }, definitions: function(e2, t2) {
          if ("object" !== p.whatIs(t2.definitions))
            e2.addError("KEYWORD_TYPE_EXPECTED", ["definitions", "object"]);
          else
            for (var r2 = Object.keys(t2.definitions), i = r2.length; i--; ) {
              var n = r2[i], a = t2.definitions[n];
              e2.path.push("definitions"), e2.path.push(n), d.validateSchema.call(this, e2, a), e2.path.pop(), e2.path.pop();
            }
        }, format: function(e2, t2) {
          "string" != typeof t2.format ? e2.addError("KEYWORD_TYPE_EXPECTED", ["format", "string"]) : void 0 === r[t2.format] && true !== this.options.ignoreUnknownFormats && e2.addError("UNKNOWN_FORMAT", [t2.format]);
        }, id: function(e2, t2) {
          "string" != typeof t2.id && e2.addError("KEYWORD_TYPE_EXPECTED", ["id", "string"]);
        }, title: function(e2, t2) {
          "string" != typeof t2.title && e2.addError("KEYWORD_TYPE_EXPECTED", ["title", "string"]);
        }, description: function(e2, t2) {
          "string" != typeof t2.description && e2.addError("KEYWORD_TYPE_EXPECTED", ["description", "string"]);
        }, default: function() {
        } };
        d.validateSchema = function(e2, t2) {
          if (e2.commonErrorMessage = "SCHEMA_VALIDATION_FAILED", Array.isArray(t2))
            return function(e3, t3) {
              for (var r3 = t3.length; r3--; )
                d.validateSchema.call(this, e3, t3[r3]);
              return e3.isValid();
            }.call(this, e2, t2);
          if (t2.__$validated)
            return true;
          var r2 = t2.$schema && t2.id !== t2.$schema;
          if (r2)
            if (t2.__$schemaResolved && t2.__$schemaResolved !== t2) {
              var i = new c(e2);
              false === f.validate.call(this, i, t2.__$schemaResolved, t2) && e2.addError("PARENT_SCHEMA_VALIDATION_FAILED", null, i);
            } else
              true !== this.options.ignoreUnresolvableReferences && e2.addError("REF_UNRESOLVED", [t2.$schema]);
          if (true === this.options.noTypeless) {
            if (void 0 !== t2.type) {
              var n = [];
              Array.isArray(t2.anyOf) && (n = n.concat(t2.anyOf)), Array.isArray(t2.oneOf) && (n = n.concat(t2.oneOf)), Array.isArray(t2.allOf) && (n = n.concat(t2.allOf)), n.forEach(function(e3) {
                e3.type || (e3.type = t2.type);
              });
            }
            void 0 === t2.enum && void 0 === t2.type && void 0 === t2.anyOf && void 0 === t2.oneOf && void 0 === t2.not && void 0 === t2.$ref && e2.addError("KEYWORD_UNDEFINED_STRICT", ["type"]);
          }
          for (var a = Object.keys(t2), o = a.length; o--; ) {
            var s = a[o];
            0 !== s.indexOf("__") && (void 0 !== h[s] ? h[s].call(this, e2, t2) : r2 || true === this.options.noExtraKeywords && e2.addError("KEYWORD_UNEXPECTED", [s]));
          }
          if (true === this.options.pedanticCheck) {
            if (t2.enum) {
              var l = p.clone(t2);
              for (delete l.enum, delete l.default, e2.path.push("enum"), o = t2.enum.length; o--; )
                e2.path.push(o.toString()), f.validate.call(this, e2, l, t2.enum[o]), e2.path.pop();
              e2.path.pop();
            }
            t2.default && (e2.path.push("default"), f.validate.call(this, e2, t2, t2.default), e2.path.pop());
          }
          var u = e2.isValid();
          return u && (t2.__$validated = true), u;
        };
      }, { "./FormatValidators": 106, "./JsonValidation": 107, "./Report": 109, "./Utils": 113 }], 113: [function(e, t, l) {
        "use strict";
        l.jsonSymbol = Symbol.for("z-schema/json"), l.schemaSymbol = Symbol.for("z-schema/schema");
        var u = l.sortedKeys = function(e2) {
          return Object.keys(e2).sort();
        };
        l.isAbsoluteUri = function(e2) {
          return /^https?:\/\//.test(e2);
        }, l.isRelativeUri = function(e2) {
          return /.+#/.test(e2);
        }, l.whatIs = function(e2) {
          var t2 = typeof e2;
          return "object" === t2 ? null === e2 ? "null" : Array.isArray(e2) ? "array" : "object" : "number" === t2 ? Number.isFinite(e2) ? e2 % 1 == 0 ? "integer" : "number" : Number.isNaN(e2) ? "not-a-number" : "unknown-number" : t2;
        }, l.areEqual = function e2(t2, r, i) {
          var n, a, o = (i = i || {}).caseInsensitiveComparison || false;
          if (t2 === r)
            return true;
          if (true === o && "string" == typeof t2 && "string" == typeof r && t2.toUpperCase() === r.toUpperCase())
            return true;
          if (Array.isArray(t2) && Array.isArray(r)) {
            if (t2.length !== r.length)
              return false;
            for (a = t2.length, n = 0; n < a; n++)
              if (!e2(t2[n], r[n], { caseInsensitiveComparison: o }))
                return false;
            return true;
          }
          if ("object" !== l.whatIs(t2) || "object" !== l.whatIs(r))
            return false;
          var s = u(t2);
          if (!e2(s, u(r), { caseInsensitiveComparison: o }))
            return false;
          for (a = s.length, n = 0; n < a; n++)
            if (!e2(t2[s[n]], r[s[n]], { caseInsensitiveComparison: o }))
              return false;
          return true;
        }, l.isUniqueArray = function(e2, t2) {
          var r, i, n = e2.length;
          for (r = 0; r < n; r++)
            for (i = r + 1; i < n; i++)
              if (l.areEqual(e2[r], e2[i]))
                return t2 && t2.push(r, i), false;
          return true;
        }, l.difference = function(e2, t2) {
          for (var r = [], i = e2.length; i--; )
            -1 === t2.indexOf(e2[i]) && r.push(e2[i]);
          return r;
        }, l.clone = function(e2) {
          if (void 0 !== e2) {
            if ("object" != typeof e2 || null === e2)
              return e2;
            var t2, r;
            if (Array.isArray(e2))
              for (t2 = [], r = e2.length; r--; )
                t2[r] = e2[r];
            else {
              t2 = {};
              var i = Object.keys(e2);
              for (r = i.length; r--; ) {
                var n = i[r];
                t2[n] = e2[n];
              }
            }
            return t2;
          }
        }, l.cloneDeep = function(e2) {
          var s = 0, l2 = /* @__PURE__ */ new Map(), u2 = [];
          return function e3(t2) {
            if ("object" != typeof t2 || null === t2)
              return t2;
            var r, i, n;
            if (void 0 !== (n = l2.get(t2)))
              return u2[n];
            if (l2.set(t2, s++), Array.isArray(t2))
              for (r = [], u2.push(r), i = t2.length; i--; )
                r[i] = e3(t2[i]);
            else {
              r = {}, u2.push(r);
              var a = Object.keys(t2);
              for (i = a.length; i--; ) {
                var o = a[i];
                r[o] = e3(t2[o]);
              }
            }
            return r;
          }(e2);
        }, l.ucs2decode = function(e2) {
          for (var t2, r, i = [], n = 0, a = e2.length; n < a; )
            55296 <= (t2 = e2.charCodeAt(n++)) && t2 <= 56319 && n < a ? 56320 == (64512 & (r = e2.charCodeAt(n++))) ? i.push(((1023 & t2) << 10) + (1023 & r) + 65536) : (i.push(t2), n--) : i.push(t2);
          return i;
        };
      }, {}], 114: [function(e, s, t) {
        (function(g) {
          (function() {
            "use strict";
            e("./Polyfills");
            var f = e("lodash.get"), c = e("./Report"), r = e("./FormatValidators"), p = e("./JsonValidation"), h = e("./SchemaCache"), m = e("./SchemaCompilation"), v = e("./SchemaValidation"), _ = e("./Utils"), i = e("./schemas/schema.json"), n = e("./schemas/hyper-schema.json"), a = { asyncTimeout: 2e3, forceAdditional: false, assumeAdditional: false, enumCaseInsensitiveComparison: false, forceItems: false, forceMinItems: false, forceMaxItems: false, forceMinLength: false, forceMaxLength: false, forceProperties: false, ignoreUnresolvableReferences: false, noExtraKeywords: false, noTypeless: false, noEmptyStrings: false, noEmptyArrays: false, strictUris: false, strictMode: false, reportPathAsArray: false, breakOnFirstError: false, pedanticCheck: false, ignoreUnknownFormats: false, customValidator: null };
            function o(e2) {
              var t3;
              if ("object" == typeof e2) {
                for (var r2, i2 = Object.keys(e2), n2 = i2.length; n2--; )
                  if (r2 = i2[n2], void 0 === a[r2])
                    throw new Error("Unexpected option passed to constructor: " + r2);
                for (n2 = (i2 = Object.keys(a)).length; n2--; )
                  void 0 === e2[r2 = i2[n2]] && (e2[r2] = _.clone(a[r2]));
                t3 = e2;
              } else
                t3 = _.clone(a);
              return true === t3.strictMode && (t3.forceAdditional = true, t3.forceItems = true, t3.forceMaxLength = true, t3.forceProperties = true, t3.noExtraKeywords = true, t3.noTypeless = true, t3.noEmptyStrings = true, t3.noEmptyArrays = true), t3;
            }
            function t2(e2) {
              this.cache = {}, this.referenceCache = [], this.validateOptions = {}, this.options = o(e2);
              var t3 = o({});
              this.setRemoteReference("http://json-schema.org/draft-04/schema", i, t3), this.setRemoteReference("http://json-schema.org/draft-04/hyper-schema", n, t3);
            }
            t2.prototype.compileSchema = function(e2) {
              var t3 = new c(this.options);
              return e2 = h.getSchema.call(this, t3, e2), m.compileSchema.call(this, t3, e2), (this.lastReport = t3).isValid();
            }, t2.prototype.validateSchema = function(e2) {
              if (Array.isArray(e2) && 0 === e2.length)
                throw new Error(".validateSchema was called with an empty array");
              var t3 = new c(this.options);
              return e2 = h.getSchema.call(this, t3, e2), m.compileSchema.call(this, t3, e2) && v.validateSchema.call(this, t3, e2), (this.lastReport = t3).isValid();
            }, t2.prototype.validate = function(e2, t3, r2, i2) {
              "function" === _.whatIs(r2) && (i2 = r2, r2 = {}), r2 || (r2 = {}), this.validateOptions = r2;
              var n2 = _.whatIs(t3);
              if ("string" !== n2 && "object" !== n2) {
                var a2 = new Error("Invalid .validate call - schema must be a string or object but " + n2 + " was passed!");
                if (i2)
                  return void g.nextTick(function() {
                    i2(a2, false);
                  });
                throw a2;
              }
              var o2 = false, s2 = new c(this.options);
              if (s2.json = e2, "string" == typeof t3) {
                var l = t3;
                if (!(t3 = h.getSchema.call(this, s2, l)))
                  throw new Error("Schema with id '" + l + "' wasn't found in the validator cache!");
              } else
                t3 = h.getSchema.call(this, s2, t3);
              var u = false;
              o2 || (u = m.compileSchema.call(this, s2, t3)), u || (this.lastReport = s2, o2 = true);
              var d = false;
              if (o2 || (d = v.validateSchema.call(this, s2, t3)), d || (this.lastReport = s2, o2 = true), r2.schemaPath && (s2.rootSchema = t3, !(t3 = f(t3, r2.schemaPath))))
                throw new Error("Schema path '" + r2.schemaPath + "' wasn't found in the schema!");
              if (o2 || p.validate.call(this, s2, t3, e2), !i2) {
                if (0 < s2.asyncTasks.length)
                  throw new Error("This validation has async tasks and cannot be done in sync mode, please provide callback argument.");
                return (this.lastReport = s2).isValid();
              }
              s2.processAsyncTasks(this.options.asyncTimeout, i2);
            }, t2.prototype.getLastError = function() {
              if (0 === this.lastReport.errors.length)
                return null;
              var e2 = new Error();
              return e2.name = "z-schema validation error", e2.message = this.lastReport.commonErrorMessage, e2.details = this.lastReport.errors, e2;
            }, t2.prototype.getLastErrors = function() {
              return this.lastReport && 0 < this.lastReport.errors.length ? this.lastReport.errors : null;
            }, t2.prototype.getMissingReferences = function(e2) {
              for (var t3 = [], r2 = (e2 = e2 || this.lastReport.errors).length; r2--; ) {
                var i2 = e2[r2];
                if ("UNRESOLVABLE_REFERENCE" === i2.code) {
                  var n2 = i2.params[0];
                  -1 === t3.indexOf(n2) && t3.push(n2);
                }
                i2.inner && (t3 = t3.concat(this.getMissingReferences(i2.inner)));
              }
              return t3;
            }, t2.prototype.getMissingRemoteReferences = function() {
              for (var e2 = this.getMissingReferences(), t3 = [], r2 = e2.length; r2--; ) {
                var i2 = h.getRemotePath(e2[r2]);
                i2 && -1 === t3.indexOf(i2) && t3.push(i2);
              }
              return t3;
            }, t2.prototype.setRemoteReference = function(e2, t3, r2) {
              t3 = "string" == typeof t3 ? JSON.parse(t3) : _.cloneDeep(t3), r2 && (t3.__$validationOptions = o(r2)), h.cacheSchemaByUri.call(this, e2, t3);
            }, t2.prototype.getResolvedSchema = function(e2) {
              var t3 = new c(this.options);
              e2 = h.getSchema.call(this, t3, e2), e2 = _.cloneDeep(e2);
              var a2 = [], o2 = function(e3) {
                var t4, r2 = _.whatIs(e3);
                if (("object" === r2 || "array" === r2) && !e3.___$visited) {
                  if (e3.___$visited = true, a2.push(e3), e3.$ref && e3.__$refResolved) {
                    var i2 = e3.__$refResolved, n2 = e3;
                    for (t4 in delete e3.$ref, delete e3.__$refResolved, i2)
                      i2.hasOwnProperty(t4) && (n2[t4] = i2[t4]);
                  }
                  for (t4 in e3)
                    e3.hasOwnProperty(t4) && (0 === t4.indexOf("__$") ? delete e3[t4] : o2(e3[t4]));
                }
              };
              if (o2(e2), a2.forEach(function(e3) {
                delete e3.___$visited;
              }), (this.lastReport = t3).isValid())
                return e2;
              throw this.getLastError();
            }, t2.prototype.setSchemaReader = function(e2) {
              return t2.setSchemaReader(e2);
            }, t2.prototype.getSchemaReader = function() {
              return t2.schemaReader;
            }, t2.schemaReader = void 0, t2.setSchemaReader = function(e2) {
              t2.schemaReader = e2;
            }, t2.registerFormat = function(e2, t3) {
              r[e2] = t3;
            }, t2.unregisterFormat = function(e2) {
              delete r[e2];
            }, t2.getRegisteredFormats = function() {
              return Object.keys(r);
            }, t2.getDefaultOptions = function() {
              return _.cloneDeep(a);
            }, t2.schemaSymbol = _.schemaSymbol, t2.jsonSymbol = _.jsonSymbol, s.exports = t2;
          }).call(this);
        }).call(this, e("_process"));
      }, { "./FormatValidators": 106, "./JsonValidation": 107, "./Polyfills": 108, "./Report": 109, "./SchemaCache": 110, "./SchemaCompilation": 111, "./SchemaValidation": 112, "./Utils": 113, "./schemas/hyper-schema.json": 115, "./schemas/schema.json": 116, _process: 3, "lodash.get": 1 }], 115: [function(e, t, r) {
        t.exports = { $schema: "http://json-schema.org/draft-04/hyper-schema#", id: "http://json-schema.org/draft-04/hyper-schema#", title: "JSON Hyper-Schema", allOf: [{ $ref: "http://json-schema.org/draft-04/schema#" }], properties: { additionalItems: { anyOf: [{ type: "boolean" }, { $ref: "#" }] }, additionalProperties: { anyOf: [{ type: "boolean" }, { $ref: "#" }] }, dependencies: { additionalProperties: { anyOf: [{ $ref: "#" }, { type: "array" }] } }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }] }, definitions: { additionalProperties: { $ref: "#" } }, patternProperties: { additionalProperties: { $ref: "#" } }, properties: { additionalProperties: { $ref: "#" } }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" }, links: { type: "array", items: { $ref: "#/definitions/linkDescription" } }, fragmentResolution: { type: "string" }, media: { type: "object", properties: { type: { description: "A media type, as described in RFC 2046", type: "string" }, binaryEncoding: { description: "A content encoding scheme, as described in RFC 2045", type: "string" } } }, pathStart: { description: "Instances' URIs must start with this value for this schema to apply to them", type: "string", format: "uri" } }, definitions: { schemaArray: { type: "array", items: { $ref: "#" } }, linkDescription: { title: "Link Description Object", type: "object", required: ["href", "rel"], properties: { href: { description: "a URI template, as defined by RFC 6570, with the addition of the $, ( and ) characters for pre-processing", type: "string" }, rel: { description: "relation to the target resource of the link", type: "string" }, title: { description: "a title for the link", type: "string" }, targetSchema: { description: "JSON Schema describing the link target", $ref: "#" }, mediaType: { description: "media type (as defined by RFC 2046) describing the link target", type: "string" }, method: { description: 'method for requesting the target of the link (e.g. for HTTP this might be "GET" or "DELETE")', type: "string" }, encType: { description: "The media type in which to submit data along with the request", type: "string", default: "application/json" }, schema: { description: "Schema describing the data to submit along with the request", $ref: "#" } } } } };
      }, {}], 116: [function(e, t, r) {
        t.exports = { id: "http://json-schema.org/draft-04/schema#", $schema: "http://json-schema.org/draft-04/schema#", description: "Core schema meta-schema", definitions: { schemaArray: { type: "array", minItems: 1, items: { $ref: "#" } }, positiveInteger: { type: "integer", minimum: 0 }, positiveIntegerDefault0: { allOf: [{ $ref: "#/definitions/positiveInteger" }, { default: 0 }] }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, minItems: 1, uniqueItems: true } }, type: "object", properties: { id: { type: "string", format: "uri" }, $schema: { type: "string", format: "uri" }, title: { type: "string" }, description: { type: "string" }, default: {}, multipleOf: { type: "number", minimum: 0, exclusiveMinimum: true }, maximum: { type: "number" }, exclusiveMaximum: { type: "boolean", default: false }, minimum: { type: "number" }, exclusiveMinimum: { type: "boolean", default: false }, maxLength: { $ref: "#/definitions/positiveInteger" }, minLength: { $ref: "#/definitions/positiveIntegerDefault0" }, pattern: { type: "string", format: "regex" }, additionalItems: { anyOf: [{ type: "boolean" }, { $ref: "#" }], default: {} }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }], default: {} }, maxItems: { $ref: "#/definitions/positiveInteger" }, minItems: { $ref: "#/definitions/positiveIntegerDefault0" }, uniqueItems: { type: "boolean", default: false }, maxProperties: { $ref: "#/definitions/positiveInteger" }, minProperties: { $ref: "#/definitions/positiveIntegerDefault0" }, required: { $ref: "#/definitions/stringArray" }, additionalProperties: { anyOf: [{ type: "boolean" }, { $ref: "#" }], default: {} }, definitions: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, properties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, dependencies: { type: "object", additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] } }, enum: { type: "array", minItems: 1, uniqueItems: true }, type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, { type: "array", items: { $ref: "#/definitions/simpleTypes" }, minItems: 1, uniqueItems: true }] }, format: { type: "string" }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" } }, dependencies: { exclusiveMaximum: ["maximum"], exclusiveMinimum: ["minimum"] }, default: {} };
      }, {}] }, {}, [105, 106, 107, 108, 109, 110, 111, 112, 113, 114])(114);
    });
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/JsonSchema.js
var require_JsonSchema = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/JsonSchema.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.JsonSchema = void 0;
    var os = __importStar(require("os"));
    var path = __importStar(require("path"));
    var JsonFile_1 = require_JsonFile();
    var FileSystem_1 = require_FileSystem();
    var Validator = require_ZSchema_browser_min();
    var JsonSchema = class {
      constructor() {
        this._dependentSchemas = [];
        this._filename = "";
        this._validator = void 0;
        this._schemaObject = void 0;
      }
      static fromFile(filename, options) {
        if (!FileSystem_1.FileSystem.exists(filename)) {
          throw new Error("Schema file not found: " + filename);
        }
        const schema = new JsonSchema();
        schema._filename = filename;
        if (options) {
          schema._dependentSchemas = options.dependentSchemas || [];
        }
        return schema;
      }
      static fromLoadedObject(schemaObject) {
        const schema = new JsonSchema();
        schema._schemaObject = schemaObject;
        return schema;
      }
      static _collectDependentSchemas(collectedSchemas, dependentSchemas, seenObjects, seenIds) {
        for (const dependentSchema of dependentSchemas) {
          if (seenObjects.has(dependentSchema)) {
            continue;
          }
          seenObjects.add(dependentSchema);
          const schemaId = dependentSchema._ensureLoaded();
          if (schemaId === "") {
            throw new Error(`This schema ${dependentSchema.shortName} cannot be referenced because is missing the "id" field`);
          }
          if (seenIds.has(schemaId)) {
            throw new Error(`This schema ${dependentSchema.shortName} has the same "id" as another schema in this set`);
          }
          seenIds.add(schemaId);
          collectedSchemas.push(dependentSchema);
          JsonSchema._collectDependentSchemas(collectedSchemas, dependentSchema._dependentSchemas, seenObjects, seenIds);
        }
      }
      static _formatErrorDetails(errorDetails) {
        return JsonSchema._formatErrorDetailsHelper(errorDetails, "", "");
      }
      static _formatErrorDetailsHelper(errorDetails, indent, buffer) {
        for (const errorDetail of errorDetails) {
          buffer += os.EOL + indent + `Error: ${errorDetail.path}`;
          if (errorDetail.description) {
            const MAX_LENGTH = 40;
            let truncatedDescription = errorDetail.description.trim();
            if (truncatedDescription.length > MAX_LENGTH) {
              truncatedDescription = truncatedDescription.substr(0, MAX_LENGTH - 3) + "...";
            }
            buffer += ` (${truncatedDescription})`;
          }
          buffer += os.EOL + indent + `       ${errorDetail.message}`;
          if (errorDetail.inner) {
            buffer = JsonSchema._formatErrorDetailsHelper(errorDetail.inner, indent + "  ", buffer);
          }
        }
        return buffer;
      }
      get shortName() {
        if (!this._filename) {
          if (this._schemaObject) {
            const schemaWithId = this._schemaObject;
            if (schemaWithId.id) {
              return schemaWithId.id;
            }
          }
          return "(anonymous schema)";
        } else {
          return path.basename(this._filename);
        }
      }
      ensureCompiled() {
        this._ensureLoaded();
        if (!this._validator) {
          const newValidator = new Validator({
            breakOnFirstError: false,
            noTypeless: true,
            noExtraKeywords: true
          });
          const anythingSchema = {
            type: ["array", "boolean", "integer", "number", "object", "string"]
          };
          newValidator.setRemoteReference("http://json-schema.org/draft-04/schema", anythingSchema);
          const collectedSchemas = [];
          const seenObjects = /* @__PURE__ */ new Set();
          const seenIds = /* @__PURE__ */ new Set();
          JsonSchema._collectDependentSchemas(collectedSchemas, this._dependentSchemas, seenObjects, seenIds);
          for (const collectedSchema of collectedSchemas) {
            if (!newValidator.validateSchema(collectedSchema._schemaObject)) {
              throw new Error(`Failed to validate schema "${collectedSchema.shortName}":` + os.EOL + JsonSchema._formatErrorDetails(newValidator.getLastErrors()));
            }
          }
          this._validator = newValidator;
        }
      }
      validateObject(jsonObject, filenameForErrors, options) {
        this.validateObjectWithCallback(jsonObject, (errorInfo) => {
          const prefix = options && options.customErrorHeader ? options.customErrorHeader : "JSON validation failed:";
          throw new Error(prefix + os.EOL + filenameForErrors + os.EOL + errorInfo.details);
        });
      }
      validateObjectWithCallback(jsonObject, errorCallback) {
        this.ensureCompiled();
        if (!this._validator.validate(jsonObject, this._schemaObject)) {
          const errorDetails = JsonSchema._formatErrorDetails(this._validator.getLastErrors());
          const args = {
            details: errorDetails
          };
          errorCallback(args);
        }
      }
      _ensureLoaded() {
        if (!this._schemaObject) {
          this._schemaObject = JsonFile_1.JsonFile.load(this._filename);
        }
        return this._schemaObject.id || "";
      }
    };
    exports.JsonSchema = JsonSchema;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/FileWriter.js
var require_FileWriter = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/FileWriter.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileWriter = void 0;
    var Import_1 = require_Import();
    var fsx = Import_1.Import.lazy("fs-extra", require);
    var FileWriter = class {
      constructor(fileDescriptor, filePath) {
        this._fileDescriptor = fileDescriptor;
        this.filePath = filePath;
      }
      static open(filePath, flags) {
        return new FileWriter(fsx.openSync(filePath, FileWriter._convertFlagsForNode(flags)), filePath);
      }
      static _convertFlagsForNode(flags) {
        flags = Object.assign({ append: false, exclusive: false }, flags);
        return [flags.append ? "a" : "w", flags.exclusive ? "x" : ""].join("");
      }
      write(text) {
        if (!this._fileDescriptor) {
          throw new Error(`Cannot write to file, file descriptor has already been released.`);
        }
        fsx.writeSync(this._fileDescriptor, text);
      }
      close() {
        const fd = this._fileDescriptor;
        if (fd) {
          this._fileDescriptor = void 0;
          fsx.closeSync(fd);
        }
      }
    };
    exports.FileWriter = FileWriter;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/LockFile.js
var require_LockFile = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/LockFile.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LockFile = exports.getProcessStartTime = exports.getProcessStartTimeFromProcStat = void 0;
    var path = __importStar(require("path"));
    var child_process = __importStar(require("child_process"));
    var FileSystem_1 = require_FileSystem();
    var FileWriter_1 = require_FileWriter();
    var Async_1 = require_Async();
    var procStatStartTimePos = 22;
    function getProcessStartTimeFromProcStat(stat) {
      let values = stat.trimRight().split(" ");
      let i = values.length - 1;
      while (i >= 0 && values[i].charAt(values[i].length - 1) !== ")") {
        i -= 1;
      }
      if (i < 1) {
        return void 0;
      }
      const value2 = values.slice(1, i + 1).join(" ");
      values = [values[0], value2].concat(values.slice(i + 1));
      if (values.length < procStatStartTimePos) {
        return void 0;
      }
      const startTimeJiffies = values[procStatStartTimePos - 1];
      return startTimeJiffies;
    }
    exports.getProcessStartTimeFromProcStat = getProcessStartTimeFromProcStat;
    function getProcessStartTime(pid) {
      const pidString = pid.toString();
      if (pid < 0 || pidString.indexOf("e") >= 0 || pidString.indexOf("E") >= 0) {
        throw new Error(`"pid" is negative or too large`);
      }
      let args;
      if (process.platform === "darwin") {
        args = [`-p ${pidString}`, "-o lstart"];
      } else if (process.platform === "linux") {
        args = ["-p", pidString, "-o", "lstart"];
      } else {
        throw new Error(`Unsupported system: ${process.platform}`);
      }
      const psResult = child_process.spawnSync("ps", args, {
        encoding: "utf8"
      });
      const psStdout = psResult.stdout;
      if (psResult.status !== 0 && !psStdout && process.platform === "linux") {
        let stat;
        try {
          stat = FileSystem_1.FileSystem.readFile(`/proc/${pidString}/stat`);
        } catch (error) {
          if (error.code !== "ENOENT") {
            throw error;
          }
          return void 0;
        }
        if (stat !== void 0) {
          const startTimeJiffies = getProcessStartTimeFromProcStat(stat);
          if (startTimeJiffies === void 0) {
            throw new Error(`Could not retrieve the start time of process ${pidString} from the OS because the contents of /proc/${pidString}/stat have an unexpected format`);
          }
          return startTimeJiffies;
        }
      }
      if (!psStdout) {
        throw new Error(`Unexpected output from "ps" command`);
      }
      const psSplit = psStdout.split("\n");
      if (psSplit[1] === "") {
        return void 0;
      }
      if (psSplit[1]) {
        const trimmed = psSplit[1].trim();
        if (trimmed.length > 10) {
          return trimmed;
        }
      }
      throw new Error(`Unexpected output from the "ps" command`);
    }
    exports.getProcessStartTime = getProcessStartTime;
    var LockFile = class {
      constructor(fileWriter, filePath, dirtyWhenAcquired) {
        this._fileWriter = fileWriter;
        this._filePath = filePath;
        this._dirtyWhenAcquired = dirtyWhenAcquired;
      }
      static getLockFilePath(resourceFolder, resourceName, pid = process.pid) {
        if (!resourceName.match(/^[a-zA-Z0-9][a-zA-Z0-9-.]+[a-zA-Z0-9]$/)) {
          throw new Error(`The resource name "${resourceName}" is invalid. It must be an alphanumberic string with only "-" or "." It must start with an alphanumeric character.`);
        }
        if (process.platform === "win32") {
          return path.join(path.resolve(resourceFolder), `${resourceName}.lock`);
        } else if (process.platform === "linux" || process.platform === "darwin") {
          return path.join(path.resolve(resourceFolder), `${resourceName}#${pid}.lock`);
        }
        throw new Error(`File locking not implemented for platform: "${process.platform}"`);
      }
      static tryAcquire(resourceFolder, resourceName) {
        FileSystem_1.FileSystem.ensureFolder(resourceFolder);
        if (process.platform === "win32") {
          return LockFile._tryAcquireWindows(resourceFolder, resourceName);
        } else if (process.platform === "linux" || process.platform === "darwin") {
          return LockFile._tryAcquireMacOrLinux(resourceFolder, resourceName);
        }
        throw new Error(`File locking not implemented for platform: "${process.platform}"`);
      }
      static acquire(resourceFolder, resourceName, maxWaitMs) {
        const interval = 100;
        const startTime = Date.now();
        const retryLoop = async () => {
          const lock = LockFile.tryAcquire(resourceFolder, resourceName);
          if (lock) {
            return lock;
          }
          if (maxWaitMs && Date.now() > startTime + maxWaitMs) {
            throw new Error(`Exceeded maximum wait time to acquire lock for resource "${resourceName}"`);
          }
          await Async_1.Async.sleep(interval);
          return retryLoop();
        };
        return retryLoop();
      }
      static _tryAcquireMacOrLinux(resourceFolder, resourceName) {
        let dirtyWhenAcquired = false;
        const pid = process.pid;
        const startTime = LockFile._getStartTime(pid);
        if (!startTime) {
          throw new Error(`Unable to calculate start time for current process.`);
        }
        const pidLockFilePath = LockFile.getLockFilePath(resourceFolder, resourceName);
        let lockFileHandle;
        let lockFile;
        try {
          lockFileHandle = FileWriter_1.FileWriter.open(pidLockFilePath);
          lockFileHandle.write(startTime);
          const currentBirthTimeMs = FileSystem_1.FileSystem.getStatistics(pidLockFilePath).birthtime.getTime();
          let smallestBirthTimeMs = currentBirthTimeMs;
          let smallestBirthTimePid = pid.toString();
          const files = FileSystem_1.FileSystem.readFolderItemNames(resourceFolder);
          const lockFileRegExp = /^(.+)#([0-9]+)\.lock$/;
          let match;
          let otherPid;
          for (const fileInFolder of files) {
            if ((match = fileInFolder.match(lockFileRegExp)) && match[1] === resourceName && (otherPid = match[2]) !== pid.toString()) {
              const fileInFolderPath = path.join(resourceFolder, fileInFolder);
              dirtyWhenAcquired = true;
              const otherPidCurrentStartTime = LockFile._getStartTime(parseInt(otherPid, 10));
              let otherPidOldStartTime;
              let otherBirthtimeMs;
              try {
                otherPidOldStartTime = FileSystem_1.FileSystem.readFile(fileInFolderPath);
                otherBirthtimeMs = FileSystem_1.FileSystem.getStatistics(fileInFolderPath).birthtime.getTime();
              } catch (err) {
              }
              if (otherPidOldStartTime === "" && otherBirthtimeMs !== void 0) {
                if (otherBirthtimeMs > currentBirthTimeMs) {
                  continue;
                } else if (otherBirthtimeMs - currentBirthTimeMs < 0 && otherBirthtimeMs - currentBirthTimeMs > -1e3) {
                  return void 0;
                }
              }
              if (!otherPidCurrentStartTime || otherPidOldStartTime !== otherPidCurrentStartTime) {
                FileSystem_1.FileSystem.deleteFile(fileInFolderPath);
                continue;
              }
              if (otherBirthtimeMs !== void 0) {
                if (otherBirthtimeMs < smallestBirthTimeMs || otherBirthtimeMs === smallestBirthTimeMs && otherPid < smallestBirthTimePid) {
                  smallestBirthTimeMs = otherBirthtimeMs;
                  smallestBirthTimePid = otherPid;
                }
              }
            }
          }
          if (smallestBirthTimePid !== pid.toString()) {
            return void 0;
          }
          lockFile = new LockFile(lockFileHandle, pidLockFilePath, dirtyWhenAcquired);
          lockFileHandle = void 0;
        } finally {
          if (lockFileHandle) {
            lockFileHandle.close();
            FileSystem_1.FileSystem.deleteFile(pidLockFilePath);
          }
        }
        return lockFile;
      }
      static _tryAcquireWindows(resourceFolder, resourceName) {
        const lockFilePath = LockFile.getLockFilePath(resourceFolder, resourceName);
        let dirtyWhenAcquired = false;
        let fileHandle;
        let lockFile;
        try {
          if (FileSystem_1.FileSystem.exists(lockFilePath)) {
            dirtyWhenAcquired = true;
            FileSystem_1.FileSystem.deleteFile(lockFilePath);
          }
          try {
            fileHandle = FileWriter_1.FileWriter.open(lockFilePath, { exclusive: true });
          } catch (error) {
            return void 0;
          }
          lockFile = new LockFile(fileHandle, lockFilePath, dirtyWhenAcquired);
          fileHandle = void 0;
        } finally {
          if (fileHandle) {
            fileHandle.close();
          }
        }
        return lockFile;
      }
      release(deleteFile = true) {
        if (this.isReleased) {
          throw new Error(`The lock for file "${path.basename(this._filePath)}" has already been released.`);
        }
        this._fileWriter.close();
        if (deleteFile) {
          FileSystem_1.FileSystem.deleteFile(this._filePath);
        }
        this._fileWriter = void 0;
      }
      get dirtyWhenAcquired() {
        return this._dirtyWhenAcquired;
      }
      get filePath() {
        return this._filePath;
      }
      get isReleased() {
        return this._fileWriter === void 0;
      }
    };
    exports.LockFile = LockFile;
    LockFile._getStartTime = getProcessStartTime;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/MapExtensions.js
var require_MapExtensions = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/MapExtensions.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MapExtensions = void 0;
    var MapExtensions = class {
      static mergeFromMap(targetMap, sourceMap) {
        for (const pair of sourceMap.entries()) {
          targetMap.set(pair[0], pair[1]);
        }
      }
      static toObject(map) {
        const object = {};
        for (const [key, value] of map.entries()) {
          object[key] = value;
        }
        return object;
      }
    };
    exports.MapExtensions = MapExtensions;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/ProtectableMapView.js
var require_ProtectableMapView = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/ProtectableMapView.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProtectableMapView = void 0;
    var ProtectableMapView = class extends Map {
      constructor(owner, parameters) {
        super();
        this._owner = owner;
        this._parameters = parameters;
      }
      clear() {
        if (this._parameters.onClear) {
          this._parameters.onClear(this._owner);
        }
        super.clear();
      }
      delete(key) {
        if (this._parameters.onDelete) {
          this._parameters.onDelete(this._owner, key);
        }
        return super.delete(key);
      }
      set(key, value) {
        let modifiedValue = value;
        if (this._parameters.onSet) {
          modifiedValue = this._parameters.onSet(this._owner, key, modifiedValue);
        }
        super.set(key, modifiedValue);
        return this;
      }
      _clearUnprotected() {
        super.clear();
      }
      _deleteUnprotected(key) {
        return super.delete(key);
      }
      _setUnprotected(key, value) {
        super.set(key, value);
      }
    };
    exports.ProtectableMapView = ProtectableMapView;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/ProtectableMap.js
var require_ProtectableMap = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/ProtectableMap.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProtectableMap = void 0;
    var ProtectableMapView_1 = require_ProtectableMapView();
    var ProtectableMap = class {
      constructor(parameters) {
        this._protectedView = new ProtectableMapView_1.ProtectableMapView(this, parameters);
      }
      get protectedView() {
        return this._protectedView;
      }
      clear() {
        this._protectedView._clearUnprotected();
      }
      delete(key) {
        return this._protectedView._deleteUnprotected(key);
      }
      set(key, value) {
        this._protectedView._setUnprotected(key, value);
        return this;
      }
      forEach(callbackfn, thisArg) {
        this._protectedView.forEach(callbackfn);
      }
      get(key) {
        return this._protectedView.get(key);
      }
      has(key) {
        return this._protectedView.has(key);
      }
      get size() {
        return this._protectedView.size;
      }
    };
    exports.ProtectableMap = ProtectableMap;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Sort.js
var require_Sort = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Sort.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Sort = void 0;
    var Sort = class {
      static compareByValue(x, y) {
        if (x === y) {
          return 0;
        }
        if (x === void 0) {
          return -1;
        }
        if (y === void 0) {
          return 1;
        }
        if (x === null) {
          return -1;
        }
        if (y === null) {
          return 1;
        }
        if (x < y) {
          return -1;
        }
        if (x > y) {
          return 1;
        }
        return 0;
      }
      static sortBy(array, keySelector, comparer = Sort.compareByValue) {
        array.sort((x, y) => comparer(keySelector(x), keySelector(y)));
      }
      static isSorted(collection, comparer = Sort.compareByValue) {
        let isFirst = true;
        let previous = void 0;
        for (const element of collection) {
          if (isFirst) {
            isFirst = false;
          } else if (comparer(previous, element) > 0) {
            return false;
          }
          previous = element;
        }
        return true;
      }
      static isSortedBy(collection, keySelector, comparer = Sort.compareByValue) {
        let isFirst = true;
        let previousKey = void 0;
        for (const element of collection) {
          const key = keySelector(element);
          if (isFirst) {
            isFirst = false;
          } else if (comparer(previousKey, key) > 0) {
            return false;
          }
          previousKey = key;
        }
        return true;
      }
      static sortMapKeys(map, keyComparer = Sort.compareByValue) {
        if (Sort.isSorted(map.keys(), keyComparer)) {
          return;
        }
        const pairs = Array.from(map.entries());
        Sort.sortBy(pairs, (x) => x[0], keyComparer);
        map.clear();
        for (const pair of pairs) {
          map.set(pair[0], pair[1]);
        }
      }
      static sortSetBy(set, keySelector, keyComparer = Sort.compareByValue) {
        if (Sort.isSortedBy(set, keySelector, keyComparer)) {
          return;
        }
        const array = Array.from(set);
        array.sort((x, y) => keyComparer(keySelector(x), keySelector(y)));
        set.clear();
        for (const item of array) {
          set.add(item);
        }
      }
      static sortSet(set, comparer = Sort.compareByValue) {
        if (Sort.isSorted(set, comparer)) {
          return;
        }
        const array = Array.from(set);
        array.sort((x, y) => comparer(x, y));
        set.clear();
        for (const item of array) {
          set.add(item);
        }
      }
    };
    exports.Sort = Sort;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/StringBuilder.js
var require_StringBuilder = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/StringBuilder.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StringBuilder = void 0;
    var StringBuilder = class {
      constructor() {
        this._chunks = [];
      }
      append(text) {
        this._chunks.push(text);
      }
      toString() {
        if (this._chunks.length === 0) {
          return "";
        }
        if (this._chunks.length > 1) {
          const joined = this._chunks.join("");
          this._chunks.length = 1;
          this._chunks[0] = joined;
        }
        return this._chunks[0];
      }
    };
    exports.StringBuilder = StringBuilder;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/SubprocessTerminator.js
var require_SubprocessTerminator = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/SubprocessTerminator.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SubprocessTerminator = void 0;
    var process_1 = __importDefault(require("process"));
    var Executable_1 = require_Executable();
    var SubprocessTerminator = class {
      static killProcessTreeOnExit(subprocess, subprocessOptions) {
        if (typeof subprocess.exitCode === "number") {
          return;
        }
        SubprocessTerminator._validateSubprocessOptions(subprocessOptions);
        SubprocessTerminator._ensureInitialized();
        const pid = subprocess.pid;
        subprocess.on("close", (code, signal) => {
          if (SubprocessTerminator._subprocessesByPid.has(pid)) {
            SubprocessTerminator._logDebug(`untracking #${pid}`);
            SubprocessTerminator._subprocessesByPid.delete(pid);
          }
        });
        SubprocessTerminator._subprocessesByPid.set(pid, {
          subprocess,
          subprocessOptions
        });
        SubprocessTerminator._logDebug(`tracking #${pid}`);
      }
      static killProcessTree(subprocess, subprocessOptions) {
        const pid = subprocess.pid;
        if (SubprocessTerminator._subprocessesByPid.has(pid)) {
          SubprocessTerminator._logDebug(`untracking #${pid} via killProcessTree()`);
          this._subprocessesByPid.delete(subprocess.pid);
        }
        SubprocessTerminator._validateSubprocessOptions(subprocessOptions);
        if (typeof subprocess.exitCode === "number") {
          return;
        }
        SubprocessTerminator._logDebug(`terminating #${subprocess.pid}`);
        if (SubprocessTerminator._isWindows) {
          const result = Executable_1.Executable.spawnSync("TaskKill.exe", [
            "/T",
            "/F",
            "/PID",
            subprocess.pid.toString()
          ]);
          if (result.status) {
            const output = result.output.join("\n");
            if (output.indexOf("not found") >= 0) {
            } else {
              throw new Error(`TaskKill.exe returned exit code ${result.status}:
` + output + "\n");
            }
          }
        } else {
          process_1.default.kill(-subprocess.pid, "SIGKILL");
        }
      }
      static _ensureInitialized() {
        if (!SubprocessTerminator._initialized) {
          SubprocessTerminator._initialized = true;
          SubprocessTerminator._logDebug("initialize");
          process_1.default.prependListener("SIGTERM", SubprocessTerminator._onTerminateSignal);
          process_1.default.prependListener("SIGINT", SubprocessTerminator._onTerminateSignal);
          process_1.default.prependListener("exit", SubprocessTerminator._onExit);
        }
      }
      static _cleanupChildProcesses() {
        if (SubprocessTerminator._initialized) {
          SubprocessTerminator._initialized = false;
          process_1.default.removeListener("SIGTERM", SubprocessTerminator._onTerminateSignal);
          process_1.default.removeListener("SIGINT", SubprocessTerminator._onTerminateSignal);
          const trackedSubprocesses = Array.from(SubprocessTerminator._subprocessesByPid.values());
          let firstError = void 0;
          for (const trackedSubprocess of trackedSubprocesses) {
            try {
              SubprocessTerminator.killProcessTree(trackedSubprocess.subprocess, { detached: true });
            } catch (error) {
              if (firstError === void 0) {
                firstError = error;
              }
            }
          }
          if (firstError !== void 0) {
            console.error("\nAn unexpected error was encountered while attempting to clean up child processes:");
            console.error(firstError.toString());
            if (!process_1.default.exitCode) {
              process_1.default.exitCode = 1;
            }
          }
        }
      }
      static _validateSubprocessOptions(subprocessOptions) {
        if (!SubprocessTerminator._isWindows) {
          if (!subprocessOptions.detached) {
            throw new Error("killProcessTree() requires detached=true on this operating system");
          }
        }
      }
      static _onExit(exitCode) {
        SubprocessTerminator._logDebug(`received exit(${exitCode})`);
        SubprocessTerminator._cleanupChildProcesses();
        SubprocessTerminator._logDebug(`finished exit()`);
      }
      static _onTerminateSignal(signal) {
        SubprocessTerminator._logDebug(`received signal ${signal}`);
        SubprocessTerminator._cleanupChildProcesses();
        SubprocessTerminator._logDebug(`relaying ${signal}`);
        process_1.default.kill(process_1.default.pid, signal);
      }
      static _logDebug(message) {
      }
    };
    exports.SubprocessTerminator = SubprocessTerminator;
    SubprocessTerminator._initialized = false;
    SubprocessTerminator._subprocessesByPid = /* @__PURE__ */ new Map();
    SubprocessTerminator._isWindows = process_1.default.platform === "win32";
    SubprocessTerminator.RECOMMENDED_OPTIONS = {
      detached: process_1.default.platform !== "win32"
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Terminal/ITerminalProvider.js
var require_ITerminalProvider = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Terminal/ITerminalProvider.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalProviderSeverity = void 0;
    var TerminalProviderSeverity;
    (function(TerminalProviderSeverity2) {
      TerminalProviderSeverity2[TerminalProviderSeverity2["log"] = 0] = "log";
      TerminalProviderSeverity2[TerminalProviderSeverity2["warning"] = 1] = "warning";
      TerminalProviderSeverity2[TerminalProviderSeverity2["error"] = 2] = "error";
      TerminalProviderSeverity2[TerminalProviderSeverity2["verbose"] = 3] = "verbose";
      TerminalProviderSeverity2[TerminalProviderSeverity2["debug"] = 4] = "debug";
    })(TerminalProviderSeverity = exports.TerminalProviderSeverity || (exports.TerminalProviderSeverity = {}));
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Terminal/Terminal.js
var require_Terminal = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Terminal/Terminal.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Terminal = void 0;
    var ITerminalProvider_1 = require_ITerminalProvider();
    var Colors_1 = require_Colors();
    var Terminal2 = class {
      constructor(provider) {
        this._providers = /* @__PURE__ */ new Set();
        this._providers.add(provider);
      }
      registerProvider(provider) {
        this._providers.add(provider);
      }
      unregisterProvider(provider) {
        if (this._providers.has(provider)) {
          this._providers.delete(provider);
        }
      }
      write(...messageParts) {
        this._writeSegmentsToProviders(messageParts, ITerminalProvider_1.TerminalProviderSeverity.log);
      }
      writeLine(...messageParts) {
        this.write(...messageParts, Colors_1.eolSequence);
      }
      writeWarning(...messageParts) {
        this._writeSegmentsToProviders(messageParts.map((part) => Object.assign(Object.assign({}, Colors_1.Colors._normalizeStringOrColorableSequence(part)), { foregroundColor: Colors_1.ColorValue.Yellow })), ITerminalProvider_1.TerminalProviderSeverity.warning);
      }
      writeWarningLine(...messageParts) {
        this._writeSegmentsToProviders([
          ...messageParts.map((part) => Object.assign(Object.assign({}, Colors_1.Colors._normalizeStringOrColorableSequence(part)), { foregroundColor: Colors_1.ColorValue.Yellow })),
          Colors_1.eolSequence
        ], ITerminalProvider_1.TerminalProviderSeverity.warning);
      }
      writeError(...messageParts) {
        this._writeSegmentsToProviders(messageParts.map((part) => Object.assign(Object.assign({}, Colors_1.Colors._normalizeStringOrColorableSequence(part)), { foregroundColor: Colors_1.ColorValue.Red })), ITerminalProvider_1.TerminalProviderSeverity.error);
      }
      writeErrorLine(...messageParts) {
        this._writeSegmentsToProviders([
          ...messageParts.map((part) => Object.assign(Object.assign({}, Colors_1.Colors._normalizeStringOrColorableSequence(part)), { foregroundColor: Colors_1.ColorValue.Red })),
          Colors_1.eolSequence
        ], ITerminalProvider_1.TerminalProviderSeverity.error);
      }
      writeVerbose(...messageParts) {
        this._writeSegmentsToProviders(messageParts, ITerminalProvider_1.TerminalProviderSeverity.verbose);
      }
      writeVerboseLine(...messageParts) {
        this.writeVerbose(...messageParts, Colors_1.eolSequence);
      }
      writeDebug(...messageParts) {
        this._writeSegmentsToProviders(messageParts, ITerminalProvider_1.TerminalProviderSeverity.debug);
      }
      writeDebugLine(...messageParts) {
        this.writeDebug(...messageParts, Colors_1.eolSequence);
      }
      _writeSegmentsToProviders(segments, severity) {
        const withColorText = {};
        const withoutColorText = {};
        let withColorLines;
        let withoutColorLines;
        this._providers.forEach((provider) => {
          const eol = provider.eolCharacter;
          let textToWrite;
          if (provider.supportsColor) {
            if (!withColorLines) {
              withColorLines = this._serializeFormattableTextSegments(segments, true);
            }
            if (!withColorText[eol]) {
              withColorText[eol] = withColorLines.join(eol);
            }
            textToWrite = withColorText[eol];
          } else {
            if (!withoutColorLines) {
              withoutColorLines = this._serializeFormattableTextSegments(segments, false);
            }
            if (!withoutColorText[eol]) {
              withoutColorText[eol] = withoutColorLines.join(eol);
            }
            textToWrite = withoutColorText[eol];
          }
          provider.write(textToWrite, severity);
        });
      }
      _serializeFormattableTextSegments(segments, withColor) {
        const lines = [];
        let segmentsToJoin = [];
        let lastSegmentWasEol = false;
        for (let i = 0; i < segments.length; i++) {
          const segment = Colors_1.Colors._normalizeStringOrColorableSequence(segments[i]);
          lastSegmentWasEol = !!segment.isEol;
          if (lastSegmentWasEol) {
            lines.push(segmentsToJoin.join(""));
            segmentsToJoin = [];
          } else {
            if (withColor) {
              const startColorCodes = [];
              const endColorCodes = [];
              switch (segment.foregroundColor) {
                case Colors_1.ColorValue.Black: {
                  startColorCodes.push(Colors_1.ConsoleColorCodes.BlackForeground);
                  endColorCodes.push(Colors_1.ConsoleColorCodes.DefaultForeground);
                  break;
                }
                case Colors_1.ColorValue.Red: {
                  startColorCodes.push(Colors_1.ConsoleColorCodes.RedForeground);
                  endColorCodes.push(Colors_1.ConsoleColorCodes.DefaultForeground);
                  break;
                }
                case Colors_1.ColorValue.Green: {
                  startColorCodes.push(Colors_1.ConsoleColorCodes.GreenForeground);
                  endColorCodes.push(Colors_1.ConsoleColorCodes.DefaultForeground);
                  break;
                }
                case Colors_1.ColorValue.Yellow: {
                  startColorCodes.push(Colors_1.ConsoleColorCodes.YellowForeground);
                  endColorCodes.push(Colors_1.ConsoleColorCodes.DefaultForeground);
                  break;
                }
                case Colors_1.ColorValue.Blue: {
                  startColorCodes.push(Colors_1.ConsoleColorCodes.BlueForeground);
                  endColorCodes.push(Colors_1.ConsoleColorCodes.DefaultForeground);
                  break;
                }
                case Colors_1.ColorValue.Magenta: {
                  startColorCodes.push(Colors_1.ConsoleColorCodes.MagentaForeground);
                  endColorCodes.push(Colors_1.ConsoleColorCodes.DefaultForeground);
                  break;
                }
                case Colors_1.ColorValue.Cyan: {
                  startColorCodes.push(Colors_1.ConsoleColorCodes.CyanForeground);
                  endColorCodes.push(Colors_1.ConsoleColorCodes.DefaultForeground);
                  break;
                }
                case Colors_1.ColorValue.White: {
                  startColorCodes.push(Colors_1.ConsoleColorCodes.WhiteForeground);
                  endColorCodes.push(Colors_1.ConsoleColorCodes.DefaultForeground);
                  break;
                }
                case Colors_1.ColorValue.Gray: {
                  startColorCodes.push(Colors_1.ConsoleColorCodes.GrayForeground);
                  endColorCodes.push(Colors_1.ConsoleColorCodes.DefaultForeground);
                  break;
                }
              }
              switch (segment.backgroundColor) {
                case Colors_1.ColorValue.Black: {
                  startColorCodes.push(Colors_1.ConsoleColorCodes.BlackBackground);
                  endColorCodes.push(Colors_1.ConsoleColorCodes.DefaultBackground);
                  break;
                }
                case Colors_1.ColorValue.Red: {
                  startColorCodes.push(Colors_1.ConsoleColorCodes.RedBackground);
                  endColorCodes.push(Colors_1.ConsoleColorCodes.DefaultBackground);
                  break;
                }
                case Colors_1.ColorValue.Green: {
                  startColorCodes.push(Colors_1.ConsoleColorCodes.GreenBackground);
                  endColorCodes.push(Colors_1.ConsoleColorCodes.DefaultBackground);
                  break;
                }
                case Colors_1.ColorValue.Yellow: {
                  startColorCodes.push(Colors_1.ConsoleColorCodes.YellowBackground);
                  endColorCodes.push(Colors_1.ConsoleColorCodes.DefaultBackground);
                  break;
                }
                case Colors_1.ColorValue.Blue: {
                  startColorCodes.push(Colors_1.ConsoleColorCodes.BlueBackground);
                  endColorCodes.push(Colors_1.ConsoleColorCodes.DefaultBackground);
                  break;
                }
                case Colors_1.ColorValue.Magenta: {
                  startColorCodes.push(Colors_1.ConsoleColorCodes.MagentaBackground);
                  endColorCodes.push(Colors_1.ConsoleColorCodes.DefaultBackground);
                  break;
                }
                case Colors_1.ColorValue.Cyan: {
                  startColorCodes.push(Colors_1.ConsoleColorCodes.CyanBackground);
                  endColorCodes.push(Colors_1.ConsoleColorCodes.DefaultBackground);
                  break;
                }
                case Colors_1.ColorValue.White: {
                  startColorCodes.push(Colors_1.ConsoleColorCodes.WhiteBackground);
                  endColorCodes.push(Colors_1.ConsoleColorCodes.DefaultBackground);
                  break;
                }
                case Colors_1.ColorValue.Gray: {
                  startColorCodes.push(Colors_1.ConsoleColorCodes.GrayBackground);
                  endColorCodes.push(49);
                  break;
                }
              }
              if (segment.textAttributes) {
                for (const textAttribute of segment.textAttributes) {
                  switch (textAttribute) {
                    case Colors_1.TextAttribute.Bold: {
                      startColorCodes.push(Colors_1.ConsoleColorCodes.Bold);
                      endColorCodes.push(Colors_1.ConsoleColorCodes.NormalColorOrIntensity);
                      break;
                    }
                    case Colors_1.TextAttribute.Dim: {
                      startColorCodes.push(Colors_1.ConsoleColorCodes.Dim);
                      endColorCodes.push(Colors_1.ConsoleColorCodes.NormalColorOrIntensity);
                      break;
                    }
                    case Colors_1.TextAttribute.Underline: {
                      startColorCodes.push(Colors_1.ConsoleColorCodes.Underline);
                      endColorCodes.push(Colors_1.ConsoleColorCodes.UnderlineOff);
                      break;
                    }
                    case Colors_1.TextAttribute.Blink: {
                      startColorCodes.push(Colors_1.ConsoleColorCodes.Blink);
                      endColorCodes.push(Colors_1.ConsoleColorCodes.BlinkOff);
                      break;
                    }
                    case Colors_1.TextAttribute.InvertColor: {
                      startColorCodes.push(Colors_1.ConsoleColorCodes.InvertColor);
                      endColorCodes.push(Colors_1.ConsoleColorCodes.InvertColorOff);
                      break;
                    }
                    case Colors_1.TextAttribute.Hidden: {
                      startColorCodes.push(Colors_1.ConsoleColorCodes.Hidden);
                      endColorCodes.push(Colors_1.ConsoleColorCodes.HiddenOff);
                      break;
                    }
                  }
                }
              }
              for (let j = 0; j < startColorCodes.length; j++) {
                const code = startColorCodes[j];
                segmentsToJoin.push(...["\x1B[", code.toString(), "m"]);
              }
              segmentsToJoin.push(segment.text);
              for (let j = endColorCodes.length - 1; j >= 0; j--) {
                const code = endColorCodes[j];
                segmentsToJoin.push(...["\x1B[", code.toString(), "m"]);
              }
            } else {
              segmentsToJoin.push(segment.text);
            }
          }
        }
        if (segmentsToJoin.length > 0) {
          lines.push(segmentsToJoin.join(""));
        }
        if (lastSegmentWasEol) {
          lines.push("");
        }
        return lines;
      }
    };
    exports.Terminal = Terminal2;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/colors@1.2.5/node_modules/colors/lib/styles.js
var require_styles = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/colors@1.2.5/node_modules/colors/lib/styles.js"(exports, module2) {
    var styles = {};
    module2["exports"] = styles;
    var codes = {
      reset: [0, 0],
      bold: [1, 22],
      dim: [2, 22],
      italic: [3, 23],
      underline: [4, 24],
      inverse: [7, 27],
      hidden: [8, 28],
      strikethrough: [9, 29],
      black: [30, 39],
      red: [31, 39],
      green: [32, 39],
      yellow: [33, 39],
      blue: [34, 39],
      magenta: [35, 39],
      cyan: [36, 39],
      white: [37, 39],
      gray: [90, 39],
      grey: [90, 39],
      bgBlack: [40, 49],
      bgRed: [41, 49],
      bgGreen: [42, 49],
      bgYellow: [43, 49],
      bgBlue: [44, 49],
      bgMagenta: [45, 49],
      bgCyan: [46, 49],
      bgWhite: [47, 49],
      blackBG: [40, 49],
      redBG: [41, 49],
      greenBG: [42, 49],
      yellowBG: [43, 49],
      blueBG: [44, 49],
      magentaBG: [45, 49],
      cyanBG: [46, 49],
      whiteBG: [47, 49]
    };
    Object.keys(codes).forEach(function(key) {
      var val = codes[key];
      var style = styles[key] = [];
      style.open = "\x1B[" + val[0] + "m";
      style.close = "\x1B[" + val[1] + "m";
    });
  }
});

// ../../../common/temp/default/node_modules/.pnpm/colors@1.2.5/node_modules/colors/lib/system/has-flag.js
var require_has_flag = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/colors@1.2.5/node_modules/colors/lib/system/has-flag.js"(exports, module2) {
    "use strict";
    module2.exports = function(flag, argv) {
      argv = argv || process.argv;
      var terminatorPos = argv.indexOf("--");
      var prefix = /^-{1,2}/.test(flag) ? "" : "--";
      var pos = argv.indexOf(prefix + flag);
      return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/colors@1.2.5/node_modules/colors/lib/system/supports-colors.js
var require_supports_colors = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/colors@1.2.5/node_modules/colors/lib/system/supports-colors.js"(exports, module2) {
    "use strict";
    var os = require("os");
    var hasFlag = require_has_flag();
    var env = process.env;
    var forceColor = void 0;
    if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false")) {
      forceColor = false;
    } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
      forceColor = true;
    }
    if ("FORCE_COLOR" in env) {
      forceColor = env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0;
    }
    function translateLevel(level) {
      if (level === 0) {
        return false;
      }
      return {
        level,
        hasBasic: true,
        has256: level >= 2,
        has16m: level >= 3
      };
    }
    function supportsColor(stream) {
      if (forceColor === false) {
        return 0;
      }
      if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
        return 3;
      }
      if (hasFlag("color=256")) {
        return 2;
      }
      if (stream && !stream.isTTY && forceColor !== true) {
        return 0;
      }
      var min = forceColor ? 1 : 0;
      if (process.platform === "win32") {
        var osRelease = os.release().split(".");
        if (Number(process.versions.node.split(".")[0]) >= 8 && Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
          return Number(osRelease[2]) >= 14931 ? 3 : 2;
        }
        return 1;
      }
      if ("CI" in env) {
        if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI"].some(function(sign) {
          return sign in env;
        }) || env.CI_NAME === "codeship") {
          return 1;
        }
        return min;
      }
      if ("TEAMCITY_VERSION" in env) {
        return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
      }
      if ("TERM_PROGRAM" in env) {
        var version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
        switch (env.TERM_PROGRAM) {
          case "iTerm.app":
            return version >= 3 ? 3 : 2;
          case "Hyper":
            return 3;
          case "Apple_Terminal":
            return 2;
        }
      }
      if (/-256(color)?$/i.test(env.TERM)) {
        return 2;
      }
      if (/^screen|^xterm|^vt100|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
        return 1;
      }
      if ("COLORTERM" in env) {
        return 1;
      }
      if (env.TERM === "dumb") {
        return min;
      }
      return min;
    }
    function getSupportLevel(stream) {
      var level = supportsColor(stream);
      return translateLevel(level);
    }
    module2.exports = {
      supportsColor: getSupportLevel,
      stdout: getSupportLevel(process.stdout),
      stderr: getSupportLevel(process.stderr)
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/colors@1.2.5/node_modules/colors/lib/custom/trap.js
var require_trap = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/colors@1.2.5/node_modules/colors/lib/custom/trap.js"(exports, module2) {
    module2["exports"] = function runTheTrap(text, options) {
      var result = "";
      text = text || "Run the trap, drop the bass";
      text = text.split("");
      var trap = {
        a: ["@", "\u0104", "\u023A", "\u0245", "\u0394", "\u039B", "\u0414"],
        b: ["\xDF", "\u0181", "\u0243", "\u026E", "\u03B2", "\u0E3F"],
        c: ["\xA9", "\u023B", "\u03FE"],
        d: ["\xD0", "\u018A", "\u0500", "\u0501", "\u0502", "\u0503"],
        e: [
          "\xCB",
          "\u0115",
          "\u018E",
          "\u0258",
          "\u03A3",
          "\u03BE",
          "\u04BC",
          "\u0A6C"
        ],
        f: ["\u04FA"],
        g: ["\u0262"],
        h: ["\u0126", "\u0195", "\u04A2", "\u04BA", "\u04C7", "\u050A"],
        i: ["\u0F0F"],
        j: ["\u0134"],
        k: ["\u0138", "\u04A0", "\u04C3", "\u051E"],
        l: ["\u0139"],
        m: ["\u028D", "\u04CD", "\u04CE", "\u0520", "\u0521", "\u0D69"],
        n: ["\xD1", "\u014B", "\u019D", "\u0376", "\u03A0", "\u048A"],
        o: [
          "\xD8",
          "\xF5",
          "\xF8",
          "\u01FE",
          "\u0298",
          "\u047A",
          "\u05DD",
          "\u06DD",
          "\u0E4F"
        ],
        p: ["\u01F7", "\u048E"],
        q: ["\u09CD"],
        r: ["\xAE", "\u01A6", "\u0210", "\u024C", "\u0280", "\u042F"],
        s: ["\xA7", "\u03DE", "\u03DF", "\u03E8"],
        t: ["\u0141", "\u0166", "\u0373"],
        u: ["\u01B1", "\u054D"],
        v: ["\u05D8"],
        w: ["\u0428", "\u0460", "\u047C", "\u0D70"],
        x: ["\u04B2", "\u04FE", "\u04FC", "\u04FD"],
        y: ["\xA5", "\u04B0", "\u04CB"],
        z: ["\u01B5", "\u0240"]
      };
      text.forEach(function(c) {
        c = c.toLowerCase();
        var chars = trap[c] || [" "];
        var rand = Math.floor(Math.random() * chars.length);
        if (typeof trap[c] !== "undefined") {
          result += trap[c][rand];
        } else {
          result += c;
        }
      });
      return result;
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/colors@1.2.5/node_modules/colors/lib/custom/zalgo.js
var require_zalgo = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/colors@1.2.5/node_modules/colors/lib/custom/zalgo.js"(exports, module2) {
    module2["exports"] = function zalgo(text, options) {
      text = text || "   he is here   ";
      var soul = {
        "up": [
          "\u030D",
          "\u030E",
          "\u0304",
          "\u0305",
          "\u033F",
          "\u0311",
          "\u0306",
          "\u0310",
          "\u0352",
          "\u0357",
          "\u0351",
          "\u0307",
          "\u0308",
          "\u030A",
          "\u0342",
          "\u0313",
          "\u0308",
          "\u034A",
          "\u034B",
          "\u034C",
          "\u0303",
          "\u0302",
          "\u030C",
          "\u0350",
          "\u0300",
          "\u0301",
          "\u030B",
          "\u030F",
          "\u0312",
          "\u0313",
          "\u0314",
          "\u033D",
          "\u0309",
          "\u0363",
          "\u0364",
          "\u0365",
          "\u0366",
          "\u0367",
          "\u0368",
          "\u0369",
          "\u036A",
          "\u036B",
          "\u036C",
          "\u036D",
          "\u036E",
          "\u036F",
          "\u033E",
          "\u035B",
          "\u0346",
          "\u031A"
        ],
        "down": [
          "\u0316",
          "\u0317",
          "\u0318",
          "\u0319",
          "\u031C",
          "\u031D",
          "\u031E",
          "\u031F",
          "\u0320",
          "\u0324",
          "\u0325",
          "\u0326",
          "\u0329",
          "\u032A",
          "\u032B",
          "\u032C",
          "\u032D",
          "\u032E",
          "\u032F",
          "\u0330",
          "\u0331",
          "\u0332",
          "\u0333",
          "\u0339",
          "\u033A",
          "\u033B",
          "\u033C",
          "\u0345",
          "\u0347",
          "\u0348",
          "\u0349",
          "\u034D",
          "\u034E",
          "\u0353",
          "\u0354",
          "\u0355",
          "\u0356",
          "\u0359",
          "\u035A",
          "\u0323"
        ],
        "mid": [
          "\u0315",
          "\u031B",
          "\u0300",
          "\u0301",
          "\u0358",
          "\u0321",
          "\u0322",
          "\u0327",
          "\u0328",
          "\u0334",
          "\u0335",
          "\u0336",
          "\u035C",
          "\u035D",
          "\u035E",
          "\u035F",
          "\u0360",
          "\u0362",
          "\u0338",
          "\u0337",
          "\u0361",
          " \u0489"
        ]
      };
      var all = [].concat(soul.up, soul.down, soul.mid);
      function randomNumber(range) {
        var r = Math.floor(Math.random() * range);
        return r;
      }
      function isChar(character) {
        var bool = false;
        all.filter(function(i) {
          bool = i === character;
        });
        return bool;
      }
      function heComes(text2, options2) {
        var result = "";
        var counts;
        var l;
        options2 = options2 || {};
        options2["up"] = typeof options2["up"] !== "undefined" ? options2["up"] : true;
        options2["mid"] = typeof options2["mid"] !== "undefined" ? options2["mid"] : true;
        options2["down"] = typeof options2["down"] !== "undefined" ? options2["down"] : true;
        options2["size"] = typeof options2["size"] !== "undefined" ? options2["size"] : "maxi";
        text2 = text2.split("");
        for (l in text2) {
          if (isChar(l)) {
            continue;
          }
          result = result + text2[l];
          counts = { "up": 0, "down": 0, "mid": 0 };
          switch (options2.size) {
            case "mini":
              counts.up = randomNumber(8);
              counts.mid = randomNumber(2);
              counts.down = randomNumber(8);
              break;
            case "maxi":
              counts.up = randomNumber(16) + 3;
              counts.mid = randomNumber(4) + 1;
              counts.down = randomNumber(64) + 3;
              break;
            default:
              counts.up = randomNumber(8) + 1;
              counts.mid = randomNumber(6) / 2;
              counts.down = randomNumber(8) + 1;
              break;
          }
          var arr = ["up", "mid", "down"];
          for (var d in arr) {
            var index = arr[d];
            for (var i = 0; i <= counts[index]; i++) {
              if (options2[index]) {
                result = result + soul[index][randomNumber(soul[index].length)];
              }
            }
          }
        }
        return result;
      }
      return heComes(text, options);
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/colors@1.2.5/node_modules/colors/lib/maps/america.js
var require_america = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/colors@1.2.5/node_modules/colors/lib/maps/america.js"(exports, module2) {
    var colors = require_colors();
    module2["exports"] = function() {
      return function(letter, i, exploded) {
        if (letter === " ")
          return letter;
        switch (i % 3) {
          case 0:
            return colors.red(letter);
          case 1:
            return colors.white(letter);
          case 2:
            return colors.blue(letter);
        }
      };
    }();
  }
});

// ../../../common/temp/default/node_modules/.pnpm/colors@1.2.5/node_modules/colors/lib/maps/zebra.js
var require_zebra = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/colors@1.2.5/node_modules/colors/lib/maps/zebra.js"(exports, module2) {
    var colors = require_colors();
    module2["exports"] = function(letter, i, exploded) {
      return i % 2 === 0 ? letter : colors.inverse(letter);
    };
  }
});

// ../../../common/temp/default/node_modules/.pnpm/colors@1.2.5/node_modules/colors/lib/maps/rainbow.js
var require_rainbow = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/colors@1.2.5/node_modules/colors/lib/maps/rainbow.js"(exports, module2) {
    var colors = require_colors();
    module2["exports"] = function() {
      var rainbowColors = ["red", "yellow", "green", "blue", "magenta"];
      return function(letter, i, exploded) {
        if (letter === " ") {
          return letter;
        } else {
          return colors[rainbowColors[i++ % rainbowColors.length]](letter);
        }
      };
    }();
  }
});

// ../../../common/temp/default/node_modules/.pnpm/colors@1.2.5/node_modules/colors/lib/maps/random.js
var require_random = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/colors@1.2.5/node_modules/colors/lib/maps/random.js"(exports, module2) {
    var colors = require_colors();
    module2["exports"] = function() {
      var available = [
        "underline",
        "inverse",
        "grey",
        "yellow",
        "red",
        "green",
        "blue",
        "white",
        "cyan",
        "magenta"
      ];
      return function(letter, i, exploded) {
        return letter === " " ? letter : colors[available[Math.round(Math.random() * (available.length - 2))]](letter);
      };
    }();
  }
});

// ../../../common/temp/default/node_modules/.pnpm/colors@1.2.5/node_modules/colors/lib/colors.js
var require_colors = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/colors@1.2.5/node_modules/colors/lib/colors.js"(exports, module2) {
    var colors = {};
    module2["exports"] = colors;
    colors.themes = {};
    var util = require("util");
    var ansiStyles = colors.styles = require_styles();
    var defineProps = Object.defineProperties;
    var newLineRegex = new RegExp(/[\r\n]+/g);
    colors.supportsColor = require_supports_colors().supportsColor;
    if (typeof colors.enabled === "undefined") {
      colors.enabled = colors.supportsColor() !== false;
    }
    colors.enable = function() {
      colors.enabled = true;
    };
    colors.disable = function() {
      colors.enabled = false;
    };
    colors.stripColors = colors.strip = function(str) {
      return ("" + str).replace(/\x1B\[\d+m/g, "");
    };
    var stylize = colors.stylize = function stylize2(str, style) {
      if (!colors.enabled) {
        return str + "";
      }
      return ansiStyles[style].open + str + ansiStyles[style].close;
    };
    var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
    var escapeStringRegexp = function(str) {
      if (typeof str !== "string") {
        throw new TypeError("Expected a string");
      }
      return str.replace(matchOperatorsRe, "\\$&");
    };
    function build(_styles) {
      var builder = function builder2() {
        return applyStyle.apply(builder2, arguments);
      };
      builder._styles = _styles;
      builder.__proto__ = proto;
      return builder;
    }
    var styles = function() {
      var ret = {};
      ansiStyles.grey = ansiStyles.gray;
      Object.keys(ansiStyles).forEach(function(key) {
        ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), "g");
        ret[key] = {
          get: function() {
            return build(this._styles.concat(key));
          }
        };
      });
      return ret;
    }();
    var proto = defineProps(function colors2() {
    }, styles);
    function applyStyle() {
      var args = Array.prototype.slice.call(arguments);
      var str = args.map(function(arg) {
        if (arg !== void 0 && arg.constructor === String) {
          return arg;
        } else {
          return util.inspect(arg);
        }
      }).join(" ");
      if (!colors.enabled || !str) {
        return str;
      }
      var newLinesPresent = str.indexOf("\n") != -1;
      var nestedStyles = this._styles;
      var i = nestedStyles.length;
      while (i--) {
        var code = ansiStyles[nestedStyles[i]];
        str = code.open + str.replace(code.closeRe, code.open) + code.close;
        if (newLinesPresent) {
          str = str.replace(newLineRegex, code.close + "\n" + code.open);
        }
      }
      return str;
    }
    colors.setTheme = function(theme) {
      if (typeof theme === "string") {
        console.log("colors.setTheme now only accepts an object, not a string.  If you are trying to set a theme from a file, it is now your (the caller's) responsibility to require the file.  The old syntax looked like colors.setTheme(__dirname + '/../themes/generic-logging.js'); The new syntax looks like colors.setTheme(require(__dirname + '/../themes/generic-logging.js'));");
        return;
      }
      for (var style in theme) {
        (function(style2) {
          colors[style2] = function(str) {
            if (typeof theme[style2] === "object") {
              var out = str;
              for (var i in theme[style2]) {
                out = colors[theme[style2][i]](out);
              }
              return out;
            }
            return colors[theme[style2]](str);
          };
        })(style);
      }
    };
    function init() {
      var ret = {};
      Object.keys(styles).forEach(function(name) {
        ret[name] = {
          get: function() {
            return build([name]);
          }
        };
      });
      return ret;
    }
    var sequencer = function sequencer2(map2, str) {
      var exploded = str.split("");
      exploded = exploded.map(map2);
      return exploded.join("");
    };
    colors.trap = require_trap();
    colors.zalgo = require_zalgo();
    colors.maps = {};
    colors.maps.america = require_america();
    colors.maps.zebra = require_zebra();
    colors.maps.rainbow = require_rainbow();
    colors.maps.random = require_random();
    for (map in colors.maps) {
      (function(map2) {
        colors[map2] = function(str) {
          return sequencer(colors.maps[map2], str);
        };
      })(map);
    }
    var map;
    defineProps(colors, init());
  }
});

// ../../../common/temp/default/node_modules/.pnpm/colors@1.2.5/node_modules/colors/safe.js
var require_safe = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/colors@1.2.5/node_modules/colors/safe.js"(exports, module2) {
    var colors = require_colors();
    module2["exports"] = colors;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Terminal/ConsoleTerminalProvider.js
var require_ConsoleTerminalProvider = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Terminal/ConsoleTerminalProvider.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConsoleTerminalProvider = void 0;
    var os_1 = require("os");
    var safe_1 = require_safe();
    var ITerminalProvider_1 = require_ITerminalProvider();
    var ConsoleTerminalProvider2 = class {
      constructor(options = {}) {
        this.verboseEnabled = false;
        this.debugEnabled = false;
        this.verboseEnabled = !!options.verboseEnabled;
        this.debugEnabled = !!options.debugEnabled;
      }
      write(data, severity) {
        switch (severity) {
          case ITerminalProvider_1.TerminalProviderSeverity.warning:
          case ITerminalProvider_1.TerminalProviderSeverity.error: {
            process.stderr.write(data);
            break;
          }
          case ITerminalProvider_1.TerminalProviderSeverity.verbose: {
            if (this.verboseEnabled) {
              process.stdout.write(data);
            }
            break;
          }
          case ITerminalProvider_1.TerminalProviderSeverity.debug: {
            if (this.debugEnabled) {
              process.stdout.write(data);
            }
            break;
          }
          case ITerminalProvider_1.TerminalProviderSeverity.log:
          default: {
            process.stdout.write(data);
            break;
          }
        }
      }
      get eolCharacter() {
        return os_1.EOL;
      }
      get supportsColor() {
        return safe_1.enabled;
      }
    };
    exports.ConsoleTerminalProvider = ConsoleTerminalProvider2;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Terminal/StringBufferTerminalProvider.js
var require_StringBufferTerminalProvider = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/Terminal/StringBufferTerminalProvider.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StringBufferTerminalProvider = void 0;
    var ITerminalProvider_1 = require_ITerminalProvider();
    var StringBuilder_1 = require_StringBuilder();
    var Text_1 = require_Text();
    var AnsiEscape_1 = require_AnsiEscape();
    var StringBufferTerminalProvider = class {
      constructor(supportsColor = false) {
        this._standardBuffer = new StringBuilder_1.StringBuilder();
        this._verboseBuffer = new StringBuilder_1.StringBuilder();
        this._debugBuffer = new StringBuilder_1.StringBuilder();
        this._warningBuffer = new StringBuilder_1.StringBuilder();
        this._errorBuffer = new StringBuilder_1.StringBuilder();
        this._supportsColor = supportsColor;
      }
      write(data, severity) {
        switch (severity) {
          case ITerminalProvider_1.TerminalProviderSeverity.warning: {
            this._warningBuffer.append(data);
            break;
          }
          case ITerminalProvider_1.TerminalProviderSeverity.error: {
            this._errorBuffer.append(data);
            break;
          }
          case ITerminalProvider_1.TerminalProviderSeverity.verbose: {
            this._verboseBuffer.append(data);
            break;
          }
          case ITerminalProvider_1.TerminalProviderSeverity.debug: {
            this._debugBuffer.append(data);
            break;
          }
          case ITerminalProvider_1.TerminalProviderSeverity.log:
          default: {
            this._standardBuffer.append(data);
            break;
          }
        }
      }
      get eolCharacter() {
        return "[n]";
      }
      get supportsColor() {
        return this._supportsColor;
      }
      getOutput(options) {
        return this._normalizeOutput(this._standardBuffer.toString(), options);
      }
      getVerbose(options) {
        return this._normalizeOutput(this._verboseBuffer.toString(), options);
      }
      getDebugOutput(options) {
        return this._normalizeOutput(this._debugBuffer.toString(), options);
      }
      getErrorOutput(options) {
        return this._normalizeOutput(this._errorBuffer.toString(), options);
      }
      getWarningOutput(options) {
        return this._normalizeOutput(this._warningBuffer.toString(), options);
      }
      _normalizeOutput(s, options) {
        options = Object.assign({ normalizeSpecialCharacters: true }, options || {});
        s = Text_1.Text.convertToLf(s);
        if (options.normalizeSpecialCharacters) {
          return AnsiEscape_1.AnsiEscape.formatForTests(s, { encodeNewlines: true });
        } else {
          return s;
        }
      }
    };
    exports.StringBufferTerminalProvider = StringBufferTerminalProvider;
  }
});

// ../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/index.js
var require_lib2 = __commonJS({
  "../../../common/temp/default/node_modules/.pnpm/@rushstack+node-core-library@3.55.2_@types+node@18.18.9/node_modules/@rushstack/node-core-library/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TypeUuid = exports.StringBufferTerminalProvider = exports.ConsoleTerminalProvider = exports.TerminalProviderSeverity = exports.TextAttribute = exports.ColorValue = exports.Colors = exports.Terminal = exports.SubprocessTerminator = exports.StringBuilder = exports.LegacyAdapters = exports.FileWriter = exports.FileSystem = exports.AlreadyExistsBehavior = exports.Sort = exports.NewlineKind = exports.Text = exports.Encoding = exports.Path = exports.PackageNameParser = exports.PackageName = exports.PackageJsonLookup = exports.ProtectableMap = exports.PosixModeBits = exports.MapExtensions = exports.LockFile = exports.JsonSchema = exports.JsonFile = exports.JsonSyntax = exports.InternalError = exports.Import = exports.FileError = exports.Executable = exports.EnvironmentMap = exports.Enum = exports.FolderConstants = exports.FileConstants = exports.Async = exports.AnsiEscape = exports.AlreadyReportedError = void 0;
    var AlreadyReportedError_1 = require_AlreadyReportedError();
    Object.defineProperty(exports, "AlreadyReportedError", { enumerable: true, get: function() {
      return AlreadyReportedError_1.AlreadyReportedError;
    } });
    var AnsiEscape_1 = require_AnsiEscape();
    Object.defineProperty(exports, "AnsiEscape", { enumerable: true, get: function() {
      return AnsiEscape_1.AnsiEscape;
    } });
    var Async_1 = require_Async();
    Object.defineProperty(exports, "Async", { enumerable: true, get: function() {
      return Async_1.Async;
    } });
    var Constants_1 = require_Constants();
    Object.defineProperty(exports, "FileConstants", { enumerable: true, get: function() {
      return Constants_1.FileConstants;
    } });
    Object.defineProperty(exports, "FolderConstants", { enumerable: true, get: function() {
      return Constants_1.FolderConstants;
    } });
    var Enum_1 = require_Enum();
    Object.defineProperty(exports, "Enum", { enumerable: true, get: function() {
      return Enum_1.Enum;
    } });
    var EnvironmentMap_1 = require_EnvironmentMap();
    Object.defineProperty(exports, "EnvironmentMap", { enumerable: true, get: function() {
      return EnvironmentMap_1.EnvironmentMap;
    } });
    var Executable_1 = require_Executable();
    Object.defineProperty(exports, "Executable", { enumerable: true, get: function() {
      return Executable_1.Executable;
    } });
    var FileError_1 = require_FileError();
    Object.defineProperty(exports, "FileError", { enumerable: true, get: function() {
      return FileError_1.FileError;
    } });
    var Import_1 = require_Import();
    Object.defineProperty(exports, "Import", { enumerable: true, get: function() {
      return Import_1.Import;
    } });
    var InternalError_1 = require_InternalError();
    Object.defineProperty(exports, "InternalError", { enumerable: true, get: function() {
      return InternalError_1.InternalError;
    } });
    var JsonFile_1 = require_JsonFile();
    Object.defineProperty(exports, "JsonSyntax", { enumerable: true, get: function() {
      return JsonFile_1.JsonSyntax;
    } });
    Object.defineProperty(exports, "JsonFile", { enumerable: true, get: function() {
      return JsonFile_1.JsonFile;
    } });
    var JsonSchema_1 = require_JsonSchema();
    Object.defineProperty(exports, "JsonSchema", { enumerable: true, get: function() {
      return JsonSchema_1.JsonSchema;
    } });
    var LockFile_1 = require_LockFile();
    Object.defineProperty(exports, "LockFile", { enumerable: true, get: function() {
      return LockFile_1.LockFile;
    } });
    var MapExtensions_1 = require_MapExtensions();
    Object.defineProperty(exports, "MapExtensions", { enumerable: true, get: function() {
      return MapExtensions_1.MapExtensions;
    } });
    var PosixModeBits_1 = require_PosixModeBits();
    Object.defineProperty(exports, "PosixModeBits", { enumerable: true, get: function() {
      return PosixModeBits_1.PosixModeBits;
    } });
    var ProtectableMap_1 = require_ProtectableMap();
    Object.defineProperty(exports, "ProtectableMap", { enumerable: true, get: function() {
      return ProtectableMap_1.ProtectableMap;
    } });
    var PackageJsonLookup_1 = require_PackageJsonLookup();
    Object.defineProperty(exports, "PackageJsonLookup", { enumerable: true, get: function() {
      return PackageJsonLookup_1.PackageJsonLookup;
    } });
    var PackageName_1 = require_PackageName();
    Object.defineProperty(exports, "PackageName", { enumerable: true, get: function() {
      return PackageName_1.PackageName;
    } });
    Object.defineProperty(exports, "PackageNameParser", { enumerable: true, get: function() {
      return PackageName_1.PackageNameParser;
    } });
    var Path_1 = require_Path();
    Object.defineProperty(exports, "Path", { enumerable: true, get: function() {
      return Path_1.Path;
    } });
    var Text_1 = require_Text();
    Object.defineProperty(exports, "Encoding", { enumerable: true, get: function() {
      return Text_1.Encoding;
    } });
    Object.defineProperty(exports, "Text", { enumerable: true, get: function() {
      return Text_1.Text;
    } });
    Object.defineProperty(exports, "NewlineKind", { enumerable: true, get: function() {
      return Text_1.NewlineKind;
    } });
    var Sort_1 = require_Sort();
    Object.defineProperty(exports, "Sort", { enumerable: true, get: function() {
      return Sort_1.Sort;
    } });
    var FileSystem_1 = require_FileSystem();
    Object.defineProperty(exports, "AlreadyExistsBehavior", { enumerable: true, get: function() {
      return FileSystem_1.AlreadyExistsBehavior;
    } });
    Object.defineProperty(exports, "FileSystem", { enumerable: true, get: function() {
      return FileSystem_1.FileSystem;
    } });
    var FileWriter_1 = require_FileWriter();
    Object.defineProperty(exports, "FileWriter", { enumerable: true, get: function() {
      return FileWriter_1.FileWriter;
    } });
    var LegacyAdapters_1 = require_LegacyAdapters();
    Object.defineProperty(exports, "LegacyAdapters", { enumerable: true, get: function() {
      return LegacyAdapters_1.LegacyAdapters;
    } });
    var StringBuilder_1 = require_StringBuilder();
    Object.defineProperty(exports, "StringBuilder", { enumerable: true, get: function() {
      return StringBuilder_1.StringBuilder;
    } });
    var SubprocessTerminator_1 = require_SubprocessTerminator();
    Object.defineProperty(exports, "SubprocessTerminator", { enumerable: true, get: function() {
      return SubprocessTerminator_1.SubprocessTerminator;
    } });
    var Terminal_1 = require_Terminal();
    Object.defineProperty(exports, "Terminal", { enumerable: true, get: function() {
      return Terminal_1.Terminal;
    } });
    var Colors_1 = require_Colors();
    Object.defineProperty(exports, "Colors", { enumerable: true, get: function() {
      return Colors_1.Colors;
    } });
    Object.defineProperty(exports, "ColorValue", { enumerable: true, get: function() {
      return Colors_1.ColorValue;
    } });
    Object.defineProperty(exports, "TextAttribute", { enumerable: true, get: function() {
      return Colors_1.TextAttribute;
    } });
    var ITerminalProvider_1 = require_ITerminalProvider();
    Object.defineProperty(exports, "TerminalProviderSeverity", { enumerable: true, get: function() {
      return ITerminalProvider_1.TerminalProviderSeverity;
    } });
    var ConsoleTerminalProvider_1 = require_ConsoleTerminalProvider();
    Object.defineProperty(exports, "ConsoleTerminalProvider", { enumerable: true, get: function() {
      return ConsoleTerminalProvider_1.ConsoleTerminalProvider;
    } });
    var StringBufferTerminalProvider_1 = require_StringBufferTerminalProvider();
    Object.defineProperty(exports, "StringBufferTerminalProvider", { enumerable: true, get: function() {
      return StringBufferTerminalProvider_1.StringBufferTerminalProvider;
    } });
    var TypeUuid_1 = require_TypeUuid();
    Object.defineProperty(exports, "TypeUuid", { enumerable: true, get: function() {
      return TypeUuid_1.TypeUuid;
    } });
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => RushDepLevelPlugin
});
module.exports = __toCommonJS(src_exports);

// ../../utils/rush-logger/src/index.ts
var import_node_core_library = __toESM(require_lib2());
var Logger = class {
  constructor() {
    this.$silent = false;
    this.terminal = new import_node_core_library.Terminal(new import_node_core_library.ConsoleTerminalProvider());
  }
  warning(content, prefix) {
    this.$writeLine(content, import_node_core_library.Colors.yellow, prefix, "[WARNING]");
  }
  debug(content, prefix) {
    this.$writeLine(content, import_node_core_library.Colors.bold, prefix, "[DEBUG]");
  }
  success(content, prefix) {
    this.$writeLine(content, import_node_core_library.Colors.green, prefix, "[SUCCESS]");
  }
  error(content, prefix) {
    this.$writeLine(content, import_node_core_library.Colors.red, prefix, "[ERROR]");
  }
  info(content, prefix) {
    this.$writeLine(content, import_node_core_library.Colors.blue, prefix, "[INFO]");
  }
  default(content) {
    this.terminal.writeLine(content);
  }
  turnOff() {
    this.$silent = true;
  }
  turnOn() {
    this.$silent = false;
  }
  $writeLine(content, colorFn, prefix, prefixText) {
    prefix = prefix != null ? prefix : true;
    const formattedContent = prefix ? `${prefixText} ${content}` : content;
    if (this.$silent === true && prefixText !== "[ERROR]") {
      return;
    }
    return this.terminal.writeLine(colorFn(`${formattedContent}`));
  }
};
var logger = new Logger();

// src/utils.ts
function isValidLevel(v) {
  return Number.isInteger(v);
}
function parseTagsLevel(tags) {
  const level = [...tags].find((tag) => tag.startsWith("level-"));
  return level ? parseInt(level.split("-")[1]) : null;
}
function isDepLevelMatch(projectLevel, dependencyLevel) {
  return projectLevel >= dependencyLevel;
}

// src/index.ts
var PLUGIN_NAME = "RushDepLevelPlugin";
var RushDepLevelPlugin = class {
  apply(rushSession, rushConfiguration) {
    rushSession.hooks.beforeInstall.tap(PLUGIN_NAME, () => {
      const startTime = process.hrtime();
      const { projects } = rushConfiguration;
      logger.info(
        `[${PLUGIN_NAME}] Validating dependency levels for ${projects.length} projects...`
      );
      for (const project of projects) {
        const workspaceDependencies = [...project.dependencyProjects];
        const projectTags = project.tags || [];
        const projectLevel = parseTagsLevel(projectTags);
        if (!isValidLevel(projectLevel)) {
          const errorMessage = `[${PLUGIN_NAME}] ${project.packageName} \u6CA1\u6709\u914D\u7F6Elevel tag\uFF0C\u8BF7\u5728rush.json\u4E2D\u914D\u7F6Etags\u5B57\u6BB5`;
          logger.error(errorMessage);
          process.exit(1);
        }
        for (const depProject of workspaceDependencies) {
          const depLevel = parseTagsLevel(depProject.tags);
          if (!isValidLevel(depLevel)) {
            const errorMessage = `[${PLUGIN_NAME}] ${project.packageName} \u4F9D\u8D56\u7684 ${depProject.packageName} \u6CA1\u6709\u914D\u7F6Elevel tag\uFF0C\u8BF7\u5728rush.json\u4E2D\u914D\u7F6Etags\u5B57\u6BB5\u3002`;
            logger.error(errorMessage);
            process.exit(1);
          }
          if (!isDepLevelMatch(projectLevel, depLevel)) {
            const errorMessage = `[${PLUGIN_NAME}] ${project.packageName} \u7684\u4F9D\u8D56\u7EA7\u522B\u4E0D\u5339\u914D\uFF1A\u9879\u76EE\u7EA7\u522B\u4E3Alevel-${projectLevel}\uFF0C\u4F9D\u8D56 "${depProject.packageName}" \u7EA7\u522B\u4E3Alevel-${depLevel}\u3002\u9879\u76EE\u53EA\u80FD\u4F9D\u8D56\u76F8\u540C\u6216\u66F4\u4F4E\u7EA7\u522B\u7684\u5305\uFF0C\u8BF7\u5728rush.json\u8C03\u6574tags\u5B57\u6BB5\u914D\u7F6E\u3002`;
            logger.error(errorMessage);
            process.exit(1);
          }
        }
      }
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const totalTimeMs = (seconds * 1e3 + nanoseconds / 1e6).toFixed(2);
      logger.info(
        `[${PLUGIN_NAME}] Dependency level validation completed in ${totalTimeMs}ms`
      );
    });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});

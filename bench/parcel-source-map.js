"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var source_map_1 = require("source-map");
var utils_1 = require("@parcel/utils");
function generateInlineMap(map) {
    return "data:application/json;charset=utf-8;base64," + Buffer.from(map).toString("base64");
}
var SourceMap = /** @class */ (function () {
    function SourceMap(mappings, sources) {
        if (mappings === void 0) { mappings = []; }
        if (sources === void 0) { sources = {}; }
        this.mappings = mappings;
        this.sources = sources;
    }
    SourceMap.deserialize = function (opts) {
        return new SourceMap(opts.mappings, opts.sources);
    };
    SourceMap.prototype.serialize = function () {
        return {
            mappings: this.mappings,
            sources: this.sources
        };
    };
    // Static Helper functions
    SourceMap.generateEmptyMap = function (sourceName, sourceContent) {
        var map = new SourceMap();
        map.setSourceContentFor(sourceName, sourceContent);
        var lineCount = utils_1.countLines(sourceContent);
        for (var line = 1; line < lineCount + 1; line++) {
            map.addMapping({
                source: sourceName,
                original: {
                    line: line,
                    column: 0
                },
                generated: {
                    line: line,
                    column: 0
                }
            });
        }
        map.linecount = lineCount;
        return map;
    };
    SourceMap.fromRawSourceMap = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var map;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        map = new SourceMap();
                        return [4 /*yield*/, map.addRawMap(input)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, map];
                }
            });
        });
    };
    SourceMap.prototype.getConsumer = function (map) {
        if (map instanceof source_map_1.SourceMapConsumer) {
            return Promise.resolve(map);
        }
        var sourcemap = typeof map === "string" ? JSON.parse(map) : map;
        if (sourcemap.sourceRoot != null) {
            delete sourcemap.sourceRoot;
        }
        // @ts-ignore
        return new source_map_1.SourceMapConsumer(sourcemap);
    };
    SourceMap.prototype.addRawMap = function (map, lineOffset, columnOffset) {
        if (lineOffset === void 0) { lineOffset = 0; }
        if (columnOffset === void 0) { columnOffset = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var consumer;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConsumer(map)];
                    case 1:
                        consumer = _a.sent();
                        consumer.eachMapping(function (mapping) {
                            if (mapping.originalLine) {
                                _this.addConsumerMapping(mapping, lineOffset, columnOffset);
                                if (!_this.sourceContentFor(mapping.source)) {
                                    _this.setSourceContentFor(mapping.source, consumer.sourceContentFor(mapping.source, true));
                                }
                            }
                        });
                        // @ts-ignore
                        consumer.destroy();
                        return [2 /*return*/, this];
                }
            });
        });
    };
    SourceMap.prototype.addMap = function (map, lineOffset, columnOffset) {
        var _a;
        var _this = this;
        if (lineOffset === void 0) { lineOffset = 0; }
        if (columnOffset === void 0) { columnOffset = 0; }
        if (lineOffset === 0 && columnOffset === 0) {
            (_a = this.mappings).push.apply(_a, map.mappings);
        }
        else {
            map.eachMapping(function (mapping) {
                _this.addMapping(mapping, lineOffset, columnOffset);
            });
        }
        for (var _i = 0, _b = Object.keys(map.sources); _i < _b.length; _i++) {
            var key = _b[_i];
            if (!this.sourceContentFor(key)) {
                this.setSourceContentFor(key, map.sourceContentFor(key));
            }
        }
        return this;
    };
    SourceMap.prototype.addMapping = function (mapping, lineOffset, columnOffset) {
        if (lineOffset === void 0) { lineOffset = 0; }
        if (columnOffset === void 0) { columnOffset = 0; }
        if (mapping.original) {
            this.mappings.push({
                source: mapping.source,
                name: mapping.name,
                original: mapping.original,
                generated: {
                    line: mapping.generated.line + lineOffset,
                    column: mapping.generated.column + columnOffset
                }
            });
        }
        else {
            this.mappings.push({
                generated: {
                    line: mapping.generated.line + lineOffset,
                    column: mapping.generated.column + columnOffset
                }
            });
        }
    };
    SourceMap.prototype.addConsumerMapping = function (mapping, lineOffset, columnOffset) {
        if (lineOffset === void 0) { lineOffset = 0; }
        if (columnOffset === void 0) { columnOffset = 0; }
        if (mapping.originalLine) {
            this.mappings.push({
                source: mapping.source,
                name: mapping.name,
                original: {
                    line: mapping.originalLine,
                    column: mapping.originalColumn
                },
                generated: {
                    line: mapping.generatedLine + lineOffset,
                    column: mapping.generatedColumn + columnOffset
                }
            });
        }
        else {
            this.mappings.push({
                generated: {
                    line: mapping.generatedLine + lineOffset,
                    column: mapping.generatedColumn + columnOffset
                }
            });
        }
    };
    SourceMap.prototype.eachMapping = function (callback) {
        this.mappings.forEach(callback);
    };
    SourceMap.prototype.extend = function (extension) {
        return __awaiter(this, void 0, void 0, function () {
            var sourceMap, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(extension instanceof SourceMap)) return [3 /*break*/, 1];
                        _a = extension;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, new SourceMap().addRawMap(extension)];
                    case 2:
                        _a = _b.sent();
                        _b.label = 3;
                    case 3:
                        sourceMap = _a;
                        return [2 /*return*/, this._extend(sourceMap)];
                }
            });
        });
    };
    SourceMap.prototype._extend = function (extension) {
        var _this = this;
        extension.eachMapping(function (mapping) {
            var originalMappingIndex = null;
            if (mapping.original != null) {
                originalMappingIndex = _this.findClosest(mapping.original.line, mapping.original.column);
            }
            if (originalMappingIndex === null) {
                _this.addMapping(mapping);
            }
            else {
                var originalMapping = _this.mappings[originalMappingIndex];
                if (originalMapping.original) {
                    _this.mappings[originalMappingIndex] = {
                        generated: mapping.generated,
                        original: originalMapping.original,
                        source: originalMapping.source,
                        name: originalMapping.name
                    };
                }
                else {
                    _this.mappings[originalMappingIndex] = {
                        generated: mapping.generated
                    };
                }
            }
            if (mapping.source != null && !_this.sourceContentFor(mapping.source)) {
                _this.setSourceContentFor(mapping.source, extension.sourceContentFor(mapping.source));
            }
        });
        return this;
    };
    SourceMap.prototype.findClosest = function (line, column) {
        if (line < 1) {
            throw new Error("Line numbers must be >= 1");
        }
        if (column < 0) {
            throw new Error("Column numbers must be >= 0");
        }
        if (this.mappings.length < 1) {
            return null;
        }
        var startIndex = 0;
        var stopIndex = this.mappings.length - 1;
        var middleIndex = Math.floor((stopIndex + startIndex) / 2);
        while (startIndex < stopIndex &&
            this.mappings[middleIndex].generated.line !== line) {
            if (line < this.mappings[middleIndex].generated.line) {
                stopIndex = middleIndex - 1;
            }
            else if (line > this.mappings[middleIndex].generated.line) {
                startIndex = middleIndex + 1;
            }
            middleIndex = Math.floor((stopIndex + startIndex) / 2);
        }
        var mapping = this.mappings[middleIndex];
        if (!mapping || mapping.generated.line !== line) {
            return middleIndex;
        }
        while (middleIndex > 0 &&
            this.mappings[middleIndex - 1].generated.line !== line) {
            middleIndex--;
        }
        while (middleIndex < this.mappings.length - 1 &&
            this.mappings[middleIndex + 1].generated.line === line &&
            this.mappings[middleIndex + 1].generated.column <= column) {
            middleIndex++;
        }
        return middleIndex;
    };
    SourceMap.prototype.originalPositionFor = function (generatedPosition) {
        var index = this.findClosest(generatedPosition.line, generatedPosition.column);
        if (index === null) {
            return {
                source: null,
                name: null,
                line: null,
                column: null
            };
        }
        var mapping = this.mappings[index];
        if (mapping.original) {
            var result = {
                source: mapping.source,
                name: typeof mapping.name === "string" ? mapping.name : null,
                line: mapping.original.line,
                column: mapping.original.column
            };
            return result;
        }
        else {
            return {
                source: null,
                name: null,
                line: null,
                column: null
            };
        }
    };
    SourceMap.prototype.sourceContentFor = function (fileName) {
        return this.sources[fileName];
    };
    SourceMap.prototype.setSourceContentFor = function (fileName, sourceContent) {
        this.sources[fileName] = sourceContent;
    };
    SourceMap.prototype.offset = function (lineOffset, columnOffset) {
        if (lineOffset === void 0) { lineOffset = 0; }
        if (columnOffset === void 0) { columnOffset = 0; }
        this.mappings.map(function (mapping) { return (__assign(__assign({}, mapping), { generated: {
                line: mapping.generated.line + lineOffset,
                column: mapping.generated.column + columnOffset
            } })); });
    };
    SourceMap.prototype.stringify = function (_a) {
        var file = _a.file, sourceRoot = _a.sourceRoot, rootDir = _a.rootDir, inlineSources = _a.inlineSources, inlineMap = _a.inlineMap;
        return __awaiter(this, void 0, void 0, function () {
            var generator, _i, _b, sourceName, sourceContent, content, stringifiedMap;
            return __generator(this, function (_c) {
                generator = new source_map_1.SourceMapGenerator({ file: file, sourceRoot: sourceRoot });
                // @ts-ignore
                this.eachMapping(function (mapping) { return generator.addMapping(mapping); });
                if (inlineSources) {
                    for (_i = 0, _b = Object.keys(this.sources); _i < _b.length; _i++) {
                        sourceName = _b[_i];
                        sourceContent = this.sourceContentFor(sourceName);
                        if (sourceContent !== null) {
                            generator.setSourceContent(sourceName, sourceContent);
                        }
                        else {
                            try {
                                content = "";
                                if (content) {
                                    generator.setSourceContent(sourceName, content);
                                }
                            }
                            catch (e) {
                                // do nothing
                            }
                        }
                    }
                }
                stringifiedMap = generator.toString();
                return [2 /*return*/, inlineMap ? generateInlineMap(stringifiedMap) : stringifiedMap];
            });
        });
    };
    return SourceMap;
}());
exports["default"] = SourceMap;

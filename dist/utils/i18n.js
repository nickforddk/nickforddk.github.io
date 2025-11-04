"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadYAML = exports.getAvailableLanguages = exports.translate = exports.loadTranslations = void 0;
const fs_1 = require("fs");
const fs_2 = __importDefault(require("fs"));
const yaml_1 = require("yaml");
const LANGUAGES = {
    EN: 'en',
    DA: 'da',
};
const DEFAULT_LANGUAGE = LANGUAGES.EN;
function loadTranslations(filePath) {
    const data = (0, fs_1.readFileSync)(filePath, 'utf-8');
    return JSON.parse(data);
}
exports.loadTranslations = loadTranslations;
function translate(key, lang, translations) {
    var _a, _b;
    return ((_a = translations[key]) === null || _a === void 0 ? void 0 : _a[lang]) || ((_b = translations[key]) === null || _b === void 0 ? void 0 : _b[DEFAULT_LANGUAGE]) || key;
}
exports.translate = translate;
function getAvailableLanguages(translations) {
    return Object.keys(translations[Object.keys(translations)[0]]);
}
exports.getAvailableLanguages = getAvailableLanguages;
const loadYAML = (filePath) => {
    const raw = fs_2.default.readFileSync(filePath, 'utf-8');
    return (0, yaml_1.parse)(raw);
};
exports.loadYAML = loadYAML;

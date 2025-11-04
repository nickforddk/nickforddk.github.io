"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAll = exports.buildSite = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const nunjucks = __importStar(require("nunjucks"));
const yaml_1 = require("yaml");
const templatesDir = path_1.default.join(__dirname, '../templates');
const outputDir = path_1.default.join(__dirname, '../../public');
const assetsDir = path_1.default.join(__dirname, '../assets');
const stylesDir = path_1.default.join(__dirname, '../styles');
const env = nunjucks.configure(templatesDir, { autoescape: true });
// Turn YAML arrays like [{title:..},{url:..}] into a single object
function normalizeLangBlock(v) {
    if (Array.isArray(v)) {
        return v.reduce((acc, item) => (typeof item === 'object' && item ? Object.assign(Object.assign({}, acc), item) : acc), {});
    }
    return (v && typeof v === 'object') ? v : {};
}
const toViewModel = (data, lang) => {
    const headerLinks = (data['header-links'] || [])
        .map(link => {
        var _a, _b, _c, _d, _e, _f;
        const en = normalizeLangBlock(link.en);
        const da = normalizeLangBlock(link.da);
        const loc = lang === 'da' ? (Object.keys(da).length ? da : undefined) : (Object.keys(en).length ? en : undefined);
        const title = (_b = (_a = loc === null || loc === void 0 ? void 0 : loc.title) !== null && _a !== void 0 ? _a : link.title) !== null && _b !== void 0 ? _b : '';
        const id = (_d = (_c = loc === null || loc === void 0 ? void 0 : loc.id) !== null && _c !== void 0 ? _c : link.id) !== null && _d !== void 0 ? _d : '';
        const url = (_f = (_e = loc === null || loc === void 0 ? void 0 : loc.url) !== null && _e !== void 0 ? _e : link.url) !== null && _f !== void 0 ? _f : '';
        return title && id && url ? { title, id, url } : null;
    })
        .filter(Boolean);
    // Build a quick lookup for category labels
    const categoryById = new Map((data.categories || []).map(c => [c.id, { en: c.en, da: c.da }]));
    const hasOtherCategory = categoryById.has('other');
    const projects = (data.projects || []).map(p => {
        var _a, _b, _c, _d, _e, _f;
        const en = normalizeLangBlock(p.en);
        const da = normalizeLangBlock(p.da);
        const loc = lang === 'da' ? da : en;
        const rawCategoryId = ((_a = p.category) !== null && _a !== void 0 ? _a : '').trim();
        const resolvedCategoryId = rawCategoryId && categoryById.has(rawCategoryId)
            ? rawCategoryId
            : (hasOtherCategory ? 'other' : (rawCategoryId || 'other'));
        const labelRec = categoryById.get(resolvedCategoryId);
        const categoryLabel = labelRec ? labelRec[lang] : (lang === 'da' ? 'Andet' : 'Other');
        return {
            title: (_d = (_c = (_b = loc.title) !== null && _b !== void 0 ? _b : p.title) !== null && _c !== void 0 ? _c : p.id) !== null && _d !== void 0 ? _d : p.repo,
            category: resolvedCategoryId,
            categoryLabel,
            description: (_e = loc.description) !== null && _e !== void 0 ? _e : '',
            img: (_f = p.img) !== null && _f !== void 0 ? _f : '',
            repo: p.repo
        };
    });
    return {
        lang,
        title: data.title,
        name: data.name,
        description: data.description[lang],
        headerLinks,
        projectsTitle: lang === 'da' ? 'Projekter' : 'Projects',
        projects,
        year: new Date().getFullYear()
    };
};
function buildSite(data, lang) {
    const languages = ['en', 'da'];
    if (lang) {
        const vm = toViewModel(data, lang);
        return env.render('index.njk', vm);
    }
    languages.forEach(l => {
        const vm = toViewModel(data, l);
        const renderedContent = env.render('index.njk', vm);
        const outputFilePath = path_1.default.join(outputDir, `${l}/index.html`);
        fs_1.default.mkdirSync(path_1.default.dirname(outputFilePath), { recursive: true });
        fs_1.default.writeFileSync(outputFilePath, renderedContent, 'utf-8');
    });
    // copy static assets
    copyDir(assetsDir, path_1.default.join(outputDir, 'assets'));
    // DO NOT copy src/styles to public/styles, PostCSS writes there
    // copyDir(stylesDir, path.join(outputDir, 'styles'));
}
exports.buildSite = buildSite;
function copyDir(src, dest) {
    if (!fs_1.default.existsSync(src))
        return;
    fs_1.default.mkdirSync(dest, { recursive: true });
    for (const entry of fs_1.default.readdirSync(src, { withFileTypes: true })) {
        const s = path_1.default.join(src, entry.name);
        const d = path_1.default.join(dest, entry.name);
        if (entry.isDirectory())
            copyDir(s, d);
        else
            fs_1.default.copyFileSync(s, d);
    }
}
const buildAll = () => {
    const siteDataPath = path_1.default.join(__dirname, '../data/site.yml');
    const siteDataRaw = fs_1.default.readFileSync(siteDataPath, 'utf-8');
    const parsedData = (0, yaml_1.parse)(siteDataRaw);
    buildSite(parsedData);
};
exports.buildAll = buildAll;

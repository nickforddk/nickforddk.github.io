"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const i18n_1 = require("./utils/i18n");
const build_1 = require("./utils/build");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Serve source assets during dev
app.use('/styles', express_1.default.static(path_1.default.join(__dirname, './styles')));
app.use('/assets', express_1.default.static(path_1.default.join(__dirname, './assets')));
app.use(express_1.default.json());
const siteData = (0, i18n_1.loadYAML)(path_1.default.join(__dirname, './data/site.yml'));
app.get('/:lang(en|da)?', (req, res) => {
    const lang = req.params.lang || 'en';
    const content = (0, build_1.buildSite)(siteData, lang);
    res.send(content);
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

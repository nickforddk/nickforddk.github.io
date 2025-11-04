import express, { Request, Response } from 'express';
import path from 'path';
import { loadYAML } from './utils/i18n';
import { buildSite } from './utils/build';
import { SupportedLang } from './types';

type SiteYaml = {
  title: string;
  name: string;
  description: Record<SupportedLang, string>;
  'header-links': any[];
  projects: any[];
  categories: any[];
};

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));
// Serve source assets during dev
app.use('/styles', express.static(path.join(__dirname, './styles')));
app.use('/assets', express.static(path.join(__dirname, './assets')));
app.use(express.json());

const siteData: SiteYaml = loadYAML<SiteYaml>(path.join(__dirname, './data/site.yml'));

app.get('/:lang(en|da)?', (req: Request, res: Response) => {
  const lang = (req.params.lang as SupportedLang) || 'en';
  const content = buildSite(siteData, lang);
  res.send(content);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
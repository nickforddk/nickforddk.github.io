import fs from 'fs';
import path from 'path';
import * as nunjucks from 'nunjucks';
import { parse as parseYaml } from 'yaml';
import { SupportedLang } from '../types';

const templatesDir = path.join(__dirname, '../templates');
const outputDir = path.join(__dirname, '../../public');
const assetsDir = path.join(__dirname, '../assets');
const stylesDir = path.join(__dirname, '../styles');

const env = nunjucks.configure(templatesDir, { autoescape: true });

// YAML shapes (localized fields live inside each item)
type HeaderLinkYaml = {
  id?: string;
  title?: string; // global fallback
  url?: string;   // global fallback
  en?: unknown;   // [{ title: string }, { url: string }]
  da?: unknown;   // [{ title: string }, { url: string }]
};

type ProjectYaml = {
  id?: string;
  title?: string; // global fallback
  img?: string; // global fallback
  repo: string;
  category?: string; // category id
  en?: unknown;   // [{ title?: string }, { description?: string }]
  da?: unknown;   // [{ title?: string }, { description?: string }]
};

type CategoryYaml = {
  id: string;
  en: string;
  da: string;
};

type SiteYaml = {
  title: string;
  name: string;
  description: Record<SupportedLang, string>;
  'header-links': HeaderLinkYaml[];
  projects: ProjectYaml[];
  categories: CategoryYaml[];
};

// Turn YAML arrays like [{title:..},{url:..}] into a single object
function normalizeLangBlock<T extends object>(v: unknown): Partial<T> {
  if (Array.isArray(v)) {
    return v.reduce((acc, item) => (typeof item === 'object' && item ? { ...acc, ...item } : acc), {} as Partial<T>);
  }
  return (v && typeof v === 'object') ? (v as Partial<T>) : {};
}

const toViewModel = (data: SiteYaml, lang: SupportedLang) => {
  const headerLinks = (data['header-links'] || [])
    .map(link => {
      const en = normalizeLangBlock<{ title: string; id: string; url: string }>(link.en);
      const da = normalizeLangBlock<{ title: string; id: string; url: string }>(link.da);
      const loc = lang === 'da' ? (Object.keys(da).length ? da : undefined) : (Object.keys(en).length ? en : undefined);
      const title = loc?.title ?? link.title ?? '';
      const id = loc?.id ?? link.id ?? '';
      const url = loc?.url ?? link.url ?? '';
      return title && id && url ? { title, id, url } : null;
    })
    .filter(Boolean) as { title: string; id: string; url: string }[];

  // Build a quick lookup for category labels
  const categoryById = new Map(
    (data.categories || []).map(c => [c.id, { en: c.en, da: c.da } as Record<SupportedLang, string>])
  );
  const hasOtherCategory = categoryById.has('other');

  const projects = (data.projects || []).map(p => {
    const en = normalizeLangBlock<{ title?: string; description?: string }>(p.en);
    const da = normalizeLangBlock<{ title?: string; description?: string }>(p.da);
    const loc = lang === 'da' ? da : en;

    const rawCategoryId = (p.category ?? '').trim();
    const resolvedCategoryId =
      rawCategoryId && categoryById.has(rawCategoryId)
        ? rawCategoryId
        : (hasOtherCategory ? 'other' : (rawCategoryId || 'other'));

    const labelRec = categoryById.get(resolvedCategoryId);
    const categoryLabel = labelRec ? labelRec[lang] : (lang === 'da' ? 'Andet' : 'Other');

    return {
      title: loc.title ?? p.title ?? p.id ?? p.repo,
      category: resolvedCategoryId,   // id is 'other' if no match
      categoryLabel,                  // localized label
      description: loc.description ?? '',
      img: p.img ?? '',
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

// Overloads: return string when lang provided, otherwise write files
export function buildSite(data: SiteYaml, lang: SupportedLang): string;
export function buildSite(data: SiteYaml): void;
export function buildSite(data: SiteYaml, lang?: SupportedLang): string | void {
  const languages: SupportedLang[] = ['en', 'da'];

  if (lang) {
    const vm = toViewModel(data, lang);
    return env.render('index.njk', vm);
  }

  // render per-language pages
  languages.forEach(l => {
    const vm = toViewModel(data, l);
    const html = env.render('index.njk', vm);
    const out = path.join(outputDir, `${l}/index.html`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, html, 'utf-8');
  });

  // set root index to default language (en)
  const enIndex = path.join(outputDir, 'en/index.html');
  const rootIndex = path.join(outputDir, 'index.html');
  if (fs.existsSync(enIndex)) {
    fs.copyFileSync(enIndex, rootIndex);
  }

  // static assets
  copyDir(assetsDir, path.join(outputDir, 'assets'));
  // do not copy styles dir; PostCSS writes to public/styles
}

function copyDir(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

export const buildAll = () => {
  const siteDataPath = path.join(__dirname, '../data/site.yml');
  const siteDataRaw = fs.readFileSync(siteDataPath, 'utf-8');
  const parsedData = parseYaml(siteDataRaw) as SiteYaml;
  buildSite(parsedData);
};
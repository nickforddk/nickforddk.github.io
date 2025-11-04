import { readFileSync } from 'fs';
import { join } from 'path';
import fs from 'fs';
import { parse as parseYaml } from 'yaml';

const LANGUAGES = {
    EN: 'en',
    DA: 'da',
};

const DEFAULT_LANGUAGE = LANGUAGES.EN;

export function loadTranslations(filePath: string) {
    const data = readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

export function translate(key: string, lang: string, translations: Record<string, any>) {
    return translations[key]?.[lang] || translations[key]?.[DEFAULT_LANGUAGE] || key;
}

export function getAvailableLanguages(translations: Record<string, any>) {
    return Object.keys(translations[Object.keys(translations)[0]]);
}

export const loadYAML = <T = unknown>(filePath: string): T => {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return parseYaml(raw) as T;
};
interface HeaderLink {
    title: string;
    lang?: string;
    url: string;
}

interface ObjectItem {
    title: string;
    repo: string;
    description: string;
}

interface SiteConfig {
    title: string;
    name: string;
    description: Record<string, string>;
    headerLinks: HeaderLink[];
    objects: ObjectItem[];
}

type SupportedLang = 'en' | 'da';
type SiteData = Record<SupportedLang, SiteConfig>;

export type { HeaderLink, ObjectItem, SiteConfig, SupportedLang, SiteData };
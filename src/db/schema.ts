// schema.ts — definice TypeScript typů a databázových dotazů.
//
// Důležité: db.prepare() se volá jednou na úrovni modulu (mimo funkce).
// Připravený statement se uloží do paměti a při každém volání funkce
// se jen spustí — bez nutnosti znovu parsovat SQL. Je to rychlejší.
import db from './database';

// Typ Post odpovídá přesně sloupcům v tabulce 'posts' v databázi.
// TypeScript díky němu ví, jaká data očekávat z DB dotazů.
export interface Post {
    id: number;
    title: string;
    slug: string;       // URL-friendly identifikátor článku (např. 'muj-prvni-clanek')
    excerpt: string;    // krátký úryvek pro seznam článků
    content: string;    // plný obsah článku
    likes: number;
    created_at: string;
}

export interface Photo {
    id: number;
    title: string;
    filename: string;   // název souboru v src/assets/ (např. 'fotka1.jpg')
    created_at: string;
}

// Prepared statements — připravené jednou, spouštěné při každém volání funkce
const getAllPostsStmt = db.prepare('SELECT * FROM posts ORDER BY created_at DESC');
const getAllPhotosStmt = db.prepare('SELECT * FROM photos ORDER BY created_at DESC');

// Pro stránkování: LIMIT omezí počet výsledků, OFFSET přeskočí záznamy předchozích stránek.
// Např. stránka 2 s perPage=4: LIMIT 4 OFFSET 4 → záznamy 5–8.
const getPaginatedPostsStmt = db.prepare(
    'SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?'
);
// Celkový počet článků potřebujeme pro výpočet počtu stránek.
const getPostsCountStmt = db.prepare('SELECT COUNT(*) as count FROM posts');

// Posledních N článků — pro úvodní stránku (výpis nejnovějších bez načítání všech).
const getRecentPostsStmt = db.prepare(
    'SELECT * FROM posts ORDER BY created_at DESC LIMIT ?'
);

export function getAllPosts(): Post[] {
    return getAllPostsStmt.all() as Post[];
}

export function getAllPhotos(): Photo[] {
    return getAllPhotosStmt.all() as Photo[];
}

export function getPaginatedPosts(page: number, perPage: number): Post[] {
    const offset = (page - 1) * perPage;
    return getPaginatedPostsStmt.all(perPage, offset) as Post[];
}

export function getPostsCount(): number {
    const row = getPostsCountStmt.get() as { count: number };
    return row.count;
}

export function getRecentPosts(limit: number): Post[] {
    return getRecentPostsStmt.all(limit) as Post[];
}
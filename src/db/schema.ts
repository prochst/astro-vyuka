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

export function getAllPosts(): Post[] {
    return getAllPostsStmt.all() as Post[];
}

export function getAllPhotos(): Photo[] {
    return getAllPhotosStmt.all() as Photo[];
}
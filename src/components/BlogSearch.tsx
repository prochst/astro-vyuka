// BlogSearch.tsx — React komponenta pro serverové vyhledávání článků se stránkováním.
//
// SERVEROVÉ vyhledávání: uživatel zadá dotaz → React zavolá Astro Action →
// server provede SQL dotaz v databázi → vrátí výsledky → React překreslí seznam.
//
// STRÁNKOVÁNÍ: funguje přes URL parametry (?page=N), takže každá stránka má
// vlastní URL a lze ji sdílet nebo přidat do záložek.
// Při aktivním vyhledávání se stránkování skryje — zobrazují se všechny výsledky.
//
// Výhody serverového vyhledávání oproti statickému filtrování:
//   - prohledává i content (celý text článku), nejen co je v HTML
//   - pro velké databáze nenačítá vše do prohlížeče
//   - logika zůstává na serveru
import { actions } from 'astro:actions';
import { useState } from 'react';
// import type importuje pouze TypeScript typ — při kompilaci zmizí.
// Do prohlížeče se neodešle žádný kód ze schema.ts (ani import better-sqlite3).
import type { Post } from '../db/schema';

interface Props {
    // Výchozí seznam článků předaný ze serveru při prvním vykreslení stránky.
    // Při prázdném vyhledávání se zobrazí tento seznam.
    initialPosts: Post[];
    // Stránkovací informace ze serveru
    currentPage: number;
    totalPages: number;
    totalCount: number;
}

export default function BlogSearch({ initialPosts, currentPage, totalPages, totalCount }: Props) {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Příznak: je aktivní vyhledávání? Pokud ano, stránkování se skryje.
    const isSearching = query.trim().length > 0;

    const handleSearch = async (value: string) => {
        setQuery(value);

        // Pokud je dotaz prázdný, zobrazíme výchozí seznam bez volání serveru
        if (!value.trim()) {
            setPosts(initialPosts);
            return;
        }

        setLoading(true);
        // Volání Astro Action — HTTP POST na serveru, SQL dotaz v databázi
        const { data, error } = await actions.searchPosts({ query: value });
        setLoading(false);

        if (!error && data) {
            setPosts(data as Post[]);
        }
    };

    return (
        <div>
            {/* Vyhledávací pole */}
            <div className="relative mb-6">
                <input
                    type="search"
                    placeholder="Hledat v článcích..."
                    value={query}
                    onInput={(e) => handleSearch((e.target as HTMLInputElement).value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Stav načítání */}
            {loading && (
                <p className="text-gray-400 text-sm mb-4">Hledám na serveru...</p>
            )}

            {/* Prázdné výsledky při vyhledávání */}
            {!loading && posts.length === 0 && query && (
                <p className="text-gray-500">Žádné články neodpovídají hledanému výrazu.</p>
            )}

            {/* Mřížka článků */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                    <a
                        key={post.id}
                        href={`/blog/${post.slug}?from=${currentPage}`}
                        className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition duration-200"
                    >
                        <h3 className="mb-2 text-xl font-bold tracking-tight text-gray-900">{post.title}</h3>
                        <p className="font-normal text-gray-600">{post.excerpt}</p>
                        <p className="text-xs text-gray-400 mt-2">
                            {new Date(post.created_at).toLocaleDateString('cs-CZ')}
                        </p>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-blue-600 font-medium">Číst více →</span>
                            <span className="flex items-center gap-1 text-sm text-gray-400">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                {post.likes}
                            </span>
                        </div>
                    </a>
                ))}
            </div>

            {/*
                Stránkovací navigace — zobrazí se pouze tehdy, když uživatel NEhledá.
                Navigace je realizována jako <a> odkazy (ne onClick), takže každá stránka
                má vlastní URL (/blog?page=2) a lze ji sdílet, přejít zpět atd.
            */}
            {!isSearching && totalPages > 1 && (
                <nav className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                    {/* Tlačítko "Předchozí" — neaktivní na první stránce */}
                    {currentPage > 1 ? (
                        <a
                            href={currentPage === 2 ? '/blog' : `/blog?page=${currentPage - 1}`}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-blue-300 transition"
                        >
                            ← Předchozí
                        </a>
                    ) : (
                        <span className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed">
                            ← Předchozí
                        </span>
                    )}

                    {/* Indikátor aktuální stránky a celkového počtu */}
                    <span className="text-sm text-gray-500">
                        Stránka {currentPage} z {totalPages}
                        <span className="hidden sm:inline"> ({totalCount} článků celkem)</span>
                    </span>

                    {/* Tlačítko "Další" — neaktivní na poslední stránce */}
                    {currentPage < totalPages ? (
                        <a
                            href={`/blog?page=${currentPage + 1}`}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-blue-300 transition"
                        >
                            Další →
                        </a>
                    ) : (
                        <span className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed">
                            Další →
                        </span>
                    )}
                </nav>
            )}

            {/* Při vyhledávání zobrazíme info, že stránkování není aktivní */}
            {isSearching && (
                <p className="mt-6 text-xs text-gray-400 text-center">
                    Při vyhledávání se zobrazují všechny odpovídající články (stránkování je vypnuto).
                </p>
            )}
        </div>
    );
}

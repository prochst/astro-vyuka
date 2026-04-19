// BlogSearch.tsx — React komponenta pro serverové vyhledávání článků.
//
// SERVEROVÉ vyhledávání: uživatel zadá dotaz → React zavolá Astro Action →
// server provede SQL dotaz v databázi → vrátí výsledky → React překreslí seznam.
//
// Výhody oproti statickému filtrování:
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
}

export default function BlogSearch({ initialPosts }: Props) {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

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

            {/* Výsledky */}
            {!loading && posts.length === 0 && query && (
                <p className="text-gray-500">Žádné články neodpovídají hledanému výrazu.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                    <a
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition duration-200"
                    >
                        <h3 className="mb-2 text-xl font-bold tracking-tight text-gray-900">{post.title}</h3>
                        <p className="font-normal text-gray-600">{post.excerpt}</p>
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
        </div>
    );
}

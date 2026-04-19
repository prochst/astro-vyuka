# Jak funguje tato Astro aplikace

Tato aplikace je portfolio web s blogem a galerií. Slouží jako učební projekt pro pochopení
frameworku [Astro](https://astro.build). Níže jsou vysvětleny všechny klíčové koncepty,
které jsou v projektu použity.

---

## Struktura projektu

```
src/
├── actions/        # Serverové funkce volatelné z prohlížeče (Astro Actions)
├── assets/         # Obrázky zpracovávané Astrem při buildu
├── components/     # Znovupoužitelné části UI
├── content/        # Content Collections — strukturovaná data ve formátu JSON/Markdown
│   └── skills/     # Kategorie dovedností (jazyky.json, frameworky.json, ostatni.json)
├── db/             # Databázové připojení, typy a dotazy
├── layouts/        # Šablony stránek (HTML kostra)
├── pages/          # Každý soubor zde = jedna URL adresa
└── styles/         # Globální CSS
```

---

## Klíčové koncepty Astra

### 1. Stránky jako soubory (`src/pages/`)

Astro používá **souborový routing** — každý `.astro` soubor v `src/pages/` automaticky
vytváří URL adresu. Nepotřebuješ žádnou konfiguraci routeru.

```
src/pages/index.astro    →  /
src/pages/blog.astro     →  /blog
src/pages/galerie.astro  →  /galerie
src/pages/blog/[slug].astro  →  /blog/cokoliv  (dynamická cesta)
src/pages/404.astro      →  automaticky pro neexistující URL
```

---

### 2. Frontmatter — kód na serveru

Každý `.astro` soubor začíná blokem odděleným `---`. Říká se mu **frontmatter**.
Kód uvnitř se spustí **pouze na serveru** (nebo při buildu) — nikdy se neodesílá
do prohlížeče.

```astro
---
// Toto běží na serveru
import { getAllPosts } from "../db/schema";
const posts = getAllPosts(); // volání databáze
---

<!-- Toto je HTML šablona. Proměnné z frontmatteru jsou dostupné zde -->
<h1>{posts.length} článků</h1>
```

---

### 3. Hybridní renderování (`output: 'static'` + `prerender: false`)

Astro ve výchozím nastavení generuje **statické HTML soubory** při buildu. To je rychlé
a nenáročné na hosting.

Ale některé stránky potřebují data v reálném čase (např. počet lajků). Pro ně lze
přepnout na **serverové renderování** — stránka se vygeneruje až při každém požadavku.

```js
// astro.config.mjs
output: 'static'  // výchozí: vše staticky
```

```astro
---
// src/pages/blog/[slug].astro
export const prerender = false; // tato stránka: serverová výjimka
---
```

**V tomto projektu:**
| Stránka | Režim | Důvod |
|---|---|---|
| `/` | statická | obsah se nemění |
| `/blog` | **serverová** | serverové vyhledávání vyžaduje server |
| `/blog/[slug]` | **serverová** | zobrazuje aktuální počet lajků |
| `/galerie` | statická | fotky se nemění, filtrování probíhá v prohlížeči |

---

### 4. Layouty — DRY princip pro HTML kostru

Místo opakování `<html>`, `<head>`, navigace a patičky na každé stránce
existuje jeden soubor `Layout.astro`. Stránky do něj vkládají svůj obsah
pomocí `<slot />`.

```astro
<!-- Layout.astro -->
<html>
  <body>
    <nav>...</nav>
    <main>
      <slot />  ← zde se vloží obsah stránky
    </main>
  </body>
</html>
```

```astro
<!-- index.astro -->
<Layout title="Domů">
  <h1>Ahoj!</h1>  ← toto skončí uvnitř <slot />
</Layout>
```

---

### 5. Komponenty a Props

`.astro` soubory fungují jako komponenty — přijímají data přes **props** (vlastnosti)
a vykreslují HTML. TypeScript interface `Props` zajišťuje typovou bezpečnost.

```astro
---
// Card.astro
interface Props {
  title: string;
  likes?: number; // otazník = nepovinné
}
const { title, likes } = Astro.props;
---
<div>{title}</div>
```

---

### 6. Dynamická cesta `[slug].astro`

Hranaté závorky v názvu souboru označují **parametr URL**. Hodnota parametru
je dostupná přes `Astro.params`.

```astro
---
// blog/[slug].astro  →  URL: /blog/muj-clanek
const { slug } = Astro.params; // slug = "muj-clanek"
const post = db.prepare("SELECT * FROM posts WHERE slug = ?").get(slug);

// Pokud článek neexistuje, vrátíme HTTP 404
if (!post) return new Response(null, { status: 404 });
---
```

---

### 7. Zpracování obrázků (`astro:assets`)

Astro má vestavěný systém pro optimalizaci obrázků. Komponenta `<Image>` automaticky:
- převede obrázky do moderního formátu (WebP)
- vygeneruje správné rozměry
- přidá `width`/`height` atributy (prevence CLS — skákání layoutu)

```astro
import { Image, getImage } from "astro:assets";

<!-- Náhled 300×300 pro galerii -->
<Image src={imageLoader()} width={300} height={300} alt="..." />
```

`getImage()` vrátí zpracovanou URL bez vygenerování HTML tagu — použijeme ji
pro lightbox (zobrazení v plné velikosti).

`import.meta.glob()` je funkce Vite (nástroje pod Astrem), která načte skupinu souborů
podle vzoru — zde všechny obrázky ze složky `src/assets/`.

---

### 8. Astro Actions — serverové funkce

Actions jsou **typově bezpečné serverové funkce**, které lze volat přímo z prohlížeče.
Astro se postará o HTTP vrstvu automaticky — nemusíš psát fetch, API endpoint, ani řešit CORS.

```ts
// src/actions/index.ts
export const server = {
  likePost: defineAction({
    input: z.object({ slug: z.string() }), // validace vstupu pomocí Zod
    handler: async ({ slug }) => {
      // tento kód běží pouze na serveru
      const result = db.prepare("UPDATE posts SET likes = likes + 1 WHERE slug = ? RETURNING likes").get(slug);
      return result.likes;
    },
  }),
};
```

```ts
// v prohlížeči (React komponenta)
const { data, error } = await actions.likePost({ slug });
```

---

### 9. React komponenty (`client:visible`)

Astro je ve výchozím stavu **čistě statické** — žádný JavaScript se neodesílá
do prohlížeče, pokud to explicitně nevyžádáš. Pro interaktivní části (jako tlačítko
s lajky) lze použít React (nebo Vue, Svelte...).

Direktiva `client:visible` říká Astru: *"načti a spusť JavaScript pro tuto komponentu,
až bude viditelná v prohlížeči."* To šetří výkon — komponenta se nenachová ihned po
načtení stránky.

```astro
<LikeButton client:visible initialLikes={post.likes} slug={post.slug} />
```

Ostatní dostupné direktivy:
- `client:load` — načte ihned po načtení stránky
- `client:idle` — načte až prohlížeč není zaneprázdněn
- `client:media="(max-width: 600px)"` — načte jen při splnění media query

V `LikeButton.tsx` se po kliknutí **okamžitě** zvýší počet lajků v UI —
ještě před odpovědí serveru. Díky tomu aplikace působí svižně.

Pokud server vrátí chybu, UI se vrátí zpět. Pokud uspěje, UI se synchronizuje
s hodnotou ze serveru.

```ts
setLikes(prev => prev + 1); // okamžitý vizuální feedback
setLiked(true);

const { data, error } = await actions.likePost({ slug }); // async volání serveru

if (error) {
  setLikes(prev => prev - 1); // rollback
} else {
  setLikes(data); // synchronizace se serverem
}
```

Funkcionální forma `prev => prev + 1` je bezpečnější než `likes + 1` —
zabraňuje problému se "zastaralou hodnotou" (stale closure) v asynchronních funkcích.

---

### 10. Stránka 404 (`src/pages/404.astro`)

Astro automaticky použije soubor `404.astro` pro všechny URL, které nevedou na žádnou stránku.
Žádná konfigurace není potřeba — stačí vytvořit soubor se správným názvem.

Soubor zachytí i programatické 404 odpovědi:

```astro
// blog/[slug].astro
if (!post) return new Response(null, { status: 404 }); // → zobrazí 404.astro
```

---

### 11. Aktivní odkaz v navigaci

`Astro.url.pathname` obsahuje aktuální cestu požadavku. V `Layout.astro` ho využíváme
pro dynamické CSS třídy navigačních odkazů.

```ts
const pathname = Astro.url.pathname;

function navClass(href: string, exact = false): string {
    const isActive = exact ? pathname === href : pathname.startsWith(href);
    return isActive ? 'font-bold text-blue-600' : 'text-gray-600 hover:text-blue-600';
}
```

- `exact: true` pro `/` — aby se neoznačovala jako aktivní na `/blog`
- `startsWith` pro `/blog` — odkaz zůstane aktivní i na `/blog/muj-clanek`

---

### 12. Content Collections

Content Collections jsou vestavěný systém Astra pro správu strukturovaných dat
(JSON, Markdown, YAML). Schéma definované pomocí **Zod** validuje data při buildu —
pokud soubor neodpovídá schématu, build okamžitě selže s jasnou chybou.

```ts
// src/content.config.ts
const skills = defineCollection({
    loader: glob({ pattern: '*.json', base: './src/content/skills' }),
    schema: z.object({
        category: z.string(),
        items: z.array(z.object({
            name: z.string(),
            level: z.number().min(0).max(100), // validace rozsahu
        })),
    }),
});
```

```ts
// v .astro souboru
const skillsEntries = await getCollection('skills');
// entry.data je plně typovaný dle schématu výše
```

Data jsou uložena v `src/content/skills/*.json` — oddělena od kódu, snadno editovatelná.

---

### 13. Dva přístupy k vyhledávání

Projekt demonstruje oba základní způsoby vyhledávání/filtrování:

#### Serverové vyhledávání — Blog (`/blog`)

Uživatel píše → React volá Astro Action → server provede SQL dotaz → výsledky

```ts
// Astro Action na serveru
searchPosts: defineAction({
    input: z.object({ query: z.string() }),
    handler: async ({ query }) => {
        const pattern = `%${query}%`;
        return db.prepare(
            'SELECT ... FROM posts WHERE title LIKE ? OR content LIKE ?'
        ).all(pattern, pattern);
    },
})
```

```tsx
// React komponenta v prohlížeči
const { data } = await actions.searchPosts({ query: value });
```

**Výhody:** prohledává celý obsah článků, vhodné pro velké množství dat, logika na serveru.

#### Statické vyhledávání — Galerie (`/galerie`)

Při buildu se každé fotce vygeneruje `data-title` atribut do HTML.
JavaScript v prohlížeči pak filtruje DOM elementy — žádný server není potřeba.

```html
<!-- vygenerované HTML -->
<div class="gallery-item" data-title="krásná příroda">...</div>
```

```js
// JavaScript v prohlížeči
galleryItems.forEach(item => {
    item.style.display = item.dataset.title?.includes(query) ? '' : 'none';
});
```

**Výhody:** okamžitá odezva, funguje offline, bez HTTP požadavků.
**Nevýhody:** všechna data musí být v HTML (nevhodné pro tisíce záznamů).

---


### 14. Databáze (better-sqlite3)

Projekt používá SQLite přes knihovnu `better-sqlite3`. Jde o souborovou databázi —
celá databáze je uložena v jednom souboru `portfolio.db`.

`db.prepare()` se volá jednou na úrovni modulu (ne uvnitř každé funkce). Připravený
statement se pak opakovaně spouští bez nutnosti znovu parsovat SQL — je to rychlejší.

```ts
// schema.ts — prepare jednou, spouštěj vícekrát
const getAllPostsStmt = db.prepare('SELECT * FROM posts ORDER BY created_at DESC');

export function getAllPosts() {
  return getAllPostsStmt.all();
}
```

---

### 15. Stránkování (Pagination)

Stránkování rozděluje velký seznam položek do více stránek, aby stránka nenačítala
zbytečně velké množství dat.

#### Princip: URL query parametry

Protože blog je serverově renderovaný (`prerender = false`), stránkování funguje
přes **URL query parametry**: `/blog?page=2`, `/blog?page=3`. Každá stránka má svou
vlastní URL — lze ji sdílet, uložit do záložek, a funguje i přepnutí zpět v prohlížeči.

```
/blog        → stránka 1 (výchozí)
/blog?page=2 → stránka 2
/blog?page=3 → stránka 3
```

Na rozdíl od Astro `paginate()` helperu (který funguje jen pro statické stránky), tento
přístup funguje na serveru a přirozeně se kombinuje s vyhledáváním.

#### Výpočet LIMIT / OFFSET v SQL

SQL vrací jen záznamy pro aktuální stránku pomocí `LIMIT` a `OFFSET`:

```ts
// schema.ts
const PER_PAGE = 4;

// stránka 1: LIMIT 4 OFFSET 0  → záznamy 1–4
// stránka 2: LIMIT 4 OFFSET 4  → záznamy 5–8
// stránka 3: LIMIT 4 OFFSET 8  → záznamy 9–12
const getPaginatedPostsStmt = db.prepare(
    'SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?'
);

export function getPaginatedPosts(page: number, perPage: number): Post[] {
    const offset = (page - 1) * perPage;
    return getPaginatedPostsStmt.all(perPage, offset) as Post[];
}
```

#### Čtení čísla stránky v Astru

`Astro.url.searchParams` je standardní Web API — dostupné na serverově renderovaných
stránkách v runtime:

```ts
// blog.astro
const pageParam = Astro.url.searchParams.get('page');
const currentPage = Math.max(1, parseInt(pageParam ?? '1') || 1);
const totalCount = getPostsCount();
const totalPages = Math.ceil(totalCount / PER_PAGE);
const posts = getPaginatedPosts(currentPage, PER_PAGE);
```

#### Navigační tlačítka v React komponentě

Stránkovací navigace používá `<a>` tagy (ne `onClick`), protože stránkování mění URL
a tím způsobuje nové načtení stránky se serverem:

```tsx
// BlogSearch.tsx
<a href={`/blog?page=${currentPage + 1}`}>Další →</a>
<a href={currentPage === 2 ? '/blog' : `/blog?page=${currentPage - 1}`}>← Předchozí</a>
```

Poznámka: `/blog?page=1` by také fungovalo, ale pro čistotu používáme `/blog` (bez parametru).

#### Koexistence vyhledávání a stránkování

Při aktivním vyhledávání vrátí server **všechny** odpovídající výsledky (bez stránkování),
protože `searchPosts` Action provede SQL dotaz bez `LIMIT`. React komponenta pak skryje
stránkovací navigaci pomocí příznaku `isSearching`:

```tsx
const isSearching = query.trim().length > 0;
{!isSearching && totalPages > 1 && <nav>...</nav>}
```

#### Nejnovější články na úvodní stránce

Úvodní stránka zobrazuje jen 2 nejnovější články pomocí `getRecentPosts(2)` — SQLite
funkce s `LIMIT`. Pod výpisem je tlačítko "Zobrazit další" odkazující na `/blog`.

```ts
// schema.ts
const getRecentPostsStmt = db.prepare(
    'SELECT * FROM posts ORDER BY created_at DESC LIMIT ?'
);
export function getRecentPosts(limit: number): Post[] {
    return getRecentPostsStmt.all(limit) as Post[];
}
```

---

## Tok dat při načtení stránky `/blog/muj-clanek`

```
Prohlížeč                   Astro server              Databáze
    │                             │                       │
    │  GET /blog/muj-clanek       │                       │
    │────────────────────────────>│                       │
    │                             │  SELECT * WHERE slug  │
    │                             │──────────────────────>│
    │                             │       post data       │
    │                             │<──────────────────────│
    │                             │                       │
    │                             │  vyrenderuje HTML     │
    │       HTML stránka          │                       │
    │<────────────────────────────│                       │
    │                             │                       │
    │  (React hydratace)          │                       │
    │  LikeButton se aktivuje     │                       │
    │                             │                       │
    │  [uživatel klikne Líbí se]  │                       │
    │                             │                       │
    │  POST /_actions/likePost    │                       │
    │────────────────────────────>│                       │
    │                             │  UPDATE posts ...     │
    │                             │──────────────────────>│
    │                             │       nový počet      │
    │                             │<──────────────────────│
    │       { data: 42 }          │                       │
    │<────────────────────────────│                       │
```

---

## Spuštění projektu

```bash
# Instalace závislostí
npm install

# Naplnění databáze testovacími daty (jednorázově)
npm run seed

# Vývojový server
npm run dev

# Produkční build
npm run build
npm run preview
```

// src/db/seed.ts
// Spusť jednorázově: npx tsx src/db/seed.ts
import db from './database';

const postCount = (db.prepare('SELECT COUNT(*) as count FROM posts').get() as { count: number }).count;

if (postCount === 0) {
    console.log('Vkládám testovací články...');
    const insertPost = db.prepare('INSERT INTO posts (title, slug, excerpt, content, created_at) VALUES (?, ?, ?, ?, ?)');

    // Náhodné datum z posledního měsíce (od 19. 3. 2026 do 19. 4. 2026)
    function randomRecentDate(): string {
        const now = new Date('2026-04-19T23:59:59Z');
        const monthAgo = new Date('2026-03-19T00:00:00Z');
        const ms = monthAgo.getTime() + Math.random() * (now.getTime() - monthAgo.getTime());
        return new Date(ms).toISOString().replace('T', ' ').slice(0, 19);
    }

    insertPost.run(
        'Můj první článek v Astru',
        'muj-prvni-clanek-v-astru',
        'Astro je úžasně rychlý framework. Pojďme se podívat proč.',
        'Zde by byl dlouhý text o tom, jak skvělé je Astro a jak se v něm vyvíjí...',
        randomRecentDate()
    );

    insertPost.run(
        'Proč jsem si vybral Tailwind',
        'proc-jsem-si-vybral-tailwind',
        'Utility-first CSS mění způsob, jakým přemýšlíme o designu.',
        'Dříve jsem psal stovky řádků v CSS souborech, dnes mi stačí pár tříd přímo v HTML...',
        randomRecentDate()
    );

    insertPost.run(
        'Výhody TypeScriptu',
        'vyhody-typescriptu',
        'TypeScript přináší typovou bezpečnost do JavaScriptu a výrazně zlepšuje kvalitu kódu.',
        'TypeScript je nadmnožina JavaScriptu, která přidává statické typování. Díky němu odhalíte většinu chyb ještě před spuštěním aplikace, přímo v editoru. Intellisense vám napovídá názvy metod a vlastností, refaktoring je bezpečnější a kód je čitelnější pro celý tým. TypeScript dnes podporují všechny hlavní frameworky včetně Astro, React nebo Vue. Pokud ho ještě nepoužíváte, je nejvyšší čas začít.',
        randomRecentDate()
    );

    insertPost.run(
        'Použití Content Collections v Astru',
        'pouziti-content-collections-v-astru',
        'Content Collections jsou elegantní způsob, jak spravovat strukturovaný obsah v Astru.',
        'Astro Content Collections umožňují definovat schéma pro vaše Markdown nebo JSON soubory a automaticky je validovat. Stačí vytvořit složku src/content/, přidat konfiguraci v content.config.ts a Astro se postará o zbytek. Získáte plnou typovou bezpečnost, automatické generování slugů i pohodlné dotazování pomocí getCollection(). Ideální pro blogy, dokumentaci nebo produktové katalogy.',
        randomRecentDate()
    );

    insertPost.run(
        'Kdy použít v Astru SQLite',
        'kdy-pouzit-v-astru-sqlite',
        'SQLite je nenápadná, ale výkonná databáze — a v Astru ji lze snadno zapojit přes better-sqlite3.',
        'Pokud potřebujete v Astru persistentní data — například lajky, komentáře nebo statistiky — SQLite je skvělá volba pro menší projekty. Není třeba provozovat žádný databázový server. Soubor .db leží přímo ve vašem projektu. S knihovnou better-sqlite3 zvládnete synchronní operace bez callbacků. SQLite má smysl tehdy, kdy data přesahují možnosti statických souborů, ale provoz plnohodnotné databáze by byl zbytečně složitý.',
        randomRecentDate()
    );

    insertPost.run(
        'Co je em dash a proč na něm záleží',
        'co-je-em-dash-a-proc-na-nem-zalezi',
        'Pomlčka em dash (—) je typografický znak, který profesionálním textům dodává správnou úroveň.',
        'Em dash (—) je dlouhá pomlčka pojmenovaná podle šířky písmene M. Na rozdíl od spojovníku (-) nebo en dashe (–) se používá k oddělení vedlejší myšlenky nebo výčtu — podobně jako závorky, ale s větším důrazem. V češtině ji využijete například místo dvojtečky nebo pro dramatický předěl ve větě. Na klávesnici ji zadáte jako HTML entitu &mdash; nebo Unicode U+2014. Správné použití typografických znaků text vizuálně povyšuje.',
        randomRecentDate()
    );

    insertPost.run(
        'Astro a emDash — nový WordPress',
        'astro-a-emdash',
        'emDash je žhavou novinkou (představenou v dubnu 2026 společností Cloudflare), která se otevřeně profiluje jako „duchovní nástupce WordPressu“',
        'Jde o open-source CMS postavený na moderních technologiích, který se snaží vyřešit největší bolesti starších systémů – především bezpečnost pluginů a pomalou architekturu. Jádrem je Astro, což zaručuje extrémně rychlé načítání stránek (díky efektivnímu vykreslování obsahu).',
        randomRecentDate()
    );

    insertPost.run(
        'Nové trendy v JS frameworcích',
        'nove-trendy-v-js-frameworcich',
        'Svět JavaScriptových frameworků se rychle vyvíjí — co přinášejí nejnovější trendy?',
        'V posledních letech se JS ekosystém výrazně proměnil. React stále dominuje, ale výzvy přicházejí od Svelte, Solid.js a samozřejmě Astro. Velký trend je přesun výpočtů na server — React Server Components, Astro Islands nebo Qwik resumability. Bundlery jako Vite nahradily Webpack a Turbopack slibuje ještě rychlejší buildy. Typová bezpečnost přes TypeScript a Zod je dnes standard. Vývojáři chtějí méně JavaScriptu v prohlížeči a více výkonu — a frameworky jim to konečně umožňují.',
        randomRecentDate()
    );

    insertPost.run(
        'Tailwind kontra Bootstrap — co vybrat v roce 2025',
        'tailwind-kontra-bootstrap-co-vybrat-v-roce-2025',
        'Tailwind a Bootstrap jsou dvě nejpopulárnější CSS knihovny. Která z nich je pro váš projekt lepší?',
        'Bootstrap nabízí hotové komponenty a konzistentní design systém — ideální pro rychlé prototypy nebo týmy bez dedikovaného designéra. Tailwind jde opačnou cestou: dává vám utility třídy a plnou kontrolu nad vzhledem. Nemusíte bojovat s přepisováním výchozích stylů. Výsledný CSS je menší díky PurgeCSS. Tailwind lépe spolupracuje s komponentovými frameworky jako React nebo Astro. Bootstrap je stále vhodný pro interní nástroje a dashboardy. Pro nové projekty s vlastním designem doporučujeme Tailwind.',
        randomRecentDate()
    );

    insertPost.run(
        'Moderní UI a Astro — jak stavět krásné weby',
        'moderni-ui-a-astro-jak-stavět-krasne-weby',
        'Astro je ideální platforma pro moderní, výkonné a vizuálně přitažlivé weby.',
        'Moderní UI se vyznačuje rychlostí, přístupností a čistým designem. Astro k tomu přispívá hned několika způsoby: minimálním JavaScriptem, podporou Tailwindu, jednoduchým načítáním fontů a obrázků přes vestavěné optimalizace. Komponenty lze psát v libovolném frameworku — React, Vue, Svelte — a kombinovat je na jedné stránce díky Islands architektuře. Pro animace poslouží View Transitions API, které Astro nativně podporuje. Výsledkem je web, který vypadá skvěle, rychle se načítá a je radost ho vyvíjet.',
        randomRecentDate()
    );
}

const photoCount = (db.prepare('SELECT COUNT(*) as count FROM photos').get() as { count: number }).count;

if (photoCount === 0) {
    console.log('Vkládám testovací fotky...');
    const insertPhoto = db.prepare('INSERT INTO photos (title, filename) VALUES (?, ?)');
    insertPhoto.run('Hvězda z nosů', 'fotka1.jpg');
    insertPhoto.run('Snídaně vrabců', 'fotka2.jpg');
    insertPhoto.run('Kapka rosy v zelené', 'fotka3.jpg');
    insertPhoto.run('Houbičky na pařezu', 'fotka4.jpg');
    insertPhoto.run('Boruček', 'fotka5.jpg');
}

console.log('Seed dokončen.');

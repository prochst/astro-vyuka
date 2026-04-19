// src/db/seed.ts
// Spusť jednorázově: npx tsx src/db/seed.ts
import db from './database';

const postCount = (db.prepare('SELECT COUNT(*) as count FROM posts').get() as { count: number }).count;

if (postCount === 0) {
    console.log('Vkládám testovací články...');
    const insertPost = db.prepare('INSERT INTO posts (title, slug, excerpt, content) VALUES (?, ?, ?, ?)');

    insertPost.run(
        'Můj první článek v Astru',
        'muj-prvni-clanek-v-astru',
        'Astro je úžasně rychlý framework. Pojďme se podívat proč.',
        'Zde by byl dlouhý text o tom, jak skvělé je Astro a jak se v něm vyvíjí...'
    );

    insertPost.run(
        'Proč jsem si vybral Tailwind',
        'proc-jsem-si-vybral-tailwind',
        'Utility-first CSS mění způsob, jakým přemýšlíme o designu.',
        'Dříve jsem psal stovky řádků v CSS souborech, dnes mi stačí pár tříd přímo v HTML...'
    );
}

const photoCount = (db.prepare('SELECT COUNT(*) as count FROM photos').get() as { count: number }).count;

if (photoCount === 0) {
    console.log('Vkládám testovací fotky...');
    const insertPhoto = db.prepare('INSERT INTO photos (title, filename) VALUES (?, ?)');
    insertPhoto.run('Krásná příroda', 'fotka1.jpg');
    insertPhoto.run('Městská architektura', 'fotka2.jpg');
}

console.log('Seed dokončen.');

// database.ts — inicializace SQLite databáze.
// Tento soubor se importuje všude, kde je potřeba přistoupit k DB.
// Exportuje jedinou sdílenou instanci připojení (singleton).
import Database from 'better-sqlite3';

// Otevře (nebo vytvoří) soubor portfolio.db v kořeni projektu
const db = new Database('portfolio.db');

// WAL (Write-Ahead Logging) = režim zápisů lepší pro souběžný přístup.
// Umožňuje čtení i během zápisu, což zvyšuje výkon.
db.pragma('journal_mode = WAL');

// Vytvoří tabulky, pokud ještě neexistují.
// IF NOT EXISTS zajistí, že se příkaz bezpečně spustí při každém startu
// a nic nepřepíše, pokud tabulky již existují.
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;
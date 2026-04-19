// src/actions/index.ts
import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import db from '../db/database';

export const server = {
    // Definujeme akci s názvem 'likePost'
    likePost: defineAction({
        // 1. Validace vstupu: očekáváme objekt se 'slug' typu string
        input: z.object({
            slug: z.string(),
        }),
        // 2. Samotná logika, která běží pouze na serveru
        handler: async (input) => {
            const stmt = db.prepare(`
        UPDATE posts 
        SET likes = likes + 1 
        WHERE slug = ? 
        RETURNING likes
      `);

            const result = stmt.get(input.slug) as { likes: number } | undefined;

            if (!result) {
                throw new Error('Článek nenalezen');
            }

            // Vrátíme novou hodnotu (Astro ji automaticky zabalí do JSONu)
            return result.likes;
        },
    }),

    // Serverové vyhledávání článků.
    // Na rozdíl od statického (client-side) filtrování se dotaz provede na serveru
    // v databázi — vhodné pro velké množství dat nebo fulltextové vyhledávání.
    searchPosts: defineAction({
        input: z.object({
            query: z.string(),
        }),
        handler: async ({ query }) => {
            // SQL LIKE s % = "obsahuje hledaný výraz" (case-insensitive v SQLite)
            // Parametr je escapován automaticky — ochrana před SQL injection.
            const stmt = db.prepare(`
                SELECT id, title, slug, excerpt, likes, created_at
                FROM posts
                WHERE title LIKE ? OR excerpt LIKE ? OR content LIKE ?
                ORDER BY created_at DESC
            `);
            const pattern = `%${query}%`;
            return stmt.all(pattern, pattern, pattern);
        },
    }),
};
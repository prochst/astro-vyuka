// src/content.config.ts — definice Content Collections pro Astro 5.
//
// Content Collections jsou vestavěný systém Astra pro správu strukturovaného obsahu.
// Schéma (z) validuje data při buildu — pokud soubor neodpovídá schématu,
// Astro okamžitě ohlásí chybu. Žádná neplatná data se nedostanou do aplikace.
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const skills = defineCollection({
    // glob loader načte všechny JSON soubory ze složky src/content/skills/
    loader: glob({ pattern: '*.json', base: './src/content/skills' }),
    // Schéma popisuje, jak musí každý soubor vypadat
    schema: z.object({
        category: z.string(),           // název kategorie (např. "Jazyky")
        items: z.array(z.object({
            name: z.string(),           // název technologie
            level: z.number().min(0).max(100), // úroveň znalosti v procentech
        })),
    }),
});

export const collections = { skills };

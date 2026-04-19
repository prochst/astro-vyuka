// LikeButton.tsx — React komponenta pro tlačítko "Líbi se mi".
//
// Používáme React protože potřebujeme INTERAKTIVITU na straně prohlížeče
// (kliknutí, okamžitá změna UI bez načtení stránky).
// Čisté Astro komponenty jsou statické — nezvládají stavové (state) operace.
import { actions } from 'astro:actions';
import { useState } from 'react';

interface Props {
    initialLikes: number; // počet lajků předaný ze serveru při vykreslení stránky
    slug: string;         // identifikátor článku pro volání akce
}

export default function LikeButton({ initialLikes, slug }: Props) {
    // useState — lokální stav komponenty. Při změně se UI automaticky překresli.
    const [likes, setLikes] = useState(initialLikes);
    const [liked, setLiked] = useState(false); // zabrání vícenásobnému kliknutí

    const handleLike = async () => {
        if (liked) return; // idempotence: jeden uživatel = jeden lajk

        // Optimistický update: UI se aktualizuje okamžitě, ještě před odpovědí serveru.
        // To dévá okamžitý vizuelní feedback a aplikace působí svile.
        // Funkcionální forma (prev =>) je bezpečnější než přímé použití likes+1,
        // protože zabrní "stale closure" problému v asynchronních funkcích.
        setLikes(prev => prev + 1);
        setLiked(true);

        // Volání Astro Action — funguje jako přímé volání funkce,
        // interně však jde o HTTP POST na /_actions/likePost.
        const { data, error } = await actions.likePost({ slug });

        if (error) {
            console.error("Akce selhala:", error);
            // Rollback: pokud server selhal, vrátíme UI do původního stavu.
            setLikes(prev => prev - 1);
            setLiked(false);
        } else {
            // Synchronizace: nahradíme optimistickou hodnotu skutečnou ze serveru.
            setLikes(data);
        }
    };

    return (
        <button
            onClick={handleLike}
            disabled={liked}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors border ${liked
                ? 'bg-red-50 text-red-600 border-red-200 cursor-default'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 cursor-pointer'
                }`}
        >
            <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
            {likes} Líbí se mi
        </button>
    );
}
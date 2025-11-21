import Image from 'next/image';
import type { SliderItem } from '@/lib/supabase';

interface GameCardProps {
    item: SliderItem;
    index: number;
    isFiller?: boolean;
}

export default function GameCard({ item, index, isFiller = false }: GameCardProps) {
    let cardColor = '#2D3035';
    if (isFiller) {
        cardColor = '#F95146';
    } else if (index % 3 === 0) {
        cardColor = '#00C74D';
    }

    return (
        <div
            className="flex flex-col items-center justify-between rounded-lg overflow-hidden flex-shrink-0"
            style={{
                width: '240px',
                height: '340px',
                backgroundColor: cardColor,
                border: '2px solid rgba(255, 255, 255, 0.52)',
                padding: '8px',
            }}
        >
            {isFiller ? (
                <div className="flex items-center justify-center h-full w-full px-2 mt-1">
                    <div
                        className="text-white font-extrabold text-4xl text-center leading-tight overflow-hidden text-ellipsis line-clamp-3 "
                        style={{
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                            letterSpacing: '0.05em'
                        }}
                    >
                        {item.title}
                    </div>
                </div>
            ) : (
                <>
                    <div className="text-white text-2xl font-semibold text-center leading-tight overflow-hidden text-ellipsis line-clamp-3 mt-2">
                        {item.title}
                    </div>
                    <div className="relative flex-shrink-0 w-full h-full" style={{ width: '100%', height: '170px' }}>
                        <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            className="object-contain"
                            unoptimized
                        />
                    </div>

                    <div className="bg-red-600 text-white text-3xl font-bold px-6 py-1 rounded-full shadow-lg mt-1">
                        {item.price} лв
                    </div>
                </>
            )}
        </div>
    );
}

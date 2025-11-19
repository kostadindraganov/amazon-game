import { SliderItem } from '@/lib/supabase';
import GameCard from './GameCard';

interface IdleProductShowcaseProps {
    products: SliderItem[];
}

export default function IdleProductShowcase({ products }: IdleProductShowcaseProps) {
    // Ensure we have products to show
    if (!products || products.length === 0) return null;

    return (
        <div className="w-full h-full flex items-center">
            {/* Marquee Container */}
            <div className="flex">
                <div className="flex animate-marquee shrink-0">
                    {products.map((item, index) => (
                        <div key={`g1-${item.id}-${index}`} className="mx-4">
                            <GameCard item={item} index={index} />
                        </div>
                    ))}
                </div>
                <div className="flex animate-marquee shrink-0">
                    {products.map((item, index) => (
                        <div key={`g2-${item.id}-${index}`} className="mx-4">
                            <GameCard item={item} index={index} />
                        </div>
                    ))}
                </div>
                {/* Third set to ensure no gaps on wide screens if products are few */}
                <div className="flex animate-marquee shrink-0">
                    {products.map((item, index) => (
                        <div key={`g3-${item.id}-${index}`} className="mx-4">
                            <GameCard item={item} index={index} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

import MediaCard from '@/components/common/media-card';
import { Movie, TVShow } from '@/lib/movies';

interface MediaSectionProps {
  title: string;
  items: (Movie | TVShow)[];
}

export default function MediaSection({ title, items }: MediaSectionProps) {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4">
            {items.map((item, index) => (
              <MediaCard
                key={item.id}
                item={item}
                priority={index < 4}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

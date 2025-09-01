import Image from 'next/image';
import { 
  getTrendingMovies, 
  getPopularMovies, 
  getMoviesInTheaters, 
  getTrendingTVShows,
  getImageUrl 
} from '@/lib/movies';

export default async function TestPage() {
  try {
    const [trendingMovies, popularMovies, inTheaters, trendingTVShows] = await Promise.all([
      getTrendingMovies(),
      getPopularMovies(),
      getMoviesInTheaters(),
      getTrendingTVShows()
    ]);

    return (
      <div className="container mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold mb-8">TMDB API Test Page</h1>
        
        {/* Trending Movies */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Trending Movies (Day)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {trendingMovies.map((movie) => (
              <div key={movie.id} className="border rounded-lg p-4 shadow-sm">
                {movie.poster_path && (
                  <Image 
                    src={getImageUrl(movie.poster_path, 'w300') || ''} 
                    alt={movie.title}
                    width={300}
                    height={450}
                    className="w-full h-64 object-cover rounded mb-2"
                  />
                )}
                <h3 className="font-medium text-sm truncate">{movie.title}</h3>
                <p className="text-xs text-gray-600">{movie.release_date}</p>
                <p className="text-xs text-yellow-600">{movie.vote_average.toFixed(1)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Movies */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Popular Movies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {popularMovies.map((movie) => (
              <div key={movie.id} className="border rounded-lg p-4 shadow-sm">
                {movie.poster_path && (
                  <Image 
                    src={getImageUrl(movie.poster_path, 'w300') || ''} 
                    alt={movie.title}
                    width={300}
                    height={450}
                    className="w-full h-64 object-cover rounded mb-2"
                  />
                )}
                <h3 className="font-medium text-sm truncate">{movie.title}</h3>
                <p className="text-xs text-gray-600">{movie.release_date}</p>
                <p className="text-xs text-yellow-600">⭐ {movie.vote_average.toFixed(1)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Movies in Theaters */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Now Playing in Theaters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {inTheaters.map((movie) => (
              <div key={movie.id} className="border rounded-lg p-4 shadow-sm">
                {movie.poster_path && (
                  <Image 
                    src={getImageUrl(movie.poster_path, 'w300') || ''} 
                    alt={movie.title}
                    width={300}
                    height={450}
                    className="w-full h-64 object-cover rounded mb-2"
                  />
                )}
                <h3 className="font-medium text-sm truncate">{movie.title}</h3>
                <p className="text-xs text-gray-600">{movie.release_date}</p>
                <p className="text-xs text-yellow-600">⭐ {movie.vote_average.toFixed(1)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trending TV Shows */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Trending TV Shows (Day)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {trendingTVShows.map((show) => (
              <div key={show.id} className="border rounded-lg p-4 shadow-sm">
                {show.poster_path && (
                  <Image 
                    src={getImageUrl(show.poster_path, 'w300') || ''} 
                    alt={show.name}
                    width={300}
                    height={450}
                    className="w-full h-64 object-cover rounded mb-2"
                  />
                )}
                <h3 className="font-medium text-sm truncate">{show.name}</h3>
                <p className="text-xs text-gray-600">{show.first_air_date}</p>
                <p className="text-xs text-yellow-600">⭐ {show.vote_average.toFixed(1)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4 text-red-600">Error Loading TMDB Data</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p><strong>Error:</strong> {error instanceof Error ? error.message : 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }
}

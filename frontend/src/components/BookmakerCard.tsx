import Link from 'next/link';
import { Bookmaker } from '@/types';

interface BookmakerCardProps {
  bookmaker: Bookmaker;
}

export default function BookmakerCard({ bookmaker }: BookmakerCardProps) {
  return (
    <Link href={`/bookmakers/${bookmaker.slug}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border border-gray-200 h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{bookmaker.name}</h3>
            <div className="flex items-center mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(bookmaker.rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm text-gray-600">{bookmaker.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Features</h4>
          <div className="flex flex-wrap gap-2">
            {bookmaker.features.slice(0, 4).map((feature) => (
              <span
                key={feature}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {feature}
              </span>
            ))}
            {bookmaker.features.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{bookmaker.features.length - 4} more
              </span>
            )}
          </div>
        </div>

        {bookmaker.currentPromotions.length > 0 && (
          <div className="mb-4">
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-sm font-semibold text-green-900 mb-1">
                {bookmaker.currentPromotions[0].title}
              </p>
              <p className="text-xs text-green-700 line-clamp-2">
                {bookmaker.currentPromotions[0].description}
              </p>
            </div>
          </div>
        )}

        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          View Details
        </button>
      </div>
    </Link>
  );
}

'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MapPin, DollarSign, Star } from 'lucide-react';
import { Supplier } from '@/types';
import { getPriceRangeLabel } from '@/lib/utils';
import Image from 'next/image';

interface SupplierCardProps {
  supplier: Supplier;
  showRating?: boolean;
  averageRating?: number;
}

export const SupplierCard: React.FC<SupplierCardProps> = ({
  supplier,
  showRating = false,
  averageRating,
}) => {
  // Get first media image or use placeholder
  // Note: media would need to be loaded separately or included in supplier response
  const coverImage = null; // TODO: Load media separately or include in supplier response

  return (
    <Link href={`/fornecedores/${supplier.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        {/* Cover Image */}
        <div className="relative w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-t-lg overflow-hidden">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={supplier.fantasy_name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold">
              {supplier.fantasy_name.charAt(0).toUpperCase()}
            </div>
          )}
          {showRating && averageRating && averageRating > 0 && (
            <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 flex items-center gap-1 shadow-md">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold">{averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <CardHeader>
          <CardTitle className="line-clamp-1">{supplier.fantasy_name}</CardTitle>
        </CardHeader>
        <CardContent>
          {supplier.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{supplier.description}</p>
          )}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{supplier.city}, {supplier.state}</span>
            </div>
            {supplier.price_range && (
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span>{getPriceRangeLabel(supplier.price_range)}</span>
              </div>
            )}
            {/* Category badge would need category data loaded separately */}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

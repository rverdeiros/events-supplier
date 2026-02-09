'use client';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { X, Filter } from 'lucide-react';
import { Category, PriceRange } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface FilterBarProps {
  city: string;
  state: string;
  categoryId: number | undefined;
  priceRange: PriceRange | undefined;
  orderBy: 'created_at' | 'rating' | undefined;
  categories: Category[];
  onCityChange: (city: string) => void;
  onStateChange: (state: string) => void;
  onCategoryChange: (categoryId: number | undefined) => void;
  onPriceRangeChange: (priceRange: PriceRange | undefined) => void;
  onOrderByChange: (orderBy: 'created_at' | 'rating' | undefined) => void;
  onClearFilters: () => void;
}

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const FilterBar: React.FC<FilterBarProps> = ({
  city,
  state,
  categoryId,
  priceRange,
  orderBy,
  categories,
  onCityChange,
  onStateChange,
  onCategoryChange,
  onPriceRangeChange,
  onOrderByChange,
  onClearFilters,
}) => {
  const activeFiltersCount = [
    city,
    state,
    categoryId,
    priceRange,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0;

  const priceRangeOptions = [
    { value: '', label: 'Todas as faixas' },
    { value: 'low', label: 'Econômico' },
    { value: 'medium', label: 'Médio' },
    { value: 'high', label: 'Alto' },
  ];

  const orderByOptions = [
    { value: 'created_at', label: 'Mais recentes' },
    { value: 'rating', label: 'Melhor avaliados' },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Filtros</h3>
          {hasActiveFilters && (
            <Badge variant="info" size="sm">
              {activeFiltersCount} ativo{activeFiltersCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-sm"
            >
              <X className="w-4 h-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <Input
            label="Cidade"
            placeholder="Digite o nome da cidade..."
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
          />
        </div>

        <Select
          label="Estado"
          options={[
            { value: '', label: 'Todos os estados' },
            ...brazilianStates.map((s) => ({ value: s, label: s })),
          ]}
          value={state}
          onChange={(e) => onStateChange(e.target.value)}
        />

        <Select
          label="Categoria"
          options={[
            { value: '', label: 'Todas as categorias' },
            ...categories.map((cat) => ({ value: cat.id.toString(), label: cat.name })),
          ]}
          value={categoryId?.toString() || ''}
          onChange={(e) => onCategoryChange(e.target.value ? parseInt(e.target.value) : undefined)}
        />

        <Select
          label="Ordenar por"
          options={orderByOptions}
          value={orderBy || 'created_at'}
          onChange={(e) => onOrderByChange(e.target.value as 'created_at' | 'rating' | undefined)}
        />
      </div>

      {/* Price Range - Separate row */}
      <div className="mt-4">
        <Select
          label="Faixa de preço"
          options={priceRangeOptions}
          value={priceRange || ''}
          onChange={(e) => onPriceRangeChange(e.target.value ? (e.target.value as PriceRange) : undefined)}
        />
      </div>
    </div>
  );
};

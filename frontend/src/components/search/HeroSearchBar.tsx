'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';

interface HeroSearchBarProps {
  placeholder?: string;
  onSearch?: (searchTerm: string) => void;
  className?: string;
  initialValue?: string;
}

export const HeroSearchBar = ({ 
  placeholder = 'Busque aqui seus fornecedores',
  onSearch,
  className = '',
  initialValue = ''
}: HeroSearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const router = useRouter();

  useEffect(() => {
    if (initialValue) {
      setSearchTerm(initialValue);
    }
  }, [initialValue]);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      // Default behavior: navigate to home with search query
      router.push(`/?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>
        </div>
        <Button
          onClick={handleSearch}
          variant="primary"
          className="px-8 py-3 text-lg whitespace-nowrap"
        >
          Buscar
        </Button>
      </div>
    </div>
  );
};


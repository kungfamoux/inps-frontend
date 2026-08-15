import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { debounce } from '@/lib/utils';

export interface FilterConfig {
  field: string;
  type: 'text' | 'select' | 'chip';
  label: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface SearchFilters {
  q?: string;
  status?: string;
  classId?: string;
  role?: string;
  level?: string;
  page?: number;
  limit?: number;
  [key: string]: string | number | undefined;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  filterConfig: FilterConfig[];
  initialFilters?: SearchFilters;
  showHistory?: boolean;
  exportable?: boolean;
  onExport?: () => void;
}

export default function AdvancedSearch({
  onSearch,
  onClear,
  filterConfig,
  initialFilters = {},
  showHistory = false,
  exportable = false,
  onExport,
}: AdvancedSearchProps) {
  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      // Default CSV export
      const csvContent = 'data:text/csv;charset=utf-8,' + 'ID,Name,Status\n';
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'search_results.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history from localStorage
  useEffect(() => {
    if (showHistory) {
      const saved = localStorage.getItem('searchHistory');
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    }
  }, [showHistory]);

  const handleFilterChange = (
    field: string,
    value: string | number | undefined,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = useCallback(() => {
    onSearch(filters);

    // Save to history if text search exists
    if (filters.q && showHistory) {
      const newHistory = [
        filters.q,
        ...searchHistory.filter((h) => h !== filters.q),
      ].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  }, [filters, onSearch, showHistory, searchHistory]);

  // Debounced version of handleSearch for text input
  const debouncedSearch = useCallback(debounce(handleSearch, 500), [
    handleSearch,
  ]);

  const handleClear = () => {
    setFilters({});
    onClear();
  };

  const handleHistoryClick = (query: string) => {
    setFilters((prev) => ({ ...prev, q: query }));
    onSearch({ ...filters, q: query });
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== '' && v !== 0,
  ).length;

  return (
    <div className="space-y-4">
      {/* Main search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={filters.q || ''}
            onChange={(e) => {
              handleFilterChange('q', e.target.value);
              debouncedSearch();
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>

        {filterConfig.length > 0 && (
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
            {showFilters ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </Button>
        )}

        <Button onClick={handleSearch} className="gap-2">
          <Search className="size-4" />
          Search
        </Button>

        {activeFilterCount > 0 && (
          <Button variant="ghost" onClick={handleClear} className="gap-2">
            <X className="size-4" />
            Clear
          </Button>
        )}

        {exportable && (
          <Button variant="outline" onClick={handleExport} className="gap-2">
            Export
          </Button>
        )}
      </div>

      {/* Advanced filters */}
      {showFilters && filterConfig.length > 0 && (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterConfig.map((config) => (
              <div key={config.field} className="space-y-2">
                <label className="text-sm font-medium">{config.label}</label>

                {config.type === 'text' && (
                  <Input
                    placeholder={
                      config.placeholder ||
                      `Search ${config.label.toLowerCase()}`
                    }
                    value={filters[config.field] || ''}
                    onChange={(e) =>
                      handleFilterChange(config.field, e.target.value)
                    }
                  />
                )}

                {config.type === 'select' && config.options && (
                  <select
                    value={filters[config.field] || ''}
                    onChange={(e) =>
                      handleFilterChange(config.field, e.target.value)
                    }
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">All {config.label}</option>
                    {config.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {config.type === 'chip' && config.options && (
                  <div className="flex flex-wrap gap-2">
                    {config.options.map((option) => (
                      <Badge
                        key={option.value}
                        variant={
                          filters[config.field] === option.value
                            ? 'default'
                            : 'outline'
                        }
                        className="cursor-pointer"
                        onClick={() =>
                          handleFilterChange(
                            config.field,
                            filters[config.field] === option.value
                              ? ''
                              : option.value,
                          )
                        }
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search history */}
      {showHistory && searchHistory.length > 0 && !filters.q && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Recent searches:</p>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((query, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer"
                onClick={() => handleHistoryClick(query)}
              >
                {query}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

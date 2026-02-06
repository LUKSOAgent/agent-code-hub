import React, { useState, useRef, useEffect } from 'react'
import { Search, X, Filter, ChevronDown } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  filters?: {
    languages: string[]
    selectedLanguage: string | null
    onLanguageChange: (lang: string | null) => void
    sortBy: string
    onSortChange: (sort: string) => void
  }
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search code snippets...',
  filters
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const filtersRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'trending', label: 'Trending' }
  ]

  return (
    <div className="w-full">
      <div
        className={`relative flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/50 border transition-all duration-200 ${
          isFocused
            ? 'border-blue-500/50 shadow-lg shadow-blue-500/10'
            : 'border-slate-700/50 hover:border-slate-600/50'
        }`}
      >
        <Search className={`w-5 h-5 transition-colors ${isFocused ? 'text-blue-400' : 'text-slate-500'}`} />
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
        />

        {value && (
          <button
            onClick={() => onChange('')}
            className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-slate-700/50 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {filters && (
          <div className="relative" ref={filtersRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                showFilters || filters.selectedLanguage || filters.sortBy !== 'newest'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-xl glass-card shadow-2xl z-50 animate-scale-in">
                <div className="p-4">
                  {/* Language Filter */}
                  <div className="mb-4">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
                      Language
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => filters.onLanguageChange(null)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          !filters.selectedLanguage
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        All
                      </button>
                      {filters.languages.map((lang) => (
                        <button
                          key={lang}
                          onClick={() => filters.onLanguageChange(lang)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            filters.selectedLanguage === lang
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
                      Sort By
                    </label>
                    <div className="space-y-1">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => filters.onSortChange(option.value)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                            filters.sortBy === option.value
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'text-slate-300 hover:bg-slate-700/50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchBar

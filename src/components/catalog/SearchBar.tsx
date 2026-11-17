"use client";

import React, { useRef } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
  showAdvancedButton?: boolean;
  onAdvancedClick?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Rechercher une cote, un titre, un fonds ou une thématique...',
  showAdvancedButton = true,
  onAdvancedClick,
  isLoading = false,
  className = '',
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className={`search-bar ${className}`} role="search">
      <div className="search-bar__field">
        <i className="fa-solid fa-magnifying-glass search-bar__icon" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          className="search-bar__input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              onChange('');
              onSearch('');
              inputRef.current?.blur();
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          aria-label="Rechercher dans le répertoire"
        />
        {value && (
          <button
            type="button"
            className="search-bar__clear"
            onClick={() => {
              onChange('');
              onSearch('');
              inputRef.current?.focus();
            }}
            aria-label="Effacer la recherche"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        )}
        <button type="submit" className="button button--primary search-bar__submit" disabled={isLoading}>
          {isLoading ? 'Recherche…' : 'Rechercher'}
        </button>
      </div>
      {showAdvancedButton && onAdvancedClick && (
        <button type="button" className="button button--outline" onClick={onAdvancedClick}>
          <i className="fa-solid fa-sliders" aria-hidden="true" /> Recherche avancée
        </button>
      )}
    </form>
  );
}

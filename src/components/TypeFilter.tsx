import React, { useState, useEffect } from 'react';
import Loading from './Loading'; 
import '../styles/TypeFilter.css';

interface PokemonType {
  name: string;
  url: string;
}

interface TypeFilterProps {
  onSearch: (selectedTypes: string[]) => void;
}

const TypeFilter = ({ onSearch }: TypeFilterProps) => {
  const [types, setTypes] = useState<PokemonType[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const loadTypes = async () => {
      try {
        setIsLoading(true); 
        const response = await fetch('https://pokeapi.co/api/v2/type');
        if (!response.ok) {
          throw new Error('Failed to fetch Pokémon types');
        }
        const data = await response.json();
        setTypes(data.results);
      } catch (error) {
        console.error('Error fetching Pokémon types:', error);
      } finally {
        setIsLoading(false); 
      }
    };
    loadTypes();
  }, []);

  const handleTypeClick = (typeName: string) => {
    if (selectedTypes.includes(typeName)) {
      setSelectedTypes(selectedTypes.filter((type) => type !== typeName));
    } else {
      setSelectedTypes([...selectedTypes, typeName]);
    }
  };

  const handleSearch = () => {
    onSearch(selectedTypes);
  };

  return (
    <div className="type-filter">
      {isLoading ? (
        <Loading /> 
      ) : (
        <>
          <h2 className="type-title">TYPE</h2>
          <div className="type-container">
            {types.map((type) => (
              <button
                key={type.name}
                className={`type-button ${type.name} ${
                  selectedTypes.includes(type.name) ? 'active' : ''
                }`}
                onClick={() => handleTypeClick(type.name)}
              >
                {type.name.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="search-button" onClick={handleSearch}>
            SEARCH
          </button>
        </>
      )}
    </div>
  );
};

export default TypeFilter;
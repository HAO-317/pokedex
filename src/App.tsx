import React, { useState, useEffect } from 'react';
import { useTheme, ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import PokemonDetailsComponent from './components/PokemonDetails';
import TypeFilter from './components/TypeFilter';
import Loading from './components/Loading';
import './styles/App.css';

interface PokemonListResponse {
  results: { name: string; url: string }[];
}

interface Sprites {
  front_default: string;
  other?: {
    'official-artwork'?: {
      front_default?: string;
    };
  };
}

interface PokemonDetails {
  id: number;
  name: string;
  sprites: Sprites;
  types: { type: { name: string } }[];
}

interface PokemonWithDetails {
  name: string;
  url: string;
  details?: PokemonDetails;
}

const App = () => {
  const [pokemonList, setPokemonList] = useState<PokemonWithDetails[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<PokemonWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [isTransitioning, setIsTransitioning] = useState(false); 
  const { isDarkMode } = useTheme();

  const ensureMinimumLoadingTime = async (promise: Promise<any>) => {
    const MINIMUM_LOADING_TIME = 650; 
    const start = Date.now();
    await promise;
    const elapsed = Date.now() - start;
    const remaining = MINIMUM_LOADING_TIME - elapsed;
    if (remaining > 0) {
      await new Promise(resolve => setTimeout(resolve, remaining));
    }
  };

  useEffect(() => {
    const loadPokemon = async () => {
      try {
        setIsLoading(true);
        const fetchPromise = (async () => {
          const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
          if (!response.ok) {
            throw new Error('Failed to fetch Pokémon list');
          }
          const data: PokemonListResponse = await response.json();
          const pokemonWithDetails = data.results.map((pokemon) => ({
            name: pokemon.name,
            url: pokemon.url,
          }));

          const detailsPromises = pokemonWithDetails.map(async (pokemon) => {
            const detailsResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
            if (!detailsResponse.ok) {
              throw new Error(`Failed to fetch details for ${pokemon.name}`);
            }
            const details: PokemonDetails = await detailsResponse.json();
            return { ...pokemon, details };
          });

          const detailedPokemon = await Promise.all(detailsPromises);
          setPokemonList(detailedPokemon);
          setFilteredPokemon(detailedPokemon);
        })();
        await ensureMinimumLoadingTime(fetchPromise);
      } catch (error) {
        console.error('Error fetching Pokémon list:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPokemon();
  }, []);

  useEffect(() => {
    let filtered = pokemonList;
    if (searchTerm) {
      filtered = filtered.filter(pokemon =>
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(pokemon => {
        const pokemonTypes = pokemon.details?.types.map(typeInfo => typeInfo.type.name) || [];
        return selectedTypes.every(type => pokemonTypes.includes(type));
      });
    }
    setFilteredPokemon(filtered);
  }, [searchTerm, selectedTypes, pokemonList]);

  const handleBackToHome = async () => {
    setIsTransitioning(true); 
    await new Promise(resolve => setTimeout(resolve, 650)); 
    setShowTypeFilter(false);
    setSelectedPokemon(null);
    setIsTransitioning(false);
  };

  const handleTypeSearch = async (types: string[]) => {
    setIsTransitioning(true); 
    await new Promise(resolve => setTimeout(resolve, 650)); 
    setSelectedTypes(types);
    setShowTypeFilter(false);
    setIsTransitioning(false);
  };

  const handlePokemonSelect = async (pokemonName: string) => {
    setIsTransitioning(true); 
    await new Promise(resolve => setTimeout(resolve, 650)); 
    setSelectedPokemon(pokemonName);
    setIsTransitioning(false);
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : 'light'}`}>
      {(isLoading || isTransitioning) ? (
        <Loading /> 
      ) : showTypeFilter ? (
        <>
          <Header
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setShowTypeFilter={setShowTypeFilter}
            showTypeFilter={showTypeFilter}
            selectedPokemon={selectedPokemon}
            handleBackToHome={handleBackToHome}
          />
          <TypeFilter onSearch={handleTypeSearch} />
        </>
      ) : selectedPokemon ? (
        <PokemonDetailsComponent
          name={selectedPokemon}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setShowTypeFilter={setShowTypeFilter}
          showTypeFilter={showTypeFilter}
          selectedPokemon={selectedPokemon}
          setSelectedPokemon={setSelectedPokemon} 
          handleBackToHome={handleBackToHome}
        />
      ) : (
        <>
          <Header
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setShowTypeFilter={setShowTypeFilter}
            showTypeFilter={showTypeFilter}
            selectedPokemon={selectedPokemon}
            handleBackToHome={handleBackToHome}
          />
          <div className="pokemon-list">
            {filteredPokemon.map((pokemon) => (
              <div
                key={pokemon.name}
                className={`pokemon-card ${isDarkMode ? 'dark' : 'light'}`}
                onClick={() => handlePokemonSelect(pokemon.name)}
              >
                {pokemon.details?.sprites?.other?.['official-artwork']?.front_default ? (
                  <img
                    src={pokemon.details.sprites.other['official-artwork'].front_default}
                    alt={pokemon.name}
                    className="pokemon-list-image"
                  />
                ) : (
                  <div className="image-placeholder">No Image</div>
                )}
                <p className="number">
                  #{pokemon.url.split('/')[6].padStart(3, '0')}
                </p>
                <p className="name">{pokemon.name}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const RootApp = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

export default RootApp;
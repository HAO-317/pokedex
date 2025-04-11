import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Header from './Header';
import Loading from './Loading';
import criesIcon from '../assets/img/cries.png';
import '../styles/PokemonDetails.css';

interface Sprites {
  front_default: string;
  back_default: string;
  front_shiny: string; 
  back_shiny: string; 
  other?: {
    'official-artwork'?: {
      front_default?: string;
    };
  };
}

interface Stat {
  base_stat: number;
  effort: number;
  stat: { name: string; url: string };
}

interface Ability {
  ability: { name: string; url: string };
  is_hidden: boolean;
  slot: number;
}

interface Move {
  move: { name: string; url: string };
  version_group_details: {
    level_learned_at: number;
    move_learn_method: { name: string; url: string };
    version_group: { name: string; url: string };
  }[];
}

interface Species {
  name: string;
  url: string;
}

interface PokemonDetailsType {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: Sprites;
  types: { type: { name: string } }[];
  stats: Stat[];
  abilities: Ability[];
  cries: {
    latest: string;
    legacy: string;
  };
  moves: Move[];
  species: Species;
}

interface EvolutionChain {
  chain: {
    species: { name: string; url: string };
    evolves_to: EvolutionChain['chain'][];
  };
}

interface SpeciesDetails {
  flavor_text_entries: { flavor_text: string; language: { name: string } }[];
  evolution_chain: { url: string };
}

interface EvolutionPokemon {
  name: string;
  id: number;
  sprite: string;
}

interface PokemonDetailsProps {
  name: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setShowTypeFilter: (show: boolean) => void;
  showTypeFilter: boolean;
  selectedPokemon: string | null;
  setSelectedPokemon: (name: string | null) => void;
  handleBackToHome: () => void;
}

const PokemonDetails = ({
  name,
  searchTerm,
  setSearchTerm,
  setShowTypeFilter,
  showTypeFilter,
  selectedPokemon,
  setSelectedPokemon,
  handleBackToHome,
}: PokemonDetailsProps) => {
  const [pokemon, setPokemon] = useState<PokemonDetailsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [evolutionChain, setEvolutionChain] = useState<EvolutionPokemon[]>([]);
  const [description, setDescription] = useState<string>('');
  const [showFront, setShowFront] = useState(true);
  const [isShiny, setIsShiny] = useState(false); 
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch details for ${name}`);
        }
        const data: PokemonDetailsType = await response.json();
        setPokemon(data);

        if (data.species?.url) {
          const speciesResponse = await fetch(data.species.url);
          if (!speciesResponse.ok) {
            throw new Error(`Failed to fetch species data for ${name}`);
          }
          const speciesData: SpeciesDetails = await speciesResponse.json();

          const flavorText = speciesData.flavor_text_entries.find(
            (entry) => entry.language.name === 'en'
          );
          setDescription(flavorText?.flavor_text || 'No description available.');

          if (speciesData.evolution_chain?.url) {
            const evolutionResponse = await fetch(speciesData.evolution_chain.url);
            if (!evolutionResponse.ok) {
              throw new Error(`Failed to fetch evolution chain for ${name}`);
            }
            const evolutionData: EvolutionChain = await evolutionResponse.json();
            const chain: EvolutionPokemon[] = [];

            const extractChain = async (chainData: EvolutionChain['chain']) => {
              const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${chainData.species.name}`);
              if (!pokemonResponse.ok) {
                throw new Error(`Failed to fetch data for ${chainData.species.name}`);
              }
              const pokemonData: PokemonDetailsType = await pokemonResponse.json();
              chain.push({
                name: chainData.species.name,
                id: pokemonData.id,
                sprite: pokemonData.sprites.front_default,
              });
              if (chainData.evolves_to.length > 0) {
                for (const next of chainData.evolves_to) {
                  await extractChain(next);
                }
              }
            };
            await extractChain(evolutionData.chain);
            setEvolutionChain(chain);
          }
        }
      } catch (error) {
        console.error(`Error fetching details for ${name}:`, error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDetails();
  }, [name]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowFront((prev) => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const playCry = () => {
    if (pokemon?.cries?.latest) {
      const audio = new Audio(pokemon.cries.latest);
      audio.play().catch((error) => console.error('Error playing cry:', error));
    }
  };

  const getLevelUpMoves = () => {
    if (!pokemon?.moves) return [];
    return pokemon.moves
      .filter((move) =>
        move.version_group_details.some(
          (detail) =>
            detail.move_learn_method.name === 'level-up' &&
            detail.level_learned_at > 0
        )
      )
      .map((move) => ({
        name: move.move.name,
        level: move.version_group_details.find(
          (detail) => detail.move_learn_method.name === 'level-up'
        )?.level_learned_at || 0,
      }))
      .sort((a, b) => a.level - b.level)
      .slice(0, 5);
  };

  const capitalize = (str: string) => {
    return str
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handlePokemonClick = (pokemonName: string) => {
    if (pokemonName !== selectedPokemon) {
      setSelectedPokemon(pokemonName);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div>
      {isLoading ? (
        <Loading />
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
          <div className={`details-container ${isDarkMode ? 'dark' : 'light'}`}>
            {pokemon?.sprites.other?.['official-artwork']?.front_default ? (
              <img
                className="pokemon-image"
                src={pokemon.sprites.other['official-artwork'].front_default}
                alt={pokemon.name}
              />
            ) : (
              <div className="image-placeholder">No Image</div>
            )}

            <div className='container-nameId-display'>
              <div className='box-nameId'>
                <div>
                  <h2 className="pokemon-number">#{pokemon?.id.toString().padStart(3, '0')}</h2>
                  <h2 className="pokemon-name">{pokemon?.name ? capitalize(pokemon.name) : ''}</h2>
                </div>

                <button className="play-cry-button" onClick={playCry}>
                  <img src={criesIcon} alt="Play Cry" className="cry-icon" />
                  Play Cry
                </button>
              </div>

              <div className='display-container'>
                <div className='display'>
                  {pokemon?.sprites.front_default && pokemon?.sprites.back_default ? (
                    <div className="pixel-sprite-container">
                      <img
                        src={
                          showFront
                            ? (isShiny ? pokemon.sprites.front_shiny : pokemon.sprites.front_default)
                            : (isShiny ? pokemon.sprites.back_shiny : pokemon.sprites.back_default)
                        }
                        alt={`${pokemon.name} ${isShiny ? 'shiny' : 'normal'} ${showFront ? 'front' : 'back'}`}
                        className="pixel-sprite"
                      />
                    </div>
                  ) : (
                    <div className="pixel-sprite-placeholder">No Pixel Sprite</div>
                  )}
                </div>
                <div className="display-buttons">
                  <button
                    className={`toggle-button ${!isShiny ? 'active' : ''}`}
                    onClick={() => setIsShiny(false)}
                  >
                    NORMAL
                  </button>
                  <button
                    className={`toggle-button ${isShiny ? 'active' : ''}`}
                    onClick={() => setIsShiny(true)}
                  >
                    SHINY
                  </button>
                </div>
              </div>
            </div>

            <div className="type-container">
              {pokemon?.types.map((typeInfo) => (
                <button
                  key={typeInfo.type.name}
                  className={`type-button ${typeInfo.type.name}`}
                >
                  {capitalize(typeInfo.type.name)}
                </button>
              ))}
            </div>

            <div className="physical-stats">
              <p>Height: {(pokemon?.height / 10).toFixed(1)} m</p>
              <p>Weight: {(pokemon?.weight / 10).toFixed(1)} kg</p>
            </div>

            <div className="abilities">
              <h3 className="section-title">Abilities</h3>
              {pokemon?.abilities.map((abilityInfo) => (
                <p key={abilityInfo.ability.name}>
                  {capitalize(abilityInfo.ability.name)}
                  {abilityInfo.is_hidden ? ' (Hidden)' : ''}
                </p>
              ))}
            </div>

            <div className="stats">
              <h3 className="section-title">Base Stats</h3>
              {pokemon?.stats.map((stat) => (
                <p key={stat.stat.name}>
                  {capitalize(stat.stat.name)}: {stat.base_stat}
                </p>
              ))}
            </div>

            <div className="description">
              <h3 className="section-title">Description</h3>
              <p>{description}</p>
            </div>

            <div className="evolution-chain">
              <h3 className="section-title">Evolution Chain</h3>
              {evolutionChain.length > 0 ? (
                <div className="evolution-chain-list">
                  {evolutionChain.map((evoPokemon, index) => (
                    <React.Fragment key={evoPokemon.name}>
                      <div className="evolution-item">
                        <img
                          src={evoPokemon.sprite}
                          alt={evoPokemon.name}
                          className="evolution-sprite"
                        />
                        <span className="evolution-id">
                          #{evoPokemon.id.toString().padStart(3, '0')}
                        </span>
                        <button
                          className="evolution-link"
                          onClick={() => handlePokemonClick(evoPokemon.name)}
                        >
                          {capitalize(evoPokemon.name)}
                        </button>
                      </div>
                      {index < evolutionChain.length - 1 && (
                        <span className="evolution-arrow">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <p>No Evolution Chain</p>
              )}
            </div>

            <div className="moves">
              <h3 className="section-title">Moves</h3>
              {getLevelUpMoves().length > 0 ? (
                getLevelUpMoves().map((move) => (
                  <p key={move.name}>
                    {capitalize(move.name)} (Level {move.level})
                  </p>
                ))
              ) : (
                <p>No Moves Available</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PokemonDetails;
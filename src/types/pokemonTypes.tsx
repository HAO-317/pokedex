export interface PokemonListResponse {
  results: { name: string; url: string }[];
}

export interface PokemonType {
  name: string;
  url: string;
}

export interface Sprites {
  front_default: string;
  other?: {
    'official-artwork'?: {
      front_default?: string;
    };
  };
}

export interface PokemonDetails {
  id: number;
  name: string;
  sprites: Sprites;
  types: { type: { name: string } }[];
}
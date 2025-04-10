import axios from 'axios';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const fetchPokemonList = async (limit: number = 20, offset: number = 0) => {
  const response = await axios.get(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
  console.log('Pokémon List API Response:', response.data); 
  return response.data;
};

export const fetchPokemonDetails = async (name: string) => {
  const response = await axios.get(`${BASE_URL}/pokemon/${name}`);
  console.log('Pokémon Details API Response:', response.data); 
  return response.data;
};

export const fetchPokemonTypes = async () => {
  const response = await axios.get(`${BASE_URL}/type`);
  console.log('Pokémon Types API Response:', response.data); 
  return response.data;
};
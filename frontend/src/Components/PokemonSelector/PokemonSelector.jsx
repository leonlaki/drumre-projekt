import React, { useEffect, useState } from 'react';
import { userApi } from '../../api/userApi';
import './pokemonSelector.css';

const PokemonSelector = ({ onSelect, selectedId }) => {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        
        const data = await userApi.getPokemonList();
        setPokemons(data);
      } catch (error) {
        console.error("Failed to load pokemons", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemons();
  }, []);

  
  const filteredPokemons = pokemons.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-small">Učitavam Pokédex...</div>;

  return (
    <div className="poke-selector-container">
      <input 
        type="text" 
        placeholder="Traži Pokémona..." 
        className="poke-search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="poke-grid">
        {filteredPokemons.map((poke) => (
          <div 
            key={poke.id} 
            className={`poke-item ${selectedId === poke.id ? 'selected' : ''}`}
            onClick={() => onSelect(poke)} 
          >
            <img src={poke.avatar} alt={poke.name} className="poke-img" loading="lazy" />
            <span className="poke-name">{poke.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PokemonSelector;
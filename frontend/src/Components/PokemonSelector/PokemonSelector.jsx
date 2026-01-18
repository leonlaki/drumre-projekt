import React, { useEffect, useState } from 'react';
import { userApi } from '../../api/userApi';
import './pokemonSelector.css';

const ITEMS_PER_PAGE = 18; // 3 reda po 6 komada (ovisno o širini)

const PokemonSelector = ({ onSelect, selectedId }) => {
  const [allPokemons, setAllPokemons] = useState([]); // Svi podaci
  const [loading, setLoading] = useState(true);
  
  // State za filtriranje i paginaciju
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // 1. DOHVAT SVIH PODATAKA (Samo jednom)
  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        const data = await userApi.getPokemonList();
        setAllPokemons(data);
      } catch (error) {
        console.error("Failed to load pokemons", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemons();
  }, []);

  // 2. RESETIRAJ STRANICU KAD KORISNIK TRAŽI
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 3. LOGIKA FILTRIRANJA
  const filteredPokemons = allPokemons.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 4. LOGIKA PAGINACIJE (SLICE)
  const totalPages = Math.ceil(filteredPokemons.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredPokemons.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Handleri za navigaciju
  const handlePrev = (e) => {
    e.preventDefault(); // Da ne submita formu ako je unutar forme
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

  if (loading) return <div className="poke-loading">Učitavam Pokédex...</div>;

  return (
    <div className="poke-selector-container">
      {/* SEARCH */}
      <input 
        type="text" 
        placeholder="Traži Pokémona... (npr. Pikachu)" 
        className="poke-search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* GRID (Samo trenutni itemi) */}
      <div className="poke-grid">
        {currentItems.map((poke) => (
          <div 
            key={poke.id} 
            className={`poke-item ${selectedId === poke.id ? 'selected' : ''}`}
            onClick={() => onSelect(poke)}
          >
            <img src={poke.avatar} alt={poke.name} className="poke-img" loading="lazy" />
            <span className="poke-name">{poke.name}</span>
          </div>
        ))}
        
        {currentItems.length === 0 && (
          <p className="no-results">Nema Pokémona s tim imenom.</p>
        )}
      </div>

      {/* NAVIGACIJA (Prikazujemo samo ako ima više od 1 stranice) */}
      {totalPages > 1 && (
        <div className="poke-pagination">
          <button 
            className="btn-poke-nav" 
            onClick={handlePrev} 
            disabled={currentPage === 1}
          >
            ◀
          </button>
          
          <span className="page-info">
            {currentPage} / {totalPages}
          </span>
          
          <button 
            className="btn-poke-nav" 
            onClick={handleNext} 
            disabled={currentPage === totalPages}
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default PokemonSelector;
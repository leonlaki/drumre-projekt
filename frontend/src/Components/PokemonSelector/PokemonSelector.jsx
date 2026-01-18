import React, { useEffect, useState } from "react";
import { userApi } from "../../api/userApi";
import "./pokemonSelector.css";

const ITEMS_PER_PAGE = 18; // broj itema po stranici

const PokemonSelector = ({ onSelect, selectedId }) => {
  // svi pokemoni
  const [allPokemons, setAllPokemons] = useState([]);
  const [loading, setLoading] = useState(true);

  // stanje za pretragu i trenutnu stranicu
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // dohvat svih pokemona samo jednom
  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        const data = await userApi.getPokemonList();
        setAllPokemons(data);
      } catch (error) {
        console.error("failed to load pokemons", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemons();
  }, []);

  // reset stranice kad se mijenja pretraga
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // filtriranje pokemona po imenu
  const filteredPokemons = allPokemons.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // logika paginacije
  const totalPages = Math.ceil(filteredPokemons.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredPokemons.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // navigacija stranica
  const handlePrev = (e) => {
    e.preventDefault();
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  if (loading) return <div className="poke-loading">Loading Pokédex...</div>;

  return (
    <div className="poke-selector-container">
      {/* polje za pretragu */}
      <input
        type="text"
        placeholder="Search Pokémon... (e.g. Pikachu)"
        className="poke-search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* grid s trenutnim pokémonima */}
      <div className="poke-grid">
        {currentItems.map((poke) => (
          <div
            key={poke.id}
            className={`poke-item ${selectedId === poke.id ? "selected" : ""}`}
            onClick={() => onSelect(poke)}
          >
            <img
              src={poke.avatar}
              alt={poke.name}
              className="poke-img"
              loading="lazy"
            />
            <span className="poke-name">{poke.name}</span>
          </div>
        ))}

        {currentItems.length === 0 && (
          <p className="no-results">No Pokémon found with that name.</p>
        )}
      </div>

      {/* navigacija stranica */}
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

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../Context/AuthContext";
import { recipeApi } from "../../api/recipeApi";
import Navbar from "../../Components/Navbars/NavbarLogedUser/Navbar";
import Footer from "../../Components/Footer/Footer";
import PageTransition from "../../Context/PageTransition";
import RecipeCard from "../../Components/RecipeCard/RecipeCard";
import AddRecipeModal from "../../Components/AddRecipeModal/AddRecipeModal";
import Spinner from "../../Components/Spinner/Spinner";
import "./myRecepies.css";


const CATEGORY_OPTIONS = [
  "Beef", "Chicken", "Dessert", "Lamb", "Miscellaneous",
  "Pasta", "Pork", "Seafood", "Side", "Starter",
  "Vegan", "Vegetarian", "Breakfast", "Goat"
];


const AREA_FLAGS = {
  "American": "us", "British": "gb", "Canadian": "ca", "Chinese": "cn",
  "Croatian": "hr", "Dutch": "nl", "Egyptian": "eg", "Filipino": "ph",
  "French": "fr", "Greek": "gr", "Indian": "in", "Irish": "ie",
  "Italian": "it", "Jamaican": "jm", "Japanese": "jp", "Kenyan": "ke",
  "Malaysian": "my", "Mexican": "mx", "Moroccan": "ma", "Polish": "pl",
  "Portuguese": "pt", "Russian": "ru", "Spanish": "es", "Thai": "th",
  "Tunisian": "tn", "Turkish": "tr", "Vietnamese": "vn", "Unknown": "un"
};

const getFlagUrl = (areaName) => {
  const code = AREA_FLAGS[areaName];
  if (!code || code === "unknown") return null;
  return `https://flagcdn.com/24x18/${code}.png`;
};


const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};


const MultiSelectDropdown = ({ options, selected, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="multi-select-container" ref={dropdownRef}>
      <div className="multi-select-header" onClick={() => setIsOpen(!isOpen)}>
        <span>
           {selected.length > 0 ? `Odabrano država: ${selected.length}` : placeholder}
        </span>
        <span className="arrow">{isOpen ? "▲" : "▼"}</span>
      </div>
      
      {isOpen && (
        <div className="multi-select-options">
          {options.map((option) => (
            <div 
              key={option} 
              className={`multi-select-item ${selected.includes(option) ? "active" : ""}`}
              onClick={() => toggleOption(option)}
            >
              <div className="checkbox-custom">
                {selected.includes(option) && <span>✓</span>}
              </div>
              
              {getFlagUrl(option) && (
                <img src={getFlagUrl(option)} alt={option} className="flag-icon" />
              )}
              <span className="option-text">{option}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};



const MyRecepies = () => {
  const { user } = useAuth();
  
  
  const [ownRecipes, setOwnRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [availableAreas, setAvailableAreas] = useState([]); 

  
  const [loading, setLoading] = useState(true); 
  const [isSearching, setIsSearching] = useState(false); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [numColumns, setNumColumns] = useState(3);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]); 
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [usePreferences, setUsePreferences] = useState(false);

  const debouncedSearchTerm = useDebounce(searchQuery, 300);

  
  useEffect(() => {
    const initData = async () => {
      if (!user) return;
      
    
      const minLoading = new Promise(resolve => setTimeout(resolve, 1500));
      
      try {
        const [myRes, savedRes, filtersRes] = await Promise.all([
          recipeApi.getUserRecipes(user.username),
          recipeApi.getSavedRecipes(),
          recipeApi.getFilters() 
        ]);
        
        await minLoading; 

        setOwnRecipes(myRes);
        setSavedRecipes(savedRes);
        setAvailableAreas(filtersRes.areas || []);
        
       
        const discoveryRes = await recipeApi.searchRecipes("", [], [], false);
        setSearchResults(discoveryRes);

      } catch (error) {
        console.error("Init error:", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [user]);

  
  useEffect(() => {
    if (loading) return; 

    const performSearch = async () => {
      setIsSearching(true);
      try {
      
        const results = await recipeApi.searchRecipes(
          debouncedSearchTerm,
          selectedCategories,
          selectedAreas,
          usePreferences
        );
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, selectedCategories, selectedAreas, usePreferences, loading]);


  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) setNumColumns(1);
      else if (window.innerWidth < 1024) setNumColumns(2);
      else if (window.innerWidth < 1440) setNumColumns(3);
      else setNumColumns(4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const distributeRecipes = (recipes) => {
    if (!recipes) return [];
    const columns = Array.from({ length: numColumns }, () => []);
    recipes.forEach((recipe, index) => {
      columns[index % numColumns].push(recipe);
    });
    return columns;
  };

  const ownColumns = distributeRecipes(ownRecipes);
  const savedColumns = distributeRecipes(savedRecipes);
  const searchColumns = distributeRecipes(searchResults);


 

  const openNewModal = () => { setEditingRecipe(null); setIsModalOpen(true); };
  const openEditModal = (recipe) => { setEditingRecipe(recipe); setIsModalOpen(true); };

  const handleRecipeSaved = (savedRecipe, isEditMode) => {
    if (isEditMode) {
      setOwnRecipes((prev) => prev.map((r) => r._id === savedRecipe._id ? savedRecipe : r));
    } else {
      setOwnRecipes((prev) => [savedRecipe, ...prev]);
    }
  };

  const handleDeleteRecipe = async (id) => {
    if (!window.confirm("Jeste li sigurni da želite obrisati ovaj recept?")) return;
    try {
      await recipeApi.deleteRecipe(id);
      setOwnRecipes((prev) => prev.filter((r) => r._id !== id));
    } catch (error) { console.error(error); alert("Greška pri brisanju."); }
  };

  
  const handleToggleSave = async (recipe) => {
    try {
      await recipeApi.toggleSave(recipe._id);
      
      const isAlreadySaved = savedRecipes.some(r => r._id === recipe._id);
      if (isAlreadySaved) {
        setSavedRecipes(prev => prev.filter(r => r._id !== recipe._id));
      } else {
        setSavedRecipes(prev => [recipe, ...prev]);
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c!==cat) : [...prev, cat]);
  };

  const isRecipeSaved = (id) => savedRecipes.some(r => r._id === id);


  return (
    <div className="my-recipes-wrapper">
      <Navbar />
      <PageTransition>
        <div className="my-recipes-container">
          
          <header className="recipes-hero">
            <h1>Moja Kuharica</h1>
            <p className="recipes-subtitle">
              Upravljaj svojim kulinarskim remek-djelima, pretražuj nove okuse i čuvaj omiljene recepte.
            </p>
            <button className="btn-add-recipe" onClick={openNewModal}>
              + Dodaj Novi Recept
            </button>
          </header>

          <AnimatePresence mode="wait">
            {loading ? (
               <motion.div key="loader" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5 }}>
                 <Spinner />
               </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                
                <section className="recipes-section">
                  <h2 className="section-title">Moji Recepti ({ownRecipes.length})</h2>
                  {ownRecipes.length === 0 ? (
                    <p className="empty-state">Još nisi kreirao/la nijedan recept.</p>
                  ) : (
                    <div className="masonry-container">
                      {ownColumns.map((column, colIndex) => (
                        <div key={colIndex} className="masonry-column">
                          {column.map((recipe) => (
                            <RecipeCard 
                              key={recipe._id} 
                              recipe={recipe} 
                              isOwn={true} 
                              onEdit={openEditModal} 
                              onDelete={handleDeleteRecipe} 
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <div className="section-divider"></div>

                
                <section className="recipes-section">
                  <h2 className="section-title">Spremljeno ({savedRecipes.length})</h2>
                  {savedRecipes.length === 0 ? (
                     <p className="empty-state">Nemaš spremljenih recepata.</p>
                  ) : (
                    <div className="masonry-container">
                      {savedColumns.map((column, colIndex) => (
                        <div key={colIndex} className="masonry-column">
                          {column.map((recipe) => (
                            <RecipeCard 
                              key={recipe._id} 
                              recipe={recipe} 
                              isOwn={false}
                              isSaved={true}
                              onToggleSave={handleToggleSave}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <div className="section-divider"></div>

                
                <section className="recipes-section search-section">
                  <h2 className="section-title centered-title">Otkrij Nove Okuse</h2>

                 
                  <div className="search-bar-wrapper">
                    <input 
                      type="text" 
                      className="search-input-large"
                      placeholder="Što ti se danas kuha?..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  
                  <div className="filters-container">
                    
                    
                    <div className="filter-row-preferences">
                       <button 
                         className={`pref-btn ${usePreferences ? "active" : ""}`}
                         onClick={() => setUsePreferences(!usePreferences)}
                       >
                         {usePreferences ? "★ Koristim tvoje postavke" : "☆ Uključi moje postavke"}
                       </button>
                    </div>

                    <div className="filters-grid">
                      
                      <div className="filter-group">
                        <span className="filter-label">Kategorije:</span>
                        <div className="chips-wrapper">
                          {CATEGORY_OPTIONS.map(cat => (
                            <button
                              key={cat}
                              className={`chip ${selectedCategories.includes(cat) ? "selected" : ""}`}
                              onClick={() => toggleCategory(cat)}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      
                      <div className="filter-group">
                        <span className="filter-label">Podrijetlo:</span>
                        <MultiSelectDropdown 
                           options={availableAreas} 
                           selected={selectedAreas}
                           onChange={setSelectedAreas}
                           placeholder="Odaberi države..."
                        />
                      </div>
                    </div>
                  </div>

                  
                  {isSearching ? (
                     <div className="mini-loader">Miješam sastojke... 🍲</div>
                  ) : (
                    <div className="masonry-container">
                       {searchResults.length > 0 ? (
                         searchColumns.map((column, colIndex) => (
                           <div key={colIndex} className="masonry-column">
                             {column.map((recipe) => (
                               <RecipeCard 
                                 key={recipe._id} 
                                 recipe={recipe} 
                                 isOwn={false}
                                 isSaved={isRecipeSaved(recipe._id)}
                                 onToggleSave={handleToggleSave} 
                               />
                             ))}
                           </div>
                         ))
                       ) : (
                          <p className="empty-state">Nema recepata za odabrane kriterije.</p>
                       )}
                    </div>
                  )}
                </section>

              </motion.div>
            )}
          </AnimatePresence>

          
          <AnimatePresence>
            {isModalOpen && (
              <AddRecipeModal 
                onClose={() => setIsModalOpen(false)} 
                onRecipeSaved={handleRecipeSaved} 
                initialData={editingRecipe} 
              />
            )}
          </AnimatePresence>
          
        </div>
        <Footer />
      </PageTransition>
    </div>
  );
};

export default MyRecepies;
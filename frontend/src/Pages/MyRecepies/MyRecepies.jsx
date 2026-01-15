import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../Context/AuthContext";
import { recipeApi } from "../../api/recipeApi";
import Navbar from "../../Components/Navbars/NavbarLogedUser/Navbar";
import Footer from "../../Components/Footer/Footer";
import PageTransition from "../../Context/PageTransition";
import RecipeCard from "../../Components/RecipeCard/RecipeCard";
import AddRecipeModal from "../../Components/AddRecipeModal/AddRecipeModal";
import Spinner from "../../Components/Spinner/Spinner"; // <--- Importan Spinner
import "./myRecepies.css";

const MyRecepies = () => {
  const { user } = useAuth();
  
  // Stanja za podatke
  const [ownRecipes, setOwnRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Stanja za UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [numColumns, setNumColumns] = useState(3); // Default 3 stupca

  // 1. DOHVAT PODATAKA + 3 SEKUNDE DELAY
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      // Kreiramo Promise koji se rješava tek za 3000ms (3 sekunde)
      // Ovo osigurava da se Spinner vrti minimalno 3 sekunde
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 3000));

      // Kreiramo Promise za dohvat podataka
      const dataFetch = Promise.all([
        recipeApi.getUserRecipes(user.username), // Moji recepti
        recipeApi.getSavedRecipes()             // Spremljeni recepti
      ]);

      try {
        // Čekamo da se završe OBA procesa (i timer i podaci)
        const [[myRes, savedRes]] = await Promise.all([dataFetch, minLoadingTime]);
        
        setOwnRecipes(myRes);
        setSavedRecipes(savedRes);
      } catch (error) {
        console.error("Greška pri dohvatu recepata", error);
      } finally {
        setLoading(false); // Tek sad mičemo loader
      }
    };

    fetchData();
  }, [user]);

  // 2. DETEKCIJA ŠIRINE EKRANA (Za Masonry layout)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) {
        setNumColumns(1); // Mobitel
      } else if (window.innerWidth < 1024)  {
        setNumColumns(2); // Desktop
      } else if (window.innerWidth < 1440)  {
        setNumColumns(3); // Široki ekrani
      } else {
        setNumColumns(4); // Veoma široki ekrani
      }
    };

    handleResize(); // Pokreni odmah
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 3. LOGIKA ZA DISTRIBUCIJU U STUPCE
  const distributeRecipes = (recipes) => {
    if (!recipes) return [];
    const columns = Array.from({ length: numColumns }, () => []);
    
    recipes.forEach((recipe, index) => {
      const columnIndex = index % numColumns;
      columns[columnIndex].push(recipe);
    });
    
    return columns;
  };

  const ownColumns = distributeRecipes(ownRecipes);
  const savedColumns = distributeRecipes(savedRecipes);


  // --- HANDLERI ---

  const openNewModal = () => {
    setEditingRecipe(null);
    setIsModalOpen(true);
  };

  const openEditModal = (recipe) => {
    setEditingRecipe(recipe);
    setIsModalOpen(true);
  };

  const handleRecipeSaved = (savedRecipe, isEditMode) => {
    if (isEditMode) {
      setOwnRecipes((prev) => 
        prev.map((r) => r._id === savedRecipe._id ? savedRecipe : r)
      );
    } else {
      setOwnRecipes((prev) => [savedRecipe, ...prev]);
    }
  };

  const handleDeleteRecipe = async (id) => {
    if (!window.confirm("Jeste li sigurni da želite obrisati ovaj recept?")) return;

    try {
      await recipeApi.deleteRecipe(id);
      setOwnRecipes((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      console.error("Greška pri brisanju", error);
      alert("Neuspješno brisanje.");
    }
  };

  return (
    <div className="my-recipes-wrapper">
      <Navbar />
      <PageTransition>
        <div className="my-recipes-container">
          
          {/* HEADER */}
          <header className="recipes-hero">
            <h1>Moja Kuharica</h1>
            <p className="recipes-subtitle">
              Upravljaj svojim kulinarskim remek-djelima i pregledaj recepte koje si spremio/la za kasnije.
            </p>
            <button className="btn-add-recipe" onClick={openNewModal}>
              + Dodaj Novi Recept
            </button>
          </header>

          {/* ANIMIRANA ZAMJENA SPINNERA I SADRŽAJA */}
          <AnimatePresence mode="wait">
            {loading ? (
               // 1. SPINNER (prikazuje se dok je loading true)
               <motion.div 
                 key="loader"
                 exit={{ opacity: 0, scale: 0.95 }} // Kad odlazi, nestani i malo se smanji
                 transition={{ duration: 0.5 }}
               >
                 <Spinner />
               </motion.div>
            ) : (
              // 2. GLAVNI SADRŽAJ (prikazuje se kad loading postane false)
              <motion.div 
                key="content"
                initial={{ opacity: 0, y: 20 }} // Počni proziran i malo spušten
                animate={{ opacity: 1, y: 0 }}  // Pojavi se i digni na mjesto
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {/* --- VLASTITI RECEPTI --- */}
                <section className="recipes-section">
                  <h2 className="section-title">Moji Recepti ({ownRecipes.length})</h2>
                  
                  {ownRecipes.length === 0 ? (
                    <p className="empty-state">Još nisi kreirao/la nijedan recept.</p>
                  ) : (
                    // MASONRY LAYOUT
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

                {/* --- SPREMLJENI RECEPTI --- */}
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
                              // Za tuđe recepte nemamo edit/delete
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
        <Footer />
      </PageTransition>

      {/* MODAL */}
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
  );
};

export default MyRecepies;
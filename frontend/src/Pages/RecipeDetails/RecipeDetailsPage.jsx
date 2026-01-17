import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { recipeApi } from "../../api/recipeApi";
import Footer from "../../Components/Footer/Footer"; // Prilagodi putanju
import Spinner from "../../Components/Spinner/Spinner"; // Prilagodi putanju
import "./recipeDetails.css"; // CSS ćemo definirati ispod
import PageTransition from "../../Context/PageTransition";

const RecipeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await recipeApi.getRecipeById(id);
        setRecipe(data);
      } catch (error) {
        console.error("Greška pri dohvatu recepta:", error);
        // Opcionalno: navigate("/home") ako ne postoji
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  if (loading) return <Spinner />;
  if (!recipe) return <div className="error-msg">Recept nije pronađen.</div>;

  const isAppVerified = !recipe.author || recipe.author.username === "MealDB";

  return (
    <div className="details-page-wrapper">
      
      <PageTransition>
        <div className="details-container">
        {/* HEADER SEKCIJA */}
        <div className="details-header">
          <button onClick={() => navigate(-1)} className="btn-back">
            ← Natrag
          </button>
          
          <div className="header-content">
            <span className="details-category">{recipe.category}</span>
            <h1 className="details-title">{recipe.title}</h1>
            
            <div className="details-meta">
              {isAppVerified ? (
                <span className="badge-verified-large">✅ Verified Recept</span>
              ) : (
                <span className="author-name">👤 Autor: {recipe.author?.username}</span>
              )}
              {recipe.area && <span className="origin-tag">🌍 {recipe.area}</span>}
            </div>
          </div>
        </div>

        {/* GLAVNA SLIKA */}
        <div className="hero-image-wrapper">
          <img 
            src={recipe.image || "https://via.placeholder.com/600"} 
            alt={recipe.title} 
            className="hero-image"
          />
        </div>

        {/* SADRŽAJ: SASTOJCI I UPUTE */}
        <div className="details-grid">
          
          {/* LIJEVI STUPAC: SASTOJCI */}
          <div className="ingredients-panel">
            <h3>🛒 Sastojci</h3>
            <ul className="ingredients-list-large">
              {recipe.ingredients && recipe.ingredients.map((ing, i) => (
                <li key={i} className="ing-item-large">
                  <span className="ing-measure-large">{typeof ing === 'string' ? '' : ing.measure}</span>
                  <span className="ing-name-large">{typeof ing === 'string' ? ing : ing.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* DESNI STUPAC: UPUTE */}
          <div className="instructions-panel">
            <h3>👨‍🍳 Priprema</h3>
            <div className="instructions-text-large">
              {recipe.instructions}
            </div>
          </div>

        </div>
        </div>
      </PageTransition>
      <Footer />
    </div>
  );
};

export default RecipeDetailsPage;
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { recipeApi } from "../../api/recipeApi";
import Footer from "../../Components/Footer/Footer";
import Spinner from "../../Components/Spinner/Spinner";
import PageTransition from "../../Context/PageTransition";
import "./recipeDetails.css";

const AREA_FLAGS = {
  Algerian: "dz", American: "us", Argentinian: "ar", Australian: "au",
  British: "gb", Canadian: "ca", Chinese: "cn", Croatian: "hr",
  Dutch: "nl", Egyptian: "eg", Filipino: "ph", French: "fr",
  Greek: "gr", Indian: "in", Irish: "ie", Italian: "it",
  Jamaican: "jm", Japanese: "jp", Kenyan: "ke", Malaysian: "my",
  Mexican: "mx", Moroccan: "ma", Norwegian: "no", Polish: "pl",
  Portuguese: "pt", Russian: "ru", "Saudi Arabian": "sa", Slovakian: "sk",
  Spanish: "es", Syrian: "sy", Thai: "th", Tunisian: "tn",
  Turkish: "tr", Ukrainian: "ua", Uruguayan: "uy", Venezulan: "ve",
  Vietnamese: "vn", Unknown: "un",
};

const getFlagUrl = (areaName) => {
  const code = AREA_FLAGS[areaName];
  if (!code || code === "un") return null;
  return `https://flagcdn.com/w40/${code}.png`;
};

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
        console.error("Error fetching recipe:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  if (loading) return <Spinner />;
  if (!recipe) return <div className="error-msg">Recipe not found.</div>;

  const isAppVerified = !recipe.author || recipe.author.username === "MealDB";
  const authorAvatar = isAppVerified
    ? "https://www.themealdb.com/images/logo-small.png"
    : recipe.author?.avatar || "https://via.placeholder.com/40";

  const flagUrl = getFlagUrl(recipe.area);

  return (
    <div className="details-page-wrapper">
      <PageTransition>
        <div className="details-container">

          <div className="details-header">
            <button onClick={() => navigate(-1)} className="btn-back">← Back</button>
            <div className="header-content">
              <span className="details-category">{recipe.category}</span>
              <h1 className="details-title">{recipe.title}</h1>

              <div className="details-meta">
                <div className="meta-item author-meta">
                  <img src={authorAvatar} alt="Author" className="meta-avatar" />
                  <span className="meta-text">{isAppVerified ? "MealDB Verified" : recipe.author?.username}</span>
                </div>
                {flagUrl && (
                  <div className="meta-item origin-meta">
                    <img src={flagUrl} alt={recipe.area} className="meta-avatar" />
                    <span className="meta-text">{recipe.area}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="hero-image-wrapper">
            <img src={recipe.image || "https://via.placeholder.com/600"} alt={recipe.title} className="hero-image" />
          </div>

          <div className="details-grid">

            <div className="ingredients-panel">
              <h3>🛒 Ingredients</h3>
              <ul className="ingredients-list-large">
                {recipe.ingredients && recipe.ingredients.map((ing, i) => (
                  <li key={i} className="ing-item-large">
                    <span className="ing-measure-large">{typeof ing === 'string' ? '' : ing.measure}</span>
                    <span className="ing-name-large">{typeof ing === 'string' ? ing : ing.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="instructions-panel">
              <h3>👨‍🍳 Instructions</h3>
              <div className="instructions-text-large">{recipe.instructions}</div>
            </div>

          </div>
        </div>
      </PageTransition>
      <Footer />
    </div>
  );
};

export default RecipeDetailsPage;

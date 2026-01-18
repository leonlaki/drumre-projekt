import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./recipeCard.css";

const RecipeCard = ({ recipe, isOwn, onEdit, onDelete, isSaved, onToggleSave }) => {
  // stanje za expand detalja
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  // provjera je li recept verificiran od aplikacije
  const isAppVerified = !recipe.author || recipe.author.username === "MealDB";

  // avatar autora s fallbackom
  const userAvatar =
    recipe.author?.avatar ||
    "https://ui-avatars.com/api/?name=User&background=random";

  // otvaranje stranice s detaljima recepta
  const handleOpenPage = (e) => {
    e.stopPropagation();
    navigate(`/recipe/${recipe._id}`);
  };

  // toggle za expand unutar kartice
  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.4, type: "tween", ease: "easeInOut" } }}
      className={`recipe-card ${isExpanded ? "expanded" : ""}`}
    >
      {/* HEADER */}
      <motion.div layout="position" className="recipe-card-header">
        {/* slika vodi na detalje */}
        <div className="img-wrapper-clickable" onClick={handleOpenPage} title="Open Details">
          <img
            src={recipe.image || "https://via.placeholder.com/150"}
            alt={recipe.title}
            className="recipe-card-img"
          />
          <div className="overlay-icon">↗</div>
        </div>

        <div className="recipe-card-info">
          {/* naslov vodi na detalje */}
          <motion.h3
            layout="position"
            className="recipe-title clickable-title"
            onClick={handleOpenPage}
          >
            {recipe.title}
          </motion.h3>

          <div className="recipe-meta-row">
            <motion.div layout="position" className="recipe-meta">
              {isAppVerified ? (
                <span className="badge-verified">✅ Verified</span>
              ) : (
                <div className="badge-author">
                  <img src={userAvatar} alt="avatar" className="user-avatar-small" />
                  <span>{recipe.author?.username}</span>
                </div>
              )}
            </motion.div>

            {/* akcijski gumbi */}
            <div className="card-actions">
              {isOwn ? (
                <>
                  <button
                    className="btn-icon-action edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(recipe);
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon-action delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(recipe._id);
                    }}
                  >
                    🗑️
                  </button>
                </>
              ) : (
                <button
                  className={`btn-icon-action save ${isSaved ? "saved" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(recipe);
                  }}
                >
                  {isSaved ? "❤️" : "🤍"}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* DETALJI (expandable) */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.3 }}
            className="recipe-card-details-wrapper"
          >
            <div className="recipe-card-details-inner">
              <div className="details-divider"></div>
              {/* prikaz područja podrijetla */}
              {recipe.area && <div className="recipe-origin-tag">🌍 {recipe.area}</div>}
              <div className="details-section">
                <h4>Ingredients (Preview):</h4>
                <ul className="ingredients-list-vertical">
                  {recipe.ingredients &&
                    recipe.ingredients.slice(0, 5).map((ing, i) => (
                      <li key={i} className="ingredient-item">
                        <span className="ing-measure">{ing.measure || ""}</span>
                        <span className="ing-name">{ing.name || ing}</span>
                      </li>
                    ))}
                  {recipe.ingredients && recipe.ingredients.length > 5 && (
                    <li className="more-ing">...and more ingredients</li>
                  )}
                </ul>
                <button className="btn-full-details" onClick={handleOpenPage}>
                  View Full Recipe
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* gumb za expand na dnu */}
      <div className="expand-trigger-area" onClick={toggleExpand}>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="chevron-icon"
        >
          ▼
        </motion.span>
      </div>
    </motion.div>
  );
};

export default RecipeCard;

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./recipeCard.css";

const RecipeCard = ({ recipe, isOwn, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Provjera je li recept verified (MealDB) ili od korisnika
  const isAppVerified = !recipe.author || recipe.author.username === "MealDB";

  // URL avatara (ako ga nema, koristi generic placeholder)
  // Backend šalje avatar unutar recipe.author.avatar
  const userAvatar = recipe.author?.avatar || "https://ui-avatars.com/api/?name=User&background=random";

  return (
    <motion.div
      layout 
      transition={{
        layout: {
          duration: 0.4, 
          type: "tween", 
          ease: "easeInOut", 
        },
      }}
      className={`recipe-card ${isOpen ? "expanded" : ""}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      {/* HEADER - Uvijek vidljiv */}
      <motion.div layout="position" className="recipe-card-header">
        <img
          src={recipe.image || "https://via.placeholder.com/150"}
          alt={recipe.title}
          className="recipe-card-img"
        />
        <div className="recipe-card-info">
          <motion.h3 layout="position" className="recipe-title">
            {recipe.title}
          </motion.h3>

          <div className="recipe-meta-row">
            <motion.div layout="position" className="recipe-meta">
              {isAppVerified ? (
                <span className="badge-verified">✅ Verified</span>
              ) : (
                // --- OVDJE JE PROMJENA: PRIKAZ SLIKE AVATARA ---
                <div className="badge-author">
                  <img 
                    src={userAvatar} 
                    alt="avatar" 
                    className="user-avatar-small"
                  />
                  <span>{recipe.author?.username || "Nepoznato"}</span>
                </div>
                // -----------------------------------------------
              )}
            </motion.div>

            {isOwn && (
              <div className="card-actions">
                <button
                  className="btn-icon-action edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(recipe);
                  }}
                  title="Uredi"
                >
                  ✏️
                </button>
                <button
                  className="btn-icon-action delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(recipe._id);
                  }}
                  title="Obriši"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* DETALJI - Expandable dio */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            style={{ overflow: "hidden" }}
            className="recipe-card-details-wrapper"
          >
            <div className="recipe-card-details-inner">
              <div className="details-divider"></div>

              <div className="details-section">
                <h4>Sastojci:</h4>
                <ul className="ingredients-list-vertical">
                  {recipe.ingredients &&
                    recipe.ingredients.map((ing, i) => {
                      if (typeof ing === "string")
                        return <li key={i}>{ing}</li>;
                      return (
                        <li key={i} className="ingredient-item">
                          <span className="ing-measure">{ing.measure}</span>
                          <span className="ing-name">{ing.name}</span>
                        </li>
                      );
                    })}
                </ul>
              </div>

              <div className="details-section">
                <h4>Upute:</h4>
                <p className="instructions-text">{recipe.instructions}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RecipeCard;
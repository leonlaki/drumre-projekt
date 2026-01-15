import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { recipeApi } from "../../api/recipeApi";
import "./addRecipeModal.css";

const CATEGORIES = [
  "Main Course", "Breakfast", "Lunch", "Dinner", "Dessert",
  "Snack", "Appetizer", "Soup", "Side Dish", "Drink",
];

// Dodali smo prop 'initialData'
const AddRecipeModal = ({ onClose, onRecipeSaved, initialData = null }) => {
  
  // Ako imamo initialData (edit mode), popuni formu, inače prazno
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    image: initialData?.image || "",
    category: initialData?.category || "Main Course",
    instructions: initialData?.instructions || "",
  });

  // Parsiranje sastojaka: Ako editiramo, uzmi iz initialData, inače jedan prazan red
  const [ingredients, setIngredients] = useState(
    initialData?.ingredients?.length > 0 
      ? initialData.ingredients.map(i => 
          typeof i === 'string' ? { name: i, measure: '' } : i // Kompatibilnost sa starim podacima
        )
      : [{ name: "", measure: "" }]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = !!initialData; // Boolean flag

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- LOGIKA ZA SASTOJKE (Ista kao prije) ---
  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addIngredientRow = () => {
    setIngredients([...ingredients, { name: "", measure: "" }]);
  };

  const removeIngredientRow = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };
  // ------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const validIngredients = ingredients.filter(ing => ing.name.trim() !== "");
      if (validIngredients.length === 0) {
        setError("Molimo dodajte barem jedan sastojak.");
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        ingredients: validIngredients,
      };

      let savedRecipe;
      
      if (isEditMode) {
        // UPDATE POSTOJEĆEG
        savedRecipe = await recipeApi.updateRecipe(initialData._id, payload);
      } else {
        // KREIRANJE NOVOG
        savedRecipe = await recipeApi.saveRecipe(payload);
      }

      onRecipeSaved(savedRecipe, isEditMode); // Šaljemo info roditelju
      onClose();
    } catch (err) {
      console.error(err);
      setError("Greška pri spremanju recepta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          {/* Naslov ovisi o modu */}
          <h2>{isEditMode ? "Uredi Recept" : "Novi Recept"}</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="recipe-form">
          <div className="form-group">
            <label>Naziv recepta</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Kategorija</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>URL Slike</label>
              <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>

          <div className="form-group">
            <label>Sastojci</label>
            <div className="ingredients-container">
              {ingredients.map((ing, index) => (
                <div key={index} className="ingredient-row">
                  <input
                    type="text"
                    placeholder="Ime"
                    value={ing.name}
                    onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                    className="ing-input-name"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Kol."
                    value={ing.measure}
                    onChange={(e) => handleIngredientChange(index, "measure", e.target.value)}
                    className="ing-input-measure"
                  />
                  {ingredients.length > 1 && (
                    <button type="button" className="btn-remove-ing" onClick={() => removeIngredientRow(index)}>&times;</button>
                  )}
                </div>
              ))}
              <button type="button" className="btn-add-ing" onClick={addIngredientRow}>+ Dodaj sastojak</button>
            </div>
          </div>

          <div className="form-group">
            <label>Upute</label>
            <textarea name="instructions" value={formData.instructions} onChange={handleChange} rows="5" required />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Odustani</button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? "Spremanje..." : (isEditMode ? "Spremi Izmjene" : "Objavi Recept")}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddRecipeModal;
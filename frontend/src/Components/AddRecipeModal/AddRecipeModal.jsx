import React, { useState } from "react";
import { motion } from "framer-motion";
import { recipeApi } from "../../api/recipeApi";
import "./addRecipeModal.css";

const CATEGORIES = [
  "Beef",
  "Breakfast",
  "Chicken",
  "Dessert",
  "Goat",
  "Lamb",
  "Miscellaneous",
  "Pasta",
  "Pork",
  "Seafood",
  "Side",
  "Starter",
  "Vegan",
  "Vegetarian"
];

const AddRecipeModal = ({ onClose, onRecipeSaved, initialData = null }) => {
  
  // stanje forme
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    image: initialData?.image || "",
    category: initialData?.category || "Beef",
    area: initialData?.area || "",
    instructions: initialData?.instructions || "",
  });

  // stanje sastojaka
  const [ingredients, setIngredients] = useState(
    initialData?.ingredients?.length > 0 
      ? initialData.ingredients.map(i => 
          typeof i === 'string' ? { name: i, measure: '' } : i
        )
      : [{ name: "", measure: "" }]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = !!initialData;

  // promjena inputa
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // promjena sastojka
  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  // dodaj novi red sastojka
  const addIngredientRow = () => {
    setIngredients([...ingredients, { name: "", measure: "" }]);
  };

  // ukloni red sastojka
  const removeIngredientRow = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  // slanje forme
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const validIngredients = ingredients.filter(ing => ing.name.trim() !== "");
      if (validIngredients.length === 0) {
        setError("please add at least one ingredient");
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        ingredients: validIngredients,
      };

      let savedRecipe;
      
      if (isEditMode) {
        savedRecipe = await recipeApi.updateRecipe(initialData._id, payload);
      } else {
        savedRecipe = await recipeApi.saveRecipe(payload);
      }

      onRecipeSaved(savedRecipe, isEditMode);
      onClose();
    } catch (err) {
      console.error(err);
      setError("error saving recipe");
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
          <h2>{isEditMode ? "Edit recipe" : "New recipe"}</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="recipe-form">
          <div className="form-group">
            <label>recipe name</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>image URL</label>
              <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>

          <div className="form-group">
            <label>ingredients</label>
            <div className="ingredients-container">
              {ingredients.map((ing, index) => (
                <div key={index} className="ingredient-row">
                  <input
                    type="text"
                    placeholder="name"
                    value={ing.name}
                    onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                    className="ing-input-name"
                    required
                  />
                  <input
                    type="text"
                    placeholder="amount"
                    value={ing.measure}
                    onChange={(e) => handleIngredientChange(index, "measure", e.target.value)}
                    className="ing-input-measure"
                  />
                  {ingredients.length > 1 && (
                    <button type="button" className="btn-remove-ing" onClick={() => removeIngredientRow(index)}>&times;</button>
                  )}
                </div>
              ))}
              <button type="button" className="btn-add-ing" onClick={addIngredientRow}>+ add ingredient</button>
            </div>
          </div>

          <div className="form-group">
            <label>instructions</label>
            <textarea name="instructions" value={formData.instructions} onChange={handleChange} rows="5" required />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>cancel</button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? "saving..." : (isEditMode ? "save changes" : "publish recipe")}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddRecipeModal;

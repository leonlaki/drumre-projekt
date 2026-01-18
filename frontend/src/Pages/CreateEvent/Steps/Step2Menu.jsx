import React, { useState } from "react";

const COURSE_TYPES = [
  "Aperitif",
  "Appetizer",
  "Warm Appetizer",
  "Soup",
  "Main Course",
  "Side Dish",
  "Salad",
  "Dessert",
  "Cheese",
  "Digestif",
  "Drink",
  "Snack",
];

const Step2Menu = ({ eventData, setEventData, availableRecipes }) => {
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [recipeSearchQuery, setRecipeSearchQuery] = useState("");
  const [currentCourseType, setCurrentCourseType] = useState("Main Course");

  // filtriranje recepata po imenu
  const filteredRecipes = availableRecipes.filter((r) =>
    r.title.toLowerCase().includes(recipeSearchQuery.toLowerCase())
  );

  // pomak slijeda gore/dolje
  const moveCourse = (index, direction) => {
    const newCourses = [...eventData.courses];
    if (direction === "up" && index > 0) {
      [newCourses[index], newCourses[index - 1]] = [
        newCourses[index - 1],
        newCourses[index],
      ];
    } else if (direction === "down" && index < newCourses.length - 1) {
      [newCourses[index], newCourses[index + 1]] = [
        newCourses[index + 1],
        newCourses[index],
      ];
    }
    setEventData({ ...eventData, courses: newCourses });
  };

  // promjena vrste slijeda
  const handleCourseTypeChange = (index, newType) => {
    const newCourses = [...eventData.courses];
    newCourses[index].courseType = newType;
    setEventData({ ...eventData, courses: newCourses });
  };

  // uklanjanje slijeda
  const removeCourse = (index) => {
    const newCourses = eventData.courses.filter((_, i) => i !== index);
    setEventData({ ...eventData, courses: newCourses });
  };

  // dodavanje novog slijeda
  const addCourse = (recipe) => {
    const newCourse = { courseType: currentCourseType, recipe: recipe };
    setEventData({
      ...eventData,
      courses: [...eventData.courses, newCourse],
    });
    setIsRecipeModalOpen(false);
    setRecipeSearchQuery("");
  };

  return (
    <div className="step-card">
      <h2>Menu Planning</h2>
      <p style={{ marginBottom: "1.5rem", color: "gray" }}>
        Build your perfect menu.
      </p>

      {/* lista dodanih slijedova */}
      {eventData.courses.length > 0 ? (
        <div className="added-courses-list">
          {eventData.courses.map((course, index) => (
            <div key={index} className="course-card-item">
              <div className="course-move-controls">
                <button
                  className="btn-move"
                  onClick={() => moveCourse(index, "up")}
                  disabled={index === 0}
                >
                  ▲
                </button>
                <button
                  className="btn-move"
                  onClick={() => moveCourse(index, "down")}
                  disabled={index === eventData.courses.length - 1}
                >
                  ▼
                </button>
              </div>
              <img
                src={course.recipe.image || "https://via.placeholder.com/60"}
                alt=""
                className="course-card-img"
              />
              <div className="course-card-info">
                <select
                  className="course-type-select"
                  value={course.courseType}
                  onChange={(e) => handleCourseTypeChange(index, e.target.value)}
                >
                  {COURSE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <h4 className="course-recipe-title">{course.recipe.title}</h4>
              </div>
              <button
                className="btn-remove-course"
                onClick={() => removeCourse(index)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: "2rem",
            border: "2px dashed #ccc",
            borderRadius: "12px",
            textAlign: "center",
            marginBottom: "1rem",
            opacity: 0.6,
          }}
        >
          🍽️ Your menu is empty.
        </div>
      )}

      <button className="btn-add-course" onClick={() => setIsRecipeModalOpen(true)}>
        + Add Course
      </button>

      {/* modal za dodavanje slijeda */}
      {isRecipeModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsRecipeModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add to Menu</h3>
              <button className="btn-close" onClick={() => setIsRecipeModalOpen(false)}>
                &times;
              </button>
            </div>
            <div className="form-group">
              <label>Course Type</label>
              <select
                className="form-select"
                value={currentCourseType}
                onChange={(e) => setCurrentCourseType(e.target.value)}
              >
                {COURSE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <input
                type="text"
                className="modal-search-input"
                placeholder="Search recipe..."
                value={recipeSearchQuery}
                onChange={(e) => setRecipeSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <div
              className="recipe-selection-list"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe._id}
                  className="recipe-select-item"
                  onClick={() => addCourse(recipe)}
                >
                  <img src={recipe.image || "https://via.placeholder.com/40"} alt="" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "bold" }}>{recipe.title}</div>
                  </div>
                  <span style={{ color: "var(--accent-color)", fontWeight: "bold" }}>+</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step2Menu;

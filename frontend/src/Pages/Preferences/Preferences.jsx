import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { userApi } from "../../api/userApi";
import Footer from "../../Components/Footer/Footer";
import AnimatedSection from "../../Components/AnimatedSection/AnimatedSection";
import SlidePageTransition from "../../Context/SlidePageTransition";
import "./preferences.css";

const AREA_FLAGS = {
  Algerian: "dz",
  American: "us",
  Argentinian: "ar",
  Australian: "au",
  British: "gb",
  Canadian: "ca",
  Chinese: "cn",
  Croatian: "hr",
  Dutch: "nl",
  Egyptian: "eg",
  Filipino: "ph",
  French: "fr",
  Greek: "gr",
  Indian: "in",
  Irish: "ie",
  Italian: "it",
  Jamaican: "jm",
  Japanese: "jp",
  Kenyan: "ke",
  Malaysian: "my",
  Mexican: "mx",
  Moroccan: "ma",
  Norwegian: "no",
  Polish: "pl",
  Portuguese: "pt",
  Russian: "ru",
  "Saudi Arabian": "sa",
  Slovakian: "sk",
  Spanish: "es",
  Syrian: "sy",
  Thai: "th",
  Tunisian: "tn",
  Turkish: "tr",
  Ukrainian: "ua",
  Uruguayan: "uy",
  Venezulan: "ve",
  Vietnamese: "vn",
  Unknown: "un",
};

const getFlagUrl = (areaName) => {
  const code = AREA_FLAGS[areaName];
  if (!code) return null;
  return `https://flagcdn.com/w80/${code}.png`;
};

const Preferences = () => {
  const { updateLocalUser } = useAuth();
  const navigate = useNavigate();

  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [selectedCats, setSelectedCats] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await userApi.getOnboardingOptions();

        setAvailableCategories(data.categories || []);
        setAvailableAreas(data.areas || []);

        if (data.existingPreferences) {
          const { categories, areas } = data.existingPreferences;
          if (
            (categories && categories.length > 0) ||
            (areas && areas.length > 0)
          ) {
            setSelectedCats(categories || []);
            setSelectedAreas(areas || []);
            setIsPrefilled(true);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Error loading options.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleCategory = (cat) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    if (error) setError("");
  };

  const toggleArea = (area) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
    if (error) setError("");
  };

  const handleSave = async () => {
    if (selectedCats.length < 3) {
      setError("Please select at least 3 food categories.");
      return;
    }

    setSubmitting(true);
    try {
      await userApi.savePreferences({
        categories: selectedCats,
        areas: selectedAreas,
      });

      if (updateLocalUser) {
        updateLocalUser({
          isOnboarded: true,
          preferences: { categories: selectedCats, areas: selectedAreas },
        });
      }

      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Error saving preferences.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="preferences-wrapper">
        <div className="loading-container">Loading options...</div>
      </div>
    );
  }

  return (
    <SlidePageTransition>
      <div className="preferences-wrapper">

        <header className="preferences-hero">
          <h1 className="preferences-title">Personalize Your Account</h1>
          <p className="preferences-subtitle">
            Choose what you like so we can recommend the best recipes.
          </p>

          {isPrefilled && (
            <div className="pref-suggestion-msg">
              ✨{" "}
              <b>
                We found some interests based on your Facebook likes!
              </b>
              <br />
              Feel free to edit them or add new ones.
            </div>
          )}
        </header>

        <AnimatedSection className="preferences-content">
          <div className="preferences-card">
            <div className="pref-section">
              <h3>Food Categories</h3>
              <span className="pref-instruction">
                Select at least 3 (Selected: {selectedCats.length})
              </span>

              <div className="pref-grid">
                {availableCategories.map((cat) => (
                  <div
                    key={cat.strCategory}
                    className={`pref-item ${
                      selectedCats.includes(cat.strCategory) ? "selected" : ""
                    }`}
                    onClick={() => toggleCategory(cat.strCategory)}
                  >
                    <span>{cat.strCategory}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pref-section">
              <h3>World Cuisines</h3>
              <span className="pref-instruction">
                Select (Selected: {selectedAreas.length})
              </span>
              <div className="pref-grid">
                {availableAreas.map((area) => {
                  const flagUrl = getFlagUrl(area.strArea);
                  return (
                    <div
                      key={area.strArea}
                      className={`pref-item ${
                        selectedAreas.includes(area.strArea) ? "selected" : ""
                      }`}
                      onClick={() => toggleArea(area.strArea)}
                    >
                      {flagUrl && (
                        <img
                          src={flagUrl}
                          alt={area.strArea}
                          className="pref-flag"
                          loading="lazy"
                        />
                      )}
                      <span>{area.strArea}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pref-actions">
              {error && <div className="pref-error">{error}</div>}
              <button
                className="pref-btn-save"
                onClick={handleSave}
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Finish Setup"}
              </button>
            </div>
          </div>
        </AnimatedSection>
        <Footer />
      </div>
    </SlidePageTransition>
  );
};

export default Preferences;

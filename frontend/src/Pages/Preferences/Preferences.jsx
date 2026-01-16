import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { userApi } from "../../api/userApi";
import Navbar from "../../Components/Navbars/NavbarLogin/Navbar";
import Footer from "../../Components/Footer/Footer";
import AnimatedSection from "../../Components/AnimatedSection/AnimatedSection";
import SlidePageTransition from "../../Context/SlidePageTransition";
import "./preferences.css";

// MAPIRANJE: Ime iz MealDB API-ja -> ISO kod države (za FlagCDN)
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

  // Stanje za pred-ispunjene podatke (Facebook)
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await userApi.getOnboardingOptions();

        setAvailableCategories(data.categories || []);
        setAvailableAreas(data.areas || []);

        // Provjera postojećih preferencija (s Facebooka)
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
        setError("Greška pri učitavanju opcija.");
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
      setError("Molimo odaberite barem 3 kategorije jela.");
      return;
    }
    // Opcionalno za areas
    // if (selectedAreas.length < 3) { ... }

    setSubmitting(true);
    try {
      await userApi.savePreferences({
        categories: selectedCats,
        areas: selectedAreas,
      });

      // Ažuriraj lokalni state
      if (updateLocalUser) {
        updateLocalUser({
          isOnboarded: true,
          preferences: { categories: selectedCats, areas: selectedAreas },
        });
      }

      navigate("/"); // Vrati na Home
    } catch (err) {
      console.error(err);
      setError("Greška pri spremanju.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="preferences-wrapper">
        <div className="loading-container">Učitavanje opcija...</div>
      </div>
    );
  }

  return (
    <SlidePageTransition>
      <div className="preferences-wrapper">
        <Navbar />

        <header className="preferences-hero">
          <h1 className="preferences-title">Personaliziraj svoj račun</h1>
          <p className="preferences-subtitle">
            Odaberi ono što voliš kako bismo ti mogli preporučiti najbolje
            recepte.
          </p>

          {isPrefilled && (
            <div className="pref-suggestion-msg">
              ✨{" "}
              <b>
                Pronašli smo neke interese na temelju tvojih Facebook lajkova!
              </b>
              <br />
              Slobodno ih uredi ili dodaj nove.
            </div>
          )}
        </header>

        <AnimatedSection className="preferences-content">
          <div className="preferences-card">
            {/* --- KATEGORIJE (GRID) --- */}
            <div className="pref-section">
              <h3>Kategorije jela</h3>
              <span className="pref-instruction">
                Odaberi barem 3 (Odabrano: {selectedCats.length})
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

            {/* --- KUHINJE (GRID) --- */}
            <div className="pref-section">
              <h3>Svjetske kuhinje</h3>
              <span className="pref-instruction">
                Odaberi (Odabrano: {selectedAreas.length})
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
                {submitting ? "Spremanje..." : "Završi postavljanje"}
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

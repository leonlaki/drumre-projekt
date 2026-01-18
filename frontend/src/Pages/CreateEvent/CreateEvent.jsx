// src/Pages/CreateEvent/CreateEvent.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../../Components/Footer/Footer";
import PageTransition from "../../Context/PageTransition";
import Spinner from "../../Components/Spinner/Spinner";
import { useAuth } from "../../Context/AuthContext";
import { recipeApi } from "../../api/recipeApi";
import { mealApi } from "../../api/mealApi";
import { playlistApi } from "../../api/playlistApi";
import { friendApi } from "../../api/friendApi";

// Import koraka
import Step1BasicInfo from "./Steps/Step1BasicInfo";
import Step2Menu from "./Steps/Step2Menu";
import Step3Atmosphere from "./Steps/Step3Atmosphere";
import Step4Guests from "./Steps/Step4Guests";
import Step5Review from "./Steps/Step5Review";

import "./createEvent.css";

const STEPS = [
  { id: 1, title: "Detalji" },
  { id: 2, title: "Jelovnik" },
  { id: 3, title: "Atmosfera" },
  { id: 4, title: "Gosti" },
  { id: 5, title: "Pregled" }
];

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // --- GLAVNI STATE ---
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    image: "",
    courses: [],
    playlistSongs: [],
    guests: []
  });

  // Podaci potrebni za korake
  const [availableRecipes, setAvailableRecipes] = useState([]);
  const [friendsList, setFriendsList] = useState([]);

  // --- DOHVAT PODATAKA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [myRes, savedRes, friendsRes] = await Promise.all([
           recipeApi.getUserRecipes(user.username),
           recipeApi.getSavedRecipes(),
           friendApi.getMyFriends()
        ]);
        
        // Obrada recepata
        const allRecipes = [...myRes, ...savedRes];
        const uniqueRecipes = Array.from(new Map(allRecipes.map(item => [item._id, item])).values());
        setAvailableRecipes(uniqueRecipes);

        // Obrada prijatelja
        setFriendsList(friendsRes || []);
      } catch (err) {
        console.error("Failed fetching initial data", err);
      }
    };
    fetchData();
  }, [user]);

  // --- NAVIGACIJA ---
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // --- SUBMIT LOGIKA ---
  const handleCreateEvent = async () => {
    setLoading(true);
    try {
      if (!eventData.title) throw new Error("Naslov je obavezan!");
      if (eventData.courses.length === 0) throw new Error("Dodaj barem jedan slijed!");

      let finalPlaylistId = null;

      // 1. Kreiraj playlistu ako postoji
      if (eventData.playlistSongs.length > 0) {
        const newPlaylist = await playlistApi.createPlaylist({
          name: `Playlist: ${eventData.title}`,
          description: `Generirana playlista za event "${eventData.title}"`
        });
        finalPlaylistId = newPlaylist._id;

        const songPromises = eventData.playlistSongs.map(song => 
           playlistApi.addSongToPlaylist(finalPlaylistId, {
             deezerId: song.id,
             title: song.title,
             artist: song.artist,
             albumCover: song.albumCover,
             previewUrl: song.previewUrl
           })
        );
        await Promise.all(songPromises);
      }

      // 2. Kreiraj Meal
      const mealPayload = {
        title: eventData.title,
        description: eventData.description,
        image: eventData.image || `https://placehold.co/600x400/orange/white?text=${encodeURIComponent(eventData.title)}`,
        date: eventData.date,
        location: eventData.location,
        courses: eventData.courses.map(c => ({
          courseType: c.courseType,
          recipe: c.recipe._id
        })),
        playlistId: finalPlaylistId,
        participants: eventData.guests
      };

      await mealApi.createMeal(mealPayload);
      navigate("/home");

    } catch (error) {
      console.error("Error creating event:", error);
      alert(error.message || "Došlo je do greške.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="create-event-wrapper">
      <PageTransition>
        <div className="create-event-container">
          
          {/* PROGRESS BAR */}
          <div className="wizard-progress">
             {STEPS.map((step) => (
                <div key={step.id} className={`wizard-step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}>
                   <div className="step-number">{currentStep > step.id ? '✓' : step.id}</div>
                   <span>{step.title}</span>
                </div>
             ))}
          </div>

          {/* RENDER KORAKA */}
          <AnimatePresence mode="wait">
             <motion.div
               key={currentStep}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.3 }}
             >
               {currentStep === 1 && (
                  <Step1BasicInfo eventData={eventData} setEventData={setEventData} />
               )}
               {currentStep === 2 && (
                  <Step2Menu eventData={eventData} setEventData={setEventData} availableRecipes={availableRecipes} />
               )}
               {currentStep === 3 && (
                  <Step3Atmosphere eventData={eventData} setEventData={setEventData} />
               )}
               {currentStep === 4 && (
                  <Step4Guests eventData={eventData} setEventData={setEventData} friendsList={friendsList} />
               )}
               {currentStep === 5 && (
                  <Step5Review eventData={eventData} friendsList={friendsList} onPublish={handleCreateEvent} loading={loading} />
               )}
             </motion.div>
          </AnimatePresence>

          {/* AKCIJE */}
          <div className="wizard-actions">
             <button className="btn-prev" onClick={prevStep} disabled={currentStep === 1} style={{visibility: currentStep === 1 ? 'hidden' : 'visible'}}>
               Natrag
             </button>
             {currentStep < 5 && (
               <button className="btn-next" onClick={nextStep}>Dalje</button>
             )}
          </div>

        </div>
      </PageTransition>
      <Footer />
    </div>
  );
};

export default CreateEvent;
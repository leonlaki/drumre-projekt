import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { userApi } from "../../api/userApi";
import { mealApi } from "../../api/mealApi"; // <--- NOVI IMPORT
import Footer from "../../Components/Footer/Footer";
import PokemonSelector from "../../Components/PokemonSelector/PokemonSelector";
import EventCard from "../../Components/EventCard/EventCard"; // <--- NOVI IMPORT
import "./profilePage.css";
import SlidePageTransition from "../../Context/SlidePageTransition";

const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser, updateLocalUser } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  
  // Novi state za evente
  const [myEvents, setMyEvents] = useState([]);
  const [participatingEvents, setParticipatingEvents] = useState([]);

  const [stats, setStats] = useState({ 
    meals: 0, 
    recipes: 0, 
    views: 0, 
    likes: 0,
    avgRating: 0 // <--- NOVO
  });
  
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ bio: "", location: "", avatar: "" });
  const [selectedPokemonId, setSelectedPokemonId] = useState(null);

  const isMyProfile = !username || (currentUser && username === currentUser.username);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const targetUsername = username || currentUser?.username;
        if (!targetUsername) return;

        const data = await userApi.getUserProfile(targetUsername);
        setProfileData(data.profile);
        setStats(data.stats);
        
        // Postavi evente
        setMyEvents(data.myEvents || []);
        setParticipatingEvents(data.participatingEvents || []);

        if (isMyProfile) {
          setEditForm({
            bio: data.profile.bio || "",
            location: data.profile.location || "",
            avatar: data.profile.avatar || "",
          });
        }
      } catch (error) {
        console.error("Greška pri dohvatu profila:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, currentUser, isMyProfile]);

  // --- HANDLERS ---
  const handleDeleteEvent = async (e, eventId) => {
    e.stopPropagation(); // Da ne otvori detalje
    if (!window.confirm("Jeste li sigurni da želite obrisati ovaj event?")) return;
    try {
      await mealApi.deleteMeal(eventId);
      setMyEvents(prev => prev.filter(ev => ev._id !== eventId));
    } catch (err) {
      alert("Greška pri brisanju.");
    }
  };

  const handleLeaveEvent = async (e, eventId) => {
    e.stopPropagation();
    if (!window.confirm("Želite li napustiti ovaj event?")) return;
    try {
      await mealApi.leaveMeal(eventId);
      setParticipatingEvents(prev => prev.filter(ev => ev._id !== eventId));
    } catch (err) {
      alert("Greška pri izlasku.");
    }
  };

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });
  
  const handlePokemonSelect = (pokemon) => {
    setSelectedPokemonId(pokemon.id);
    setEditForm({ ...editForm, avatar: pokemon.avatar });
  };

  const handleSaveProfile = async () => {
    try {
      if (selectedPokemonId) await userApi.setPokemonAvatar(selectedPokemonId);
      const updatedUser = await userApi.updateMyProfile({ ...editForm });
      updateLocalUser(updatedUser);
      setProfileData(updatedUser);
      setIsEditing(false);
    } catch (error) {
      alert("Došlo je do greške pri spremanju profila.");
    }
  };

  // TO DO dadati sponere a ne ovo
  if (loading) return <div className="loading-screen"></div>;
  if (!profileData) return <div className="error-screen"></div>;

  return (
      <div className="profile-wrapper">
        <SlidePageTransition>
        <div className="profile-container">
          
          {/* HEADER PROFILA */}
          <div className="profile-header-card">
            <div className="profile-avatar-section">
              <img src={profileData.avatar || "https://via.placeholder.com/150"} alt="Avatar" className="profile-avatar-lg" />
              {isMyProfile && !isEditing && (
                <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>Uredi Profil</button>
              )}
            </div>

            <div className="profile-info-section">
              {!isEditing ? (
                <>
                  <h1 className="profile-username">@{profileData.username}</h1>
                  <p className="profile-bio">{profileData.bio || "Ovaj korisnik još nije napisao opis."}</p>
                  <div className="profile-meta">
                     {profileData.location && <span>📍 {profileData.location}</span>}
                     <span>📅 Član od {new Date(profileData.createdAt).toLocaleDateString()}</span>
                  </div>
                </>
              ) : (
                <div className="edit-profile-form">
                  <h3>Uredi Profil</h3>
                  <textarea name="bio" value={editForm.bio} onChange={handleEditChange} rows="3" placeholder="Opis..." />
                  <input type="text" name="location" value={editForm.location} onChange={handleEditChange} placeholder="Lokacija" />
                  <label>Promijeni Pokémona</label>
                  <PokemonSelector selectedId={selectedPokemonId} onSelect={handlePokemonSelect} />
                  <div className="edit-actions">
                    <button className="btn-save" onClick={handleSaveProfile}>Spremi</button>
                    <button className="btn-cancel" onClick={() => setIsEditing(false)}>Odustani</button>
                  </div>
                </div>
              )}
            </div>

            {/* AŽURIRANA STATISTIKA */}
            <div className="profile-stats">
               <div className="stat-box">
                 <span className="stat-number">{stats.meals}</span>
                 <span className="stat-label">Objava</span>
               </div>
               <div className="stat-box">
                 <span className="stat-number">{stats.likes}</span>
                 <span className="stat-label">Glasova</span>
               </div>
               <div className="stat-box">
                 <span className="stat-number">{stats.avgRating ? stats.avgRating.toFixed(1) : "0.0"}</span>
                 <span className="stat-label">Prosjek</span>
               </div>
               <div className="stat-box">
                 <span className="stat-number">{stats.views}</span>
                 <span className="stat-label">Pregleda</span>
               </div>
            </div>
          </div>

          {/* LISTE EVENATA */}
          <div className="profile-events-section">
            
            {/* 1. MOJI EVENTI */}
            <div className="events-group">
               <h3 className="group-title">Moji Eventi ({myEvents.length})</h3>
               {myEvents.length > 0 ? (
                 <div className="events-grid-profile">
                    {myEvents.map(event => (
                       <div key={event._id} className="profile-event-wrapper">
                          <EventCard event={event} />
                          {/* Gumb za brisanje (samo ako je moj profil i moj event) */}
                          {isMyProfile && (
                             <button className="btn-delete-event" onClick={(e) => handleDeleteEvent(e, event._id)}>
                                🗑️ Obriši
                             </button>
                          )}
                       </div>
                    ))}
                 </div>
               ) : (
                 <p className="empty-msg">Još nisi kreirao nijedan event.</p>
               )}
            </div>

            {/* 2. SUDJELOVANJA */}
            <div className="events-group">
               <h3 className="group-title">Sudjelovanja ({participatingEvents.length})</h3>
               {participatingEvents.length > 0 ? (
                 <div className="events-grid-profile">
                    {participatingEvents.map(event => (
                       <div key={event._id} className="profile-event-wrapper">
                          <EventCard event={event} />
                          {/* Gumb za izlazak (samo ako je moj profil) */}
                          {isMyProfile && (
                             <button className="btn-leave-event" onClick={(e) => handleLeaveEvent(e, event._id)}>
                                🚪 Izađi
                             </button>
                          )}
                       </div>
                    ))}
                 </div>
               ) : (
                 <p className="empty-msg">Nemaš evenata u kojima sudjeluješ.</p>
               )}
            </div>

          </div>

        </div>
        <Footer />
        </SlidePageTransition>
      </div>
  );
};

export default ProfilePage;
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { userApi } from "../../api/userApi";
import Navbar from "../../Components/Navbars/NavbarLogedUser/Navbar";
import Footer from "../../Components/Footer/Footer";
import PokemonSelector from "../../Components/PokemonSelector/PokemonSelector";
import "./profilePage.css"; // CSS ćemo dodati ispod
import SlidePageTransition from "../../Context/SlidePageTransition";

const ProfilePage = () => {
  const { username } = useParams(); // Čitamo username iz URL-a
  const { user: currentUser, updateLocalUser } = useAuth(); // Trenutno logirani user
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({ 
    meals: 0, 
    recipes: 0, 
    views: 0, 
    likes: 0 
  });
  const [loading, setLoading] = useState(true);

  // --- STATE ZA EDIT MODE ---
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: "",
    location: "",
    avatar: "", // URL avatara
  });
  const [selectedPokemonId, setSelectedPokemonId] = useState(null); // ID za selector

  // 1. Provjeri čiji profil gledamo
  // Ako nema parametra u URL-u ili je parametar isti kao moj username -> gledam svoj profil
  const isMyProfile =
    !username || (currentUser && username === currentUser.username);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Ako gledamo svoj, uzmi currentUser.username, inače onaj iz URL-a
        const targetUsername = username || currentUser?.username;
        if (!targetUsername) return;

        const data = await userApi.getUserProfile(targetUsername);
        setProfileData(data.profile);
        setStats(data.stats);

        // Pripremi formu za editiranje
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

  // HANDLERS ZA EDITIRANJE
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handlePokemonSelect = (pokemon) => {
    setSelectedPokemonId(pokemon.id);
    setEditForm({ ...editForm, avatar: pokemon.avatar }); // Odmah prikaži preview
  };

  const handleSaveProfile = async () => {
    try {
      // 1. Ako je odabran novi Pokemon, prvo to spremi (poseban API call)
      // (Ili možemo sve u jednom updateMyProfile, ali tvoj backend ima odvojene rute)
      // Tvoj backend za updateMyProfile prima 'avatar' string, tako da možemo sve odjednom
      // ako pošaljemo URL gifa. Ali tvoj userController za pokemone ima posebnu logiku.
      // Najsigurnije je koristiti tvoju Pokemon rutu ako je ID promijenjen.
      
      if (selectedPokemonId) {
          await userApi.setPokemonAvatar(selectedPokemonId);
      }

      // 2. Ažuriraj tekstualne podatke
      const updatedUser = await userApi.updateMyProfile({
        bio: editForm.bio,
        location: editForm.location,
        avatar: editForm.avatar // Šaljemo i URL za svaki slučaj
      });

      // 3. Ažuriraj lokalni context i state stranice
      updateLocalUser(updatedUser);
      setProfileData(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error("Greška pri spremanju:", error);
      alert("Došlo je do greške pri spremanju profila.");
    }
  };

  if (loading) return <div className="loading-screen"></div>;
  if (!profileData) return <div className="error-screen"></div>;

  return (
    <SlidePageTransition>
      <div className="profile-wrapper">
        <Navbar />
        
        <div className="profile-container">
          
          {/* HEADER PROFILA */}
          <div className="profile-header-card">
            <div className="profile-avatar-section">
              <img 
                src={profileData.avatar || "https://via.placeholder.com/150"} 
                alt="Avatar" 
                className="profile-avatar-lg" 
              />
              {isMyProfile && !isEditing && (
                <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>
                  Uredi Profil
                </button>
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
                /* FORMA ZA EDITIRANJE */
                <div className="edit-profile-form">
                  <h3>Uredi Profil</h3>
                  
                  <label>Tvoj Bio</label>
                  <textarea 
                    name="bio" 
                    value={editForm.bio} 
                    onChange={handleEditChange} 
                    rows="3"
                  />

                  <label>Lokacija</label>
                  <input 
                    type="text" 
                    name="location" 
                    value={editForm.location} 
                    onChange={handleEditChange} 
                  />

                  <label>Promijeni Pokémona</label>
                  {/* Ovdje ubacujemo naš selector */}
                  <PokemonSelector 
                    selectedId={selectedPokemonId} 
                    onSelect={handlePokemonSelect} 
                  />

                  <div className="edit-actions">
                    <button className="btn-save" onClick={handleSaveProfile}>Spremi</button>
                    <button className="btn-cancel" onClick={() => setIsEditing(false)}>Odustani</button>
                  </div>
                </div>
              )}
            </div>

            {/* STATISTIKA */}
            <div className="profile-stats">
               {/* 1. OBROCI */}
               <div className="stat-box">
                 <span className="stat-number">{stats.meals}</span>
                 <span className="stat-label">Objava</span>
               </div>
               
               {/* 2. RECEPTI */}
               <div className="stat-box">
                 <span className="stat-number">{stats.recipes}</span>
                 <span className="stat-label">Recepta</span>
               </div>

               {/* 3. TOTAL LIKES (Umjesto playlista) */}
               <div className="stat-box">
                 <span className="stat-number">{stats.likes}</span>
                 <span className="stat-label">Lajkova</span>
               </div>

               {/* 4. TOTAL VIEWS (Novo) */}
               <div className="stat-box">
                 <span className="stat-number">{stats.views}</span>
                 <span className="stat-label">Pregleda</span>
               </div>
            </div>
          </div>

          {/* OVDJE ĆE IĆI TABOVI ZA OBROKE/RECEPTE (Kasnije) */}
          <div className="profile-content-placeholder">
            <p>Ovdje će se prikazivati korisnikovi postovi (Obroci, Recepti, Playliste).</p>
          </div>

        </div>

        <Footer />
      </div>
    </SlidePageTransition>
  );
};

export default ProfilePage;
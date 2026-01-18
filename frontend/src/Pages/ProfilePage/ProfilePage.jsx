import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { userApi } from "../../api/userApi";
import { mealApi } from "../../api/mealApi";
import Footer from "../../Components/Footer/Footer";
import PokemonSelector from "../../Components/PokemonSelector/PokemonSelector";
import EventCard from "../../Components/EventCard/EventCard";
import "./profilePage.css";
import SlidePageTransition from "../../Context/SlidePageTransition";

const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser, updateLocalUser } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [participatingEvents, setParticipatingEvents] = useState([]);

  const [stats, setStats] = useState({ 
    meals: 0, 
    recipes: 0, 
    views: 0, 
    likes: 0,
    avgRating: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ bio: "", location: "", avatar: "" });
  const [selectedPokemonId, setSelectedPokemonId] = useState(null);

  const isMyProfile = !username || (currentUser && username === currentUser.username);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const targetUsername = username || currentUser?.username;
        if (!targetUsername) return;

        const data = await userApi.getUserProfile(targetUsername);
        setProfileData(data.profile);
        setStats(data.stats);
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
        console.error("error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, currentUser, isMyProfile]);

  const handleDeleteEvent = async (e, eventId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await mealApi.deleteMeal(eventId);
      setMyEvents(prev => prev.filter(ev => ev._id !== eventId));
    } catch (err) {
      alert("Error deleting event.");
    }
  };

  const handleLeaveEvent = async (e, eventId) => {
    e.stopPropagation();
    if (!window.confirm("Do you want to leave this event?")) return;
    try {
      await mealApi.leaveMeal(eventId);
      setParticipatingEvents(prev => prev.filter(ev => ev._id !== eventId));
    } catch (err) {
      alert("Error leaving event.");
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
      alert("Error saving profile.");
    }
  };

  if (loading) return <div className="loading-screen"></div>;
  if (!profileData) return <div className="error-screen"></div>;

  return (
      <div className="profile-wrapper">
        <SlidePageTransition>
        <div className="profile-container">
          
          <div className="profile-header-card">
            <div className="profile-avatar-section">
              <img src={profileData.avatar || "https://via.placeholder.com/150"} alt="Avatar" className="profile-avatar-lg" />
              {isMyProfile && !isEditing && (
                <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>Edit Profile</button>
              )}
            </div>

            <div className="profile-info-section">
              {!isEditing ? (
                <>
                  <h1 className="profile-username">@{profileData.username}</h1>
                  <p className="profile-bio">{profileData.bio || "This user hasn't written a bio yet."}</p>
                  <div className="profile-meta">
                     {profileData.location && <span>📍 {profileData.location}</span>}
                     <span>📅 Member since {new Date(profileData.createdAt).toLocaleDateString()}</span>
                  </div>
                </>
              ) : (
                <div className="edit-profile-form">
                  <h3>Edit Profile</h3>
                  <textarea name="bio" value={editForm.bio} onChange={handleEditChange} rows="3" placeholder="Bio..." />
                  <input type="text" name="location" value={editForm.location} onChange={handleEditChange} placeholder="Location" />
                  <label>Change Pokémon</label>
                  <PokemonSelector selectedId={selectedPokemonId} onSelect={handlePokemonSelect} />
                  <div className="edit-actions">
                    <button className="btn-save" onClick={handleSaveProfile}>Save</button>
                    <button className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>

            <div className="profile-stats">
               <div className="stat-box">
                 <span className="stat-number">{stats.meals}</span>
                 <span className="stat-label">Posts</span>
               </div>
               <div className="stat-box">
                 <span className="stat-number">{stats.likes}</span>
                 <span className="stat-label">Likes</span>
               </div>
               <div className="stat-box">
                 <span className="stat-number">{stats.avgRating ? stats.avgRating.toFixed(1) : "0.0"}</span>
                 <span className="stat-label">Average</span>
               </div>
               <div className="stat-box">
                 <span className="stat-number">{stats.views}</span>
                 <span className="stat-label">Views</span>
               </div>
            </div>
          </div>

          <div className="profile-events-section">
            
            <div className="events-group">
               <h3 className="group-title">My Events ({myEvents.length})</h3>
               {myEvents.length > 0 ? (
                 <div className="events-grid-profile">
                    {myEvents.map(event => (
                       <div key={event._id} className="profile-event-wrapper">
                          <EventCard event={event} />
                          {isMyProfile && (
                             <button className="btn-delete-event" onClick={(e) => handleDeleteEvent(e, event._id)}>
                                🗑️ Delete
                             </button>
                          )}
                       </div>
                    ))}
                 </div>
               ) : (
                 <p className="empty-msg">You haven't created any events yet.</p>
               )}
            </div>

            <div className="events-group">
               <h3 className="group-title">Participations ({participatingEvents.length})</h3>
               {participatingEvents.length > 0 ? (
                 <div className="events-grid-profile">
                    {participatingEvents.map(event => (
                       <div key={event._id} className="profile-event-wrapper">
                          <EventCard event={event} />
                          {isMyProfile && (
                             <button className="btn-leave-event" onClick={(e) => handleLeaveEvent(e, event._id)}>
                                🚪 Leave
                             </button>
                          )}
                       </div>
                    ))}
                 </div>
               ) : (
                 <p className="empty-msg">You have no events you are participating in.</p>
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

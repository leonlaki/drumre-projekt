import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../Components/Navbars/NavbarLogedUser/Navbar";
import Footer from "../../Components/Footer/Footer";
import PageTransition from "../../Context/PageTransition";
import Spinner from "../../Components/Spinner/Spinner";

// API
import { friendApi } from "../../api/friendApi";
import { eventInviteApi } from "../../api/eventInviteApi";

import "./notifications.css";

const Notifications = () => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [eventInvites, setEventInvites] = useState([]);
  
  // UI STATE
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'friends', 'events'

  // --- FETCH DATA ---
  useEffect(() => {
    const initData = async () => {
       const minLoading = new Promise(resolve => setTimeout(resolve, 1500));

       try {
         const [friendsRes, eventsRes] = await Promise.all([
           friendApi.getPendingRequests(),
           eventInviteApi.getMyInvites(),
           minLoading
         ]);

         setFriendRequests(friendsRes);
         setEventInvites(eventsRes);
         
         // Ažuriraj localStorage da navbar bude sinkroniziran odmah
         const total = (friendsRes?.length || 0) + (eventsRes?.length || 0);
         localStorage.setItem("notifCount", total);

       } catch (error) {
         console.error("Greška pri dohvatu notifikacija", error);
       } finally {
         setLoading(false);
       }
    };

    initData();
  }, []);

  // --- HANDLERS ---
  const handleFriendAction = async (id, action) => {
    try {
      if (action === 'accept') await friendApi.acceptRequest(id);
      else await friendApi.rejectRequest(id);
      
      const updatedList = friendRequests.filter(req => req._id !== id);
      setFriendRequests(updatedList);
      
      // Ažuriraj localStorage za navbar
      const total = updatedList.length + eventInvites.length;
      localStorage.setItem("notifCount", total);
      // Trigger event da navbar zna da se promijenilo (opcionalno, ali dobro za UX)
      window.dispatchEvent(new Event("storage"));

    } catch (error) {
      alert("Došlo je do greške");
    }
  };

  const handleEventAction = async (id, action) => {
    try {
      if (action === 'accept') await eventInviteApi.acceptInvite(id);
      else await eventInviteApi.rejectInvite(id);

      const updatedList = eventInvites.filter(inv => inv._id !== id);
      setEventInvites(updatedList);

      // Ažuriraj localStorage
      const total = friendRequests.length + updatedList.length;
      localStorage.setItem("notifCount", total);
      window.dispatchEvent(new Event("storage"));

    } catch (error) {
      alert("Došlo je do greške");
    }
  };

  // --- RENDER CONTENT ---
  const renderContent = () => {
    const hasFriendRequests = friendRequests.length > 0;
    const hasEventInvites = eventInvites.length > 0;

    // 1. SCENARIJ: TAB "SVE" JE PRAZAN (Nema ničega uopće)
    if (activeTab === 'all' && !hasFriendRequests && !hasEventInvites) {
        return <p className="empty-msg-large">Trenutno nemaš novih obavijesti. 📭</p>;
    }

    // 2. SCENARIJ: ODABRAN TAB "PRIJATELJI", A NEMA IH
    if (activeTab === 'friends' && !hasFriendRequests) {
        return <p className="empty-msg-large">Nemaš zahtjeva za prijateljstvo. 👥</p>;
    }

    // 3. SCENARIJ: ODABRAN TAB "EVENTI", A NEMA IH
    if (activeTab === 'events' && !hasEventInvites) {
        return <p className="empty-msg-large">Nemaš zahtjeva za eventove. 🍽️</p>;
    }

    return (
      <div className="notif-content-wrapper">
         {/* SEKCIJA PRIJATELJI (Prikaži ako smo na 'all' ili 'friends', I ako ima zahtjeva) */}
         {(activeTab === 'all' || activeTab === 'friends') && hasFriendRequests && (
           <div className="section-block">
             <h3>Zahtjevi za prijateljstvo</h3>
             {friendRequests.map((req) => (
                  <motion.div 
                    key={req._id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="notif-card friend-card"
                  >
                    <div className="notif-info">
                      <img src={req.from.avatar} alt="" className="notif-avatar" />
                      <div>
                        <span className="notif-user">@{req.from.username}</span>
                        <span className="notif-text"> želi biti tvoj prijatelj.</span>
                      </div>
                    </div>
                    <div className="notif-actions">
                      <button className="btn-accept" onClick={() => handleFriendAction(req._id, 'accept')}>Prihvati</button>
                      <button className="btn-reject" onClick={() => handleFriendAction(req._id, 'reject')}>✕</button>
                    </div>
                  </motion.div>
                ))}
           </div>
         )}

         {/* DIVIDER (Samo ako su oba prikazana u 'all' tabu) */}
         {activeTab === 'all' && hasFriendRequests && hasEventInvites && (
            <div className="section-divider" />
         )}

         {/* SEKCIJA EVENTI (Prikaži ako smo na 'all' ili 'events', I ako ima pozivnica) */}
         {(activeTab === 'all' || activeTab === 'events') && hasEventInvites && (
           <div className="section-block">
             <h3>Pozivnice za Evente</h3>
             {eventInvites.map((inv) => (
                  <motion.div 
                    key={inv._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="notif-card event-card"
                  >
                    <div className="notif-info">
                      <div className="event-img-wrapper">
                         <img src={inv.meal.image || "https://via.placeholder.com/50"} alt="" className="event-thumb" />
                         <img src={inv.from.avatar} alt="" className="host-avatar-small" />
                      </div>
                      <div style={{marginLeft: '10px'}}>
                        <span className="notif-user">@{inv.from.username}</span>
                        <span className="notif-text"> te poziva na:</span>
                        <div className="event-name-highlight">{inv.meal.title}</div>
                        <div className="event-meta">
                           📅 {new Date(inv.meal.date).toLocaleDateString()} • 📍 {inv.meal.location}
                        </div>
                      </div>
                    </div>
                    <div className="notif-actions">
                      <button className="btn-accept" onClick={() => handleEventAction(inv._id, 'accept')}>Dolazim! 🍽️</button>
                      <button className="btn-reject" onClick={() => handleEventAction(inv._id, 'reject')}>✕</button>
                    </div>
                  </motion.div>
                ))}
           </div>
         )}
      </div>
    );
  };

  return (
    <div className="notifications-wrapper">
      <Navbar />
      <PageTransition>
        <div className="notifications-container">
          <header className="notif-header">
            <h1>Obavijesti</h1>
          </header>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loader" exit={{ opacity: 0 }} className="spinner-center-container">
                <Spinner />
              </motion.div>
            ) : (
              <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                
                {/* TABS */}
                <div className="notif-tabs">
                   <button className={activeTab === 'all' ? 'active' : ''} onClick={() => setActiveTab('all')}>
                     Sve
                   </button>
                   <button className={activeTab === 'friends' ? 'active' : ''} onClick={() => setActiveTab('friends')}>
                     Prijatelji {friendRequests.length > 0 && <span className="tab-badge">{friendRequests.length}</span>}
                   </button>
                   <button className={activeTab === 'events' ? 'active' : ''} onClick={() => setActiveTab('events')}>
                     Eventi {eventInvites.length > 0 && <span className="tab-badge">{eventInvites.length}</span>}
                   </button>
                </div>

                <AnimatePresence mode="wait">
                   <motion.div
                     key={activeTab}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     transition={{ duration: 0.3 }}
                   >
                     {renderContent()}
                   </motion.div>
                </AnimatePresence>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
      <Footer />
    </div>
  );
};

export default Notifications;
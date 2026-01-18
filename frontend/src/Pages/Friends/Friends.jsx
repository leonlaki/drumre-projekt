import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../../Components/Footer/Footer";
import PageTransition from "../../Context/PageTransition";
import { userApi } from "../../api/userApi";
import { friendApi } from "../../api/friendApi";
import "./Friends.css";

const Friends = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [myFriends, setMyFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [pendingUsers, setPendingUsers] = useState([]);

  // 1. Učitaj trenutne prijatelje pri otvaranju
  const fetchInitialData = async () => {
    try {
      setLoadingFriends(true);

      // Paralelno dohvati prijatelje i poslane zahtjeve
      const [friendsData, sentRequestsData] = await Promise.all([
        friendApi.getMyFriends(),
        friendApi.getSentRequests(),
      ]);

      setMyFriends(friendsData);
      setPendingUsers(sentRequestsData);
    } catch (error) {
      console.error("Greška pri dohvatu podataka", error);
    } finally {
      setLoadingFriends(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // 2. DEBOUNCE LOGIKA ZA PRETRAGU
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Postavi timer koji šalje upit za 300ms
    const delayDebounceFn = setTimeout(async () => {
      try {
        console.log("Šaljem upit za:", query);
        const results = await userApi.searchUsers(query);

        setSearchResults(results);
      } catch (error) {
        console.error("Greška pretrage", error);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // 3. Pošalji zahtjev za prijateljstvo
  const handleSendRequest = async (userId) => {
    try {
      setPendingUsers((prev) => [...prev, userId]);
      await friendApi.sendRequest(userId);
    } catch (error) {
      console.error("Greška:", error);
      if (error.response?.status !== 400) {
        setPendingUsers((prev) => prev.filter((id) => id !== userId));
      }
    }
  };

  // 4. Otkazivanje poslanog zahtjeva
  const handleCancelRequest = async (userId) => {
    try {
      setPendingUsers((prev) => prev.filter((id) => id !== userId));
      await friendApi.cancelRequest(userId);
    } catch (error) {
      console.error("Greška pri otkazivanju", error);
      setPendingUsers((prev) => [...prev, userId]);
    }
  };

  // 5. Obriši prijatelja
  const handleUnfriend = async (friendId) => {
    if (!window.confirm("Sigurno želiš ukloniti ovog prijatelja?")) return;
    try {
      await friendApi.unfriend(friendId);
      fetchFriends();
    } catch (error) {
      alert("Greška pri brisanju");
    }
  };

  // Pomoćna funkcija da provjerimo je li user već prijatelj
  const isAlreadyFriend = (userId) => {
    return myFriends.some((f) => f._id === userId);
  };

  return (
    <div className="friends-wrapper">
  
      <PageTransition>
        <div className="friends-container">
          <h1>Friends & Community</h1>

          <div className="search-section">
            <h3>Pronađi nove gurmane</h3>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Upiši ime ili korisničko ime..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>

            {searchResults.length > 0 && (
              <div className="search-results-list">
                {searchResults.map((user) => {
                  const isPending = pendingUsers.includes(user._id);
                  const isFriend = isAlreadyFriend(user._id);

                  return (
                    <div key={user._id} className="user-card-small">
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <img
                          src={user.avatar || "https://via.placeholder.com/40"}
                          alt={user.username}
                        />
                        <div className="user-info">
                          <Link
                            to={`/profile/${user.username}`}
                            className="username-link"
                          >
                            {user.name}{" "}
                            <span
                              style={{ color: "#666", fontWeight: "normal" }}
                            >
                              (@{user.username})
                            </span>
                          </Link>
                        </div>
                      </div>

                      {isFriend ? (
                        <span className="badge-friend">Prijatelj ✔</span>
                      ) : isPending ? (
                        <button
                          className="btn-cancel-request"
                          onClick={() => handleCancelRequest(user._id)}
                        >
                          Otkaži ✕
                        </button>
                      ) : (
                        <button
                          className="btn-add-friend"
                          onClick={() => handleSendRequest(user._id)}
                        >
                          Dodaj +
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {query && searchResults.length === 0 && (
              <p
                style={{ marginTop: "10px", color: "#666", fontSize: "0.9rem" }}
              >
                Nema rezultata.
              </p>
            )}
          </div>

          <hr className="divider" />

          <div className="my-friends-section">
            <h3>Moji prijatelji ({myFriends.length})</h3>
            {loadingFriends ? (
              <p>Učitavanje...</p>
            ) : (
              <div className="friends-grid">
                {myFriends.map((friend) => (
                  <div key={friend._id} className="friend-card">
                    <Link to={`/profile/${friend.username}`}>
                      <img
                        src={friend.avatar || "https://via.placeholder.com/80"}
                        alt={friend.username}
                        className="friend-avatar"
                      />
                    </Link>
                    <Link
                      to={`/profile/${friend.username}`}
                      className="friend-name"
                    >
                      {friend.username}
                    </Link>
                    <button
                      className="btn-unfriend"
                      onClick={() => handleUnfriend(friend._id)}
                    >
                      Ukloni
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageTransition>
      <Footer />
    </div>
  );
};

export default Friends;

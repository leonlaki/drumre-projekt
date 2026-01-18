import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../../Components/Footer/Footer";
import PageTransition from "../../Context/PageTransition";
import Spinner from "../../Components/Spinner/Spinner";

import { friendApi } from "../../api/friendApi";
import { eventInviteApi } from "../../api/eventInviteApi";

import "./notifications.css";

const Notifications = () => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [eventInvites, setEventInvites] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const initData = async () => {
      const minLoading = new Promise((resolve) => setTimeout(resolve, 1500));

      try {
        const [friendsRes, eventsRes] = await Promise.all([
          friendApi.getPendingRequests(),
          eventInviteApi.getMyInvites(),
          minLoading,
        ]);

        setFriendRequests(friendsRes);
        setEventInvites(eventsRes);

        const total = (friendsRes?.length || 0) + (eventsRes?.length || 0);
        localStorage.setItem("notifCount", total);
      } catch (error) {
        console.error("Error fetching notifications", error);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  const handleFriendAction = async (id, action) => {
    try {
      if (action === "accept") await friendApi.acceptRequest(id);
      else await friendApi.rejectRequest(id);

      const updatedList = friendRequests.filter((req) => req._id !== id);
      setFriendRequests(updatedList);

      const total = updatedList.length + eventInvites.length;
      localStorage.setItem("notifCount", total);
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      alert("An error occurred");
    }
  };

  const handleEventAction = async (id, action) => {
    try {
      if (action === "accept") await eventInviteApi.acceptInvite(id);
      else await eventInviteApi.rejectInvite(id);

      const updatedList = eventInvites.filter((inv) => inv._id !== id);
      setEventInvites(updatedList);

      const total = friendRequests.length + updatedList.length;
      localStorage.setItem("notifCount", total);
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      alert("An error occurred");
    }
  };

  const renderContent = () => {
    const hasFriendRequests = friendRequests.length > 0;
    const hasEventInvites = eventInvites.length > 0;

    if (activeTab === "all" && !hasFriendRequests && !hasEventInvites) {
      return (
        <p className="empty-msg-large">
          You currently have no new notifications. 📭
        </p>
      );
    }

    if (activeTab === "friends" && !hasFriendRequests) {
      return <p className="empty-msg-large">No friend requests. 👥</p>;
    }

    if (activeTab === "events" && !hasEventInvites) {
      return <p className="empty-msg-large">No event invites. 🍽️</p>;
    }

    return (
      <div className="notif-content-wrapper">
        {(activeTab === "all" || activeTab === "friends") &&
          hasFriendRequests && (
            <div className="section-block">
              <h3>Friend Requests</h3>
              {friendRequests.map((req) => (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="notif-card friend-card"
                >
                  <div className="notif-info">
                    <img
                      src={req.from.avatar}
                      alt=""
                      className="notif-avatar"
                    />
                    <div>
                      <span className="notif-user">@{req.from.username}</span>
                      <span className="notif-text">
                        {" "}
                        wants to be your friend.
                      </span>
                    </div>
                  </div>
                  <div className="notif-actions">
                    <button
                      className="btn-accept"
                      onClick={() => handleFriendAction(req._id, "accept")}
                    >
                      Accept
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleFriendAction(req._id, "reject")}
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        {activeTab === "all" && hasFriendRequests && hasEventInvites && (
          <div className="section-divider" />
        )}

        {(activeTab === "all" || activeTab === "events") && hasEventInvites && (
          <div className="section-block">
            <h3>Event Invites</h3>
            {eventInvites.map((inv) => {
              if (!inv.meal || !inv.from) return null;

              return (
                <motion.div
                  key={inv._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="notif-card event-card"
                >
                  <div className="notif-info">
                    <div className="event-img-wrapper">
                      <img
                        src={inv.meal.image || "https://via.placeholder.com/50"}
                        alt=""
                        className="event-thumb"
                      />
                      <img
                        src={
                          inv.from.avatar || "https://via.placeholder.com/40"
                        }
                        alt=""
                        className="host-avatar-small"
                      />
                    </div>
                    <div style={{ marginLeft: "10px" }}>
                      <span className="notif-user">@{inv.from.username}</span>
                      <span className="notif-text"> invites you to:</span>
                      <div className="event-name-highlight">
                        {inv.meal.title}
                      </div>
                      <div className="event-meta">
                        📅 {new Date(inv.meal.date).toLocaleDateString()} • 📍{" "}
                        {inv.meal.location}
                      </div>
                    </div>
                  </div>
                  <div className="notif-actions">
                    <button
                      className="btn-accept"
                      onClick={() => handleEventAction(inv._id, "accept")}
                    >
                      I'm coming! 🍽️
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleEventAction(inv._id, "reject")}
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="notifications-wrapper">
      <PageTransition>
        <div className="notifications-container">
          <header className="notif-header">
            <h1>Notifications</h1>
          </header>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loader"
                exit={{ opacity: 0 }}
                className="spinner-center-container"
              >
                <Spinner />
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="notif-tabs">
                  <button
                    className={activeTab === "all" ? "active" : ""}
                    onClick={() => setActiveTab("all")}
                  >
                    All
                  </button>
                  <button
                    className={activeTab === "friends" ? "active" : ""}
                    onClick={() => setActiveTab("friends")}
                  >
                    Friends{" "}
                    {friendRequests.length > 0 && (
                      <span className="tab-badge">{friendRequests.length}</span>
                    )}
                  </button>
                  <button
                    className={activeTab === "events" ? "active" : ""}
                    onClick={() => setActiveTab("events")}
                  >
                    Events{" "}
                    {eventInvites.length > 0 && (
                      <span className="tab-badge">{eventInvites.length}</span>
                    )}
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

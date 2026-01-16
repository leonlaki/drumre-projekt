import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbars/NavbarLogedUser/Navbar";
import Footer from "../../Components/Footer/Footer";
import SlidePageTransition from "../../Context/SlidePageTransition";
import { friendApi } from "../../api/friendApi";
import "./notifications.css"; // Kreirat ćemo CSS dolje

const Notifications = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dohvati zahtjeve
  const fetchRequests = async () => {
    try {
      const data = await friendApi.getPendingRequests();
      setRequests(data);
    } catch (error) {
      console.error("Greška pri dohvatu notifikacija", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Prihvati
  const handleAccept = async (requestId) => {
    try {
      await friendApi.acceptRequest(requestId);
      // Makni iz liste nakon prihvaćanja
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (error) {
      alert("Greška pri prihvaćanju");
    }
  };

  // Odbij
  const handleReject = async (requestId) => {
    try {
      await friendApi.rejectRequest(requestId);
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (error) {
      alert("Greška pri odbijanju");
    }
  };

  return (
    <div className="notifications-wrapper">
      <Navbar />
      <SlidePageTransition>
        <div className="notifications-container">
          <h1>Obavijesti 🔔</h1>

          <div className="notifications-card">
            <h3>Zahtjevi za prijateljstvo</h3>

            {loading ? (
              <p>Učitavanje...</p>
            ) : requests.length === 0 ? (
              <div className="empty-state">
                <p>Nema novih zahtjeva.</p>
                <p className="text-small">
                  Kada te netko doda, pojavit će se ovdje.
                </p>
              </div>
            ) : (
              <div className="requests-list">
                {requests.map((req) => (
                  <div key={req._id} className="request-item">
                    <div className="req-user-info">
                      <img
                        src={req.from.avatar}
                        alt={req.from.username}
                        className="req-avatar"
                      />
                      <div>
                        <span className="req-username">
                          @{req.from.username}
                        </span>
                        <span className="req-text">
                          {" "}
                          želi biti tvoj prijatelj.
                        </span>
                      </div>
                    </div>

                    <div className="req-actions">
                      <button
                        className="btn-accept"
                        onClick={() => handleAccept(req._id)}
                      >
                        Prihvati
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleReject(req._id)}
                      >
                        Odbij
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SlidePageTransition>
      <Footer />
    </div>
  );
};

export default Notifications;

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom"; 
import "./homePage.css";
import Navbar from "../../Components/Navbars/NavbarLogedUser/Navbar";
import Footer from "../../Components/Footer/Footer";
import AnimatedSection from "../../Components/AnimatedSection/AnimatedSection";
import CardRotator from "../../Components/CardRotator/CardRotator";
import PageTransition from "../../Context/PageTransition";
import EventCard from "../../Components/EventCard/EventCard"; 
import { mealApi } from "../../api/mealApi";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 400); 
  const [filterSort, setFilterSort] = useState("newest"); 

  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [trendingEvents, setTrendingEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const fetchEvents = async (
    query,
    pageNum,
    sortType,
    shouldAppend = false
  ) => {
    setIsLoading(true);
    try {
      const newEvents = await mealApi.searchMeals(query, pageNum, sortType);

      if (shouldAppend) {
        setEvents((prev) => [...prev, ...newEvents]);
      } else {
        setEvents(newEvents);
      }

      
      setHasMore(newEvents.length === 20);
    } catch (error) {
      console.error("Error fetching events", error);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  
  useEffect(() => {
    
    setPage(1);
    fetchEvents(debouncedQuery, 1, filterSort, false);
  }, [debouncedQuery, filterSort]);

  
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEvents(debouncedQuery, nextPage, filterSort, true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedData, recData] = await Promise.all([
          mealApi.getFeed(),
          mealApi.getRecommendations(),
        ]);

        
        const formattedFeed = feedData.map((item) => ({
          ...item,
          author: item.authorDetails, 
          
        }));
        setTrendingEvents(formattedFeed);

        
        setRecommendedEvents(recData);
      } catch (error) {
        console.error("Error loading homepage data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="homepage-wrapper">
      <Navbar />
      <PageTransition>
        
        <div className="homepage-hero-section">
          <h1 className="homepage-hero-title">FOODTUNE</h1>
          <p className="homepage-hero-subtitle">
            Tvoj ritam kuhanja. Otkrij recepte koji sviraju tvoju melodiju,
            kreiraj simfoniju okusa i uživaj u svakom zalogaju bez granica.
          </p>
        </div>

        <div className="homepage-content-container">
          
          
          <div className="homepage-section-header">
            <h2 className="homepage-section-title">
              Simfonija okusa u trendu 🔥
            </h2>
            <p className="homepage-section-subtitle">
              Ovo su hitovi tjedna. Najpopularniji eventi zajednice.
            </p>
          </div>
          <AnimatedSection className="homepage-animated-section">
            {loading ? (
              <p>Učitavanje hitova...</p>
            ) : (
              <CardRotator events={trendingEvents} />
            )}
          </AnimatedSection>

          
          <div className="homepage-section-header">
            <h2 className="homepage-section-title">Skladano samo za tebe 🎼</h2>
            <p className="homepage-section-subtitle">
              Recepti i eventi koji odgovaraju tvom ukusu i stilu.
            </p>
          </div>
          <AnimatedSection className="homepage-animated-section">
            {loading ? (
              <p>Skladamo preporuke...</p>
            ) : (
              <CardRotator events={recommendedEvents} />
            )}
          </AnimatedSection>

          

          
          <AnimatedSection className="homepage-split-section">
            <div className="homepage-text-content">
              <h2>Započni novu simfoniju</h2>
              <p>
                Spreman si za kuhanje? Kreiraj novi event, odaberi jelo koje
                želiš pripremiti i dodaj mu savršenu glazbenu pozadinu. Postavi
                scenu za nezaboravnu večeru.
              </p>
              <Link to="/create-event" className="homepage-action-button">
                Kreiraj Event
              </Link>
            </div>
            <div className="homepage-image-wrapper">
              <img src="/images/landingPage-img1.png" alt="Kuhanje" />
            </div>
          </AnimatedSection>

          
          <AnimatedSection className="homepage-split-section section-reverse">
            <div className="homepage-text-content">
              <h2>Tvoji kulinarski trenutci</h2>
              <p>
                Pregledaj sve svoje prošle i nadolazeće evente na jednom mjestu.
                Uredi svoje playliste, prisjeti se starih recepata ili planiraj
                sljedeće druženje.
              </p>
              <Link to="/my-events" className="homepage-action-button">
                Moji Eventi
              </Link>
            </div>
            <div className="homepage-image-wrapper">
              <img src="/images/homepage2.webp" alt="Glazba" />
            </div>
          </AnimatedSection>

          
          <AnimatedSection className="homepage-split-section">
            <div className="homepage-text-content">
              <h2>Poveži se s gurmanima</h2>
              <p>
                Pogledaj što tvoji prijatelji kuhaju i slušaju. Pronađi
                inspiraciju u njihovim eventima i podijeli svoja iskustva s
                ljudima koji dijele tvoju strast.
              </p>
              <Link to="/friends" className="homepage-action-button">
                Prijatelji
              </Link>
            </div>
            <div className="homepage-image-wrapper">
              <img src="/images/homepage3.jpg" alt="Prijatelji" />
            </div>
          </AnimatedSection>

          <div className="homepage-search-section">
            <div className="search-header">
              <h2>Istraži Evente 🔍</h2>
              <p>Pretraži po nazivu, autoru ili sastojcima.</p>
            </div>

            
            <div className="search-controls-wrapper">
              <input
                type="text"
                placeholder="Upiši za pretragu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="big-search-input"
              />

              
              <select
                className="search-filter-select"
                value={filterSort}
                onChange={(e) => setFilterSort(e.target.value)}
              >
                <option value="newest">📅 Najnovije</option>
                <option value="popular">🔥 Popularno</option>
              </select>
            </div>

            
            <div className="search-results-grid">
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>

            
            {isLoading && (
              <div style={{ marginTop: 20, textAlign: "center" }}>
                <p>Učitavanje...</p>
                
              </div>
            )}

            {!isLoading && events.length === 0 && (
              <p className="no-results-msg">Nema rezultata za tvoj upit.</p>
            )}

            
            {!isLoading && hasMore && events.length > 0 && (
              <button className="btn-load-more" onClick={handleLoadMore}>
                Prikaži još
              </button>
            )}
          </div>
        </div>
        <Footer />
      </PageTransition>
    </div>
  );
};

export default HomePage;

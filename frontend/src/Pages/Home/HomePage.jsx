import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./homePage.css";
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

  // dohvati evente
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

  // efekt za pretragu i filter
  useEffect(() => {
    setPage(1);
    fetchEvents(debouncedQuery, 1, filterSort, false);
  }, [debouncedQuery, filterSort]);

  // load more handler
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEvents(debouncedQuery, nextPage, filterSort, true);
  };

  // dohvati feed i preporuke
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedData, recData] = await Promise.all([
          mealApi.getFeed(),
          mealApi.getRecommendations(),
        ]);

        setTrendingEvents(feedData);
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
      <PageTransition>
        {/* hero sekcija */}
        <div className="homepage-hero-section">
          <h1 className="homepage-hero-title">FOODTUNE</h1>
          <p className="homepage-hero-subtitle">
            Your cooking rhythm. Discover recipes that play your melody,
            create a symphony of flavors, and enjoy every bite without limits.
          </p>
        </div>

        <div className="homepage-content-container">
          {/* trending sekcija */}
          <div className="homepage-section-header">
            <h2 className="homepage-section-title">
              Trending Flavor Symphony 🔥
            </h2>
            <p className="homepage-section-subtitle">
              These are the hits of the week. Most popular community events.
            </p>
          </div>
          <AnimatedSection className="homepage-animated-section">
            {loading ? <p>Loading hits...</p> : <CardRotator events={trendingEvents} />}
          </AnimatedSection>

          {/* preporučeno */}
          <div className="homepage-section-header">
            <h2 className="homepage-section-title">Tailored Just for You 🎼</h2>
            <p className="homepage-section-subtitle">
              Recipes and events that match your taste and style.
            </p>
          </div>
          <AnimatedSection className="homepage-animated-section">
            {loading ? <p>Composing recommendations...</p> : <CardRotator events={recommendedEvents} />}
          </AnimatedSection>

          {/* link na create event */}
          <AnimatedSection className="homepage-split-section">
            <div className="homepage-text-content">
              <h2>Start a New Symphony</h2>
              <p>
                Ready to cook? Create a new event, choose the dish you want to prepare, and add the perfect music background. Set the scene for an unforgettable dinner.
              </p>
              <Link to="/create-event" className="homepage-action-button">
                Create Event
              </Link>
            </div>
            <div className="homepage-image-wrapper">
              <img src="/images/landingPage-img1.png" alt="Cooking" />
            </div>
          </AnimatedSection>

          {/* link na my events */}
          <AnimatedSection className="homepage-split-section section-reverse">
            <div className="homepage-text-content">
              <h2>Your Culinary Moments</h2>
              <p>
                View all your past and upcoming events in one place. Edit your playlists, recall old recipes, or plan your next gathering.
              </p>
              <Link to="/my-events" className="homepage-action-button">
                My Events
              </Link>
            </div>
            <div className="homepage-image-wrapper">
              <img src="/images/homepage2.webp" alt="Music" />
            </div>
          </AnimatedSection>

          {/* link na friends */}
          <AnimatedSection className="homepage-split-section">
            <div className="homepage-text-content">
              <h2>Connect with Foodies</h2>
              <p>
                See what your friends are cooking and listening to. Find inspiration in their events and share your experiences with people who share your passion.
              </p>
              <Link to="/friends" className="homepage-action-button">
                Friends
              </Link>
            </div>
            <div className="homepage-image-wrapper">
              <img src="/images/homepage3.jpg" alt="Friends" />
            </div>
          </AnimatedSection>

          {/* pretraga eventa */}
          <div className="homepage-search-section">
            <div className="search-header">
              <h2>Explore Events 🔍</h2>
              <p>Search by name, author, or ingredients.</p>
            </div>

            {/* tražilica i filter */}
            <div className="search-controls-wrapper">
              <input
                type="text"
                placeholder="Type to search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="big-search-input"
              />
              <select
                className="search-filter-select"
                value={filterSort}
                onChange={(e) => setFilterSort(e.target.value)}
              >
                <option value="newest">📅 Newest</option>
                <option value="popular">🔥 Popular</option>
              </select>
            </div>

            {/* rezultati pretrage */}
            <div className="search-results-grid">
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>

            {/* loading i empty states */}
            {isLoading && (
              <div style={{ marginTop: 20, textAlign: "center" }}>
                <p>Loading...</p>
              </div>
            )}

            {!isLoading && events.length === 0 && (
              <p className="no-results-msg">No results for your query.</p>
            )}

            {/* load more gumb */}
            {!isLoading && hasMore && events.length > 0 && (
              <button className="btn-load-more" onClick={handleLoadMore}>
                Show More
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

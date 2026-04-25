import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import "./App.css";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function App() {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [memories, setMemories] = useState({});
  const [images, setImages] = useState([]);
  const [spotifyPosition, setSpotifyPosition] = useState({ x: 20, y: 520 });
  const [isDraggingSpotify, setIsDraggingSpotify] = useState(false);
  const [spotifyOffset, setSpotifyOffset] = useState({ x: 0, y: 0 });

  function startSpotifyDrag(e) {
  setIsDraggingSpotify(true);
  setSpotifyOffset({
    x: e.clientX - spotifyPosition.x,
    y: e.clientY - spotifyPosition.y,
  });
}

function dragSpotify(e) {
  if (!isDraggingSpotify) return;

  setSpotifyPosition({
    x: e.clientX - spotifyOffset.x,
    y: e.clientY - spotifyOffset.y,
  });
}

function stopSpotifyDrag() {
  setIsDraggingSpotify(false);
}

  function handleCountryClick(geo) {
    const countryName = geo.properties.name;
    const coordinates = geo.geoCentroid;

    setSelectedCountry(countryName);
    setSelectedCoordinates(coordinates);
    setImages(memories[countryName]?.images || []);
  }

  function closePopup() {
    setSelectedCountry("");
    setSelectedCoordinates(null);
    setImages([]);
  }

  function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));

    const updatedImages = [...images, ...imageUrls];

    setImages(updatedImages);

    setMemories({
      ...memories,
      [selectedCountry]: {
        images: updatedImages,
        coordinates: selectedCoordinates,
      },
    });
  }

  

  return (
    <div className="app" onMouseMove={dragSpotify} onMouseUp={stopSpotifyDrag}>
      <h1 className="title">💕 Our Little World Map 💕</h1>

      <div className="cloud cloud-1"></div>
      <div className="cloud cloud-2"></div>
      <div className="cloud cloud-3"></div>
      <div className="cloud cloud-4"></div>
      <div
  className="spotify-widget"
  style={{
    left: spotifyPosition.x,
    top: spotifyPosition.y,
  }}
>
  <div className="spotify-drag-bar" onMouseDown={startSpotifyDrag}>
    🎵 Drag Spotify
  </div>

  <iframe
    src="https://open.spotify.com/embed/playlist/37i9dQZF1E4owBwjojGXkY?utm_source=generator"
    width="100%"
    height="152"
    frameBorder="0"
    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
    loading="lazy"
  ></iframe>
</div>
      <div className="ocean-life">
    </div>

    <div className="ocean-life">
  {/* Pacific Ocean */}
  <div className="whale whale-static-1">🐋</div>
  <div className="dolphin dolphin-pacific-1">🐬</div>
  <div className="fish fish-pacific-1">🐟</div>
  <div className="fish fish-pacific-2">🐠</div>
  <div className="turtle turtle-pacific-1">🐢</div>
  <div className="octopus octopus-pacific-1">🐙</div>

  {/* Atlantic Ocean */}
  <div className="whale whale-atlantic-1">🐋</div>
  <div className="fish fish-atlantic-1">🐟</div>
  <div className="fish fish-atlantic-2">🐟</div>
  <div className="fish fish-atlantic-3">🐠</div>
  <div className="turtle turtle-atlantic-1">🐢</div>
</div>

      <div className="map-container">
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 180 }}
          width={1000}
          height={520}
          style={{
            width: "100vw",
            height: "100vh",
            backgroundColor: "#087982",
          }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => handleCountryClick(geo)}
                  style={{
                    default: {
                      fill: memories[geo.properties.name]
                        ? "#ffb3c6"
                        : "#9fd36a",
                      stroke: "#fff6e5",
                      strokeWidth: 0.8,
                      outline: "none",
                    },
                    hover: {
                      fill: "#f7c59f",
                      outline: "none",
                      cursor: "pointer",
                    },
                    pressed: {
                      fill: "#ff8fab",
                      outline: "none",
                    },
                  }}
                />
              ))
            }
          </Geographies>

          {/* North America: forests + mountains */}
<Marker coordinates={[-110, 55]}>
  <text fontSize={30} textAnchor="middle">🌲🏔️</text>
</Marker>
<Marker coordinates={[-95, 40]}>
  <text fontSize={26} textAnchor="middle">🌲🐻</text>
</Marker>

{/* South America: rainforest */}
<Marker coordinates={[-60, -10]}>
  <text fontSize={30} textAnchor="middle">🌴🦜</text>
</Marker>
<Marker coordinates={[-55, -22]}>
  <text fontSize={28} textAnchor="middle">🌿🐆</text>
</Marker>

{/* Europe: castles + churches */}
<Marker coordinates={[10, 48]}>
  <text fontSize={30} textAnchor="middle">🏰⛪</text>
</Marker>
<Marker coordinates={[-2, 43]}>
  <text fontSize={26} textAnchor="middle">🏛️</text>
</Marker>

{/* Africa: safari */}
<Marker coordinates={[20, 0]}>
  <text fontSize={32} textAnchor="middle">🦒🐘</text>
</Marker>
<Marker coordinates={[25, -22]}>
  <text fontSize={30} textAnchor="middle">🦁🦓</text>
</Marker>

{/* Middle East: desert */}
<Marker coordinates={[45, 25]}>
  <text fontSize={30} textAnchor="middle">🏜️🐪</text>
</Marker>
<Marker coordinates={[55, 22]}>
  <text fontSize={26} textAnchor="middle">🕌</text>
</Marker>

{/* Asia: cities */}
<Marker coordinates={[105, 35]}>
  <text fontSize={30} textAnchor="middle">🏙️🏯</text>
</Marker>
<Marker coordinates={[139, 36]}>
  <text fontSize={28} textAnchor="middle">🗼🌸</text>
</Marker>

          {/* Hearts on countries with memories */}
          {Object.entries(memories).map(([country, memory]) =>
            memory.coordinates ? (
              <Marker key={country} coordinates={memory.coordinates}>
                <text textAnchor="middle" fontSize={18}>
                  ❤️
                </text>
              </Marker>
            ) : null
          )}
        </ComposableMap>
      </div>

      {selectedCountry && (
        <div className="popup-overlay">
          <div className="memory-popup">
            <button className="close-button" onClick={closePopup}>
              ×
            </button>

            <h2>{selectedCountry}</h2>

            {images.length === 0 ? (
              <div className="locked-message">
                <div className="locked-icon">🗺️</div>
                <p>Adventure not unlocked yet!</p>
              </div>
            ) : (
              <div className="popup-photo-grid">
                {images.map((img, index) => (
                  <img key={index} src={img} alt="memory" />
                ))}
              </div>
            )}

            <label className="upload-button">
              📸 Upload Photos
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
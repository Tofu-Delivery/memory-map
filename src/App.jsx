import { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import "./App.css";

import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { geoCentroid } from "d3-geo";

import firebase from "./firebase";

const { auth, db, storage } = firebase;

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function App() {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [memories, setMemories] = useState({});
  const [images, setImages] = useState([]);
  const [spotifyPosition, setSpotifyPosition] = useState({ x: 20, y: 520 });
  const [isDraggingSpotify, setIsDraggingSpotify] = useState(false);
  const [spotifyOffset, setSpotifyOffset] = useState({ x: 0, y: 0 });
  const [caption, setCaption] = useState("");
  const [user, setUser] = useState(null);
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loginError, setLoginError] = useState("");

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

  async function handleCountryClick(geo) {
  const countryName = geo.properties.name;
  const coordinates = geoCentroid(geo);

  setSelectedCountry(countryName);
  setSelectedCoordinates(coordinates);

  try {
    const countryRef = doc(db, "memories", countryName);
    const countrySnap = await getDoc(countryRef);

    if (countrySnap.exists()) {
      const data = countrySnap.data();
      setImages(data.images || []);
    } else {
      setImages([]);
    }
  } catch (error) {
    console.error("Could not load memories:", error);
  }
}

  function closePopup() {
    setSelectedCountry("");
    setSelectedCoordinates(null);
    setImages([]);
  }

  async function handleImageUpload(e) {
  console.log("Upload started");

  try {
    const files = Array.from(e.target.files);
    console.log("Files:", files);
    console.log("Selected country:", selectedCountry);
    console.log("Current user:", auth.currentUser);

    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const imageRef = ref(
          storage,
          `memories/${selectedCountry}/${Date.now()}-${file.name}`
        );

        await uploadBytes(imageRef, file);
        const downloadURL = await getDownloadURL(imageRef);

        return {
          url: downloadURL,
          caption: caption.trim().slice(0, 100),
        };
      })
    );

    const updatedImages = [...images, ...uploadedImages];

    console.log("About to save to Firestore:", updatedImages);

    await setDoc(doc(db, "memories", selectedCountry), {
      images: updatedImages,
      coordinates: selectedCoordinates,
    });

    console.log("✅ Saved to Firestore");

    setImages(updatedImages);
    setCaption("");

    setMemories({
      ...memories,
      [selectedCountry]: {
        images: updatedImages,
        coordinates: selectedCoordinates,
      },
    });

    e.target.value = "";
  } catch (error) {
    console.error("❌ Upload or Firestore save failed:", error);
    alert(error.message);
  }
}

  
  async function deletePhoto(indexToDelete) {
  const updatedImages = images.filter((_, index) => index !== indexToDelete);

  setImages(updatedImages);

  if (updatedImages.length === 0) {
    await deleteDoc(doc(db, "memories", selectedCountry));

    const updatedMemories = { ...memories };
    delete updatedMemories[selectedCountry];
    setMemories(updatedMemories);
  } else {
    await setDoc(doc(db, "memories", selectedCountry), {
      images: updatedImages,
      coordinates: selectedCoordinates,
    });

    setMemories({
      ...memories,
      [selectedCountry]: {
        images: updatedImages,
        coordinates: selectedCoordinates,
      },
    });
  }
}

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });

  return () => unsubscribe();
}, []);

function handleLogin(e) {
  e.preventDefault();

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      setLoginError("");
    })
    .catch(() => {
      setLoginError("Wrong email or password. Please try again.");
    });
}

function handleLogout() {
  signOut(auth);
}

if (!user) {
  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleLogin}>
        <h1>💕 Our Little World Map 💕</h1>
        <p>Login to unlock our memories.</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {loginError && <p className="login-error">{loginError}</p>}

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

  return (
    <div className="app" onMouseMove={dragSpotify} onMouseUp={stopSpotifyDrag}>
      <h1 className="title">Mel and Jacky's Travel Journal</h1>
      <button className="logout-button" onClick={handleLogout}>
        Sign out
      </button>

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
                <div className="photo-card" key={index}>
                  <img src={img.url} alt="memory" />

                  <button
                    className="delete-photo-button"
                    onClick={() => deletePhoto(index)}
                  >
                    ×
                  </button>

                  <div className="photo-caption">
                    {img.caption}
                  </div>
                </div>
              ))}
              </div>
            )}

              <textarea
                className="caption-input"
                placeholder="Caption (max 100 characters)..."
                value={caption}
                maxLength={100}
                onChange={(e) => setCaption(e.target.value)}
              />
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
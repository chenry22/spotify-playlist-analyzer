import './App.css';
import {useEffect, useState} from 'react';
import axios from 'axios';

function App() {
  const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
  const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const SCOPE = "playlist-read-private playlist-read-collaborative";

  const [token, setToken] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

// PLAYLIST STUFF
  const searchPlaylists = async (e) => {
    e.preventDefault();
    const {data} = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        q: searchTerm,
        type: "playlist",
        limit: 10
      }
    })
    setPlaylists(data.playlists.items);
  }
  const getOwnPlaylists = async (e) => {
    e.preventDefault();
    const {data} = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        limit: 20,
        offset: 0
      }
    })
    setPlaylists(data.items);
  }
  const showPlaylists = () => {
    // don't try to parse bad results
    if(playlists == null){
      return;
    }

    return playlists.map(playlist => (
      <>
      <div key={playlist.id}>
          {playlist.images.length ? <img width={"100px"} src={playlist.images[0].url} alt=""/> : <div>No Image</div>}
          <br></br>
          {playlist.name}
          <br></br>
          <i>{playlist.owner.display_name}</i>
      </div>
      <br></br>
      </>
  ))
  }
  
// AUTH STUFF
  // processing token on return from auth
  useEffect(() => {
    // check local storage not already full
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");
  
    if (!token && hash) {
        token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]
  
        window.location.hash = ""
        window.localStorage.setItem("token", token)
    }
  
    setToken(token)
  }, []);
  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Playlist Analyzer</h1>
        
        {!token ?
          <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}>
            Login to Spotify</a>
          : <button onClick={logout}>Logout</button>}

        {token ? 
          <>
          <form onSubmit={searchPlaylists}>
            <input type="text" onChange={e => setSearchTerm(e.target.value)} placeholder='Search for a playlist'></input>
            <button type={"submit"}>Search</button>
          </form>
          <button onClick={getOwnPlaylists}>Get Own Playlists</button>
          <br></br>
          </>
        : <hr></hr>}

          {showPlaylists()}
          
      </header>
    </div>
  );
}

export default App;

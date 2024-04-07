import * as React from 'react';
import { Link } from 'react-router-dom';
import {useEffect, useState} from 'react';
import axios from 'axios';

export default function Home() {
    const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
    const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
    const RESPONSE_TYPE = "token";
    const SCOPE = "playlist-read-private playlist-read-collaborative";

    const [token, setToken] = useState("");
    const [playlists, setPlaylists] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    var [nextLink, setNextLink] = useState("");
    var [prevLink, setPrevLink] = useState("");
  
  // PLAYLIST STUFF
    const searchPlaylists = async (e) => {
        e.preventDefault();
        if(searchTerm === "" || searchTerm.length < 1){
            return;
        }
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

        // set next playlist for load more
        setNextLink(data.playlists.next);
        setPrevLink(data.playlists.previous);
        setPlaylists(data.playlists.items);
    }
    const getNextList = async () => {
        console.log(nextLink);
        if(nextLink == null){
            return;
        }
        const {data} = await axios.get(nextLink, {
            headers: {
            Authorization: `Bearer ${token}`
            },
            params: {
            type: "playlist",
            limit: 10
            }
        })

        // set next playlist for load more
        if(data.playlists !== undefined){
            setNextLink(data.playlists.next);
            setPrevLink(data.playlists.previous);
            setPlaylists(data.playlists.items);
        } else{
            setNextLink(data.next);
            setPrevLink(data.previous);
            setPlaylists(data.items);
        }
    }
    const getPrevList = async () => {
        console.log(prevLink);
        if(prevLink === null){
            return;
        }
        const {data} = await axios.get(prevLink, {
            headers: {
            Authorization: `Bearer ${token}`
            },
            params: {
            type: "playlist",
            limit: 10
            }
        })

        // set next playlist for load more
        if(data.playlists !== undefined){
            setNextLink(data.playlists.next);
            setPrevLink(data.playlists.previous);
            setPlaylists(data.playlists.items);
        } else{
            setNextLink(data.next);
            setPrevLink(data.previous);
            setPlaylists(data.items);
        }
    }
    const getOwnPlaylists = async (e) => {
      e.preventDefault();
      const {data} = await axios.get("https://api.spotify.com/v1/me/playlists", {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          limit: 10,
          offset: 0
        }
      })
      setNextLink(data.next);
        setPrevLink(data.previous);
      setPlaylists(data.items);
    }
    const showPlaylists = () => {
      // don't try to parse bad results
      if(playlists == null){
        setNextLink(null);
        setPrevLink(null);
        return;
      }
  
      return playlists.map(playlist => (
        <>
        <div key={playlist.id}>
            {playlist.images && playlist.images.length ? <img width={"100px"} src={playlist.images[0].url} alt=""/> : <div>No Image</div>}
            <br></br>
            {playlist.name}
            <br></br>
            <i>{playlist.owner.display_name}</i>
        </div>
        <br></br>
        </>
        ));
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
    const logout = (e) => {
        e.preventDefault();
        setToken("");
        window.localStorage.removeItem("token");
        prevLink = null;
        nextLink = null;
    }

    return (
        <>
        <Link to="/about">About</Link>
        {!token ?
            <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}>
            Login to Spotify</a>
            : <a href="#" onClick={logout}>Logout</a>}
        <h1>Spotify Playlist Analyzer</h1>

        {token ? 
        <>
            <form onSubmit={searchPlaylists}>
                <input type="text" onChange={e => setSearchTerm(e.target.value)} placeholder='Search for a playlist' minLength="1"></input>
                <button type={"submit"}>Search</button>
            </form>
            <button onClick={getOwnPlaylists}>Get Own Playlists</button>
            <br></br>
        </>
        : <hr></hr>}

        {showPlaylists()}
        <br></br>
        {prevLink !== null && prevLink !== "" ? 
            <button onClick={getPrevList}>Prev</button>
            : <></>}
        {nextLink !== null && nextLink !== "" ? 
            <button onClick={getNextList}>Next</button>
            : <></>}
        </>
    );
}
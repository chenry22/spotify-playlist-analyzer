import * as React from 'react';
import { Link } from 'react-router-dom';
import {useEffect, useState} from 'react';

export default function About() {
    const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
    const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
    const RESPONSE_TYPE = "token";
    const SCOPE = "playlist-read-private playlist-read-collaborative";

    const [token, setToken] = useState("");

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
        setToken("")
        window.localStorage.removeItem("token")
    }

    return (
    <>
        <Link to="/">Home</Link>
        {!token ?
            <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}>
            Login to Spotify</a>
            : <a href="#" onClick={logout}>Logout</a>}
        <h1>about page</h1>
    </>
  );
}
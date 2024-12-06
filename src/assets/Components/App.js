import React, { useState } from "react";
import ChessGame from "./ChessGame"; // ChessGame Component
 
function App() {
  const [isSignedIn, setIsSignedIn] = useState(false); // Track if the user is signed in
  const [username, setUsername] = useState(""); // Store the user's name
  const [inputUsername, setInputUsername] = useState(""); // Input field for username

  // Handle sign-in form submission
  const handleSignIn = (e) => {
    e.preventDefault();
    if (inputUsername.trim()) {
      setUsername(inputUsername.trim());
      setIsSignedIn(true);
    }
  };

  // Handle sign-out
  const handleSignOut = () => {
    setUsername("");
    setIsSignedIn(false);
  };

  return (
    <div className="app">
      {!isSignedIn ? (
        <div className="sign-in-container">
          <h1>Welcome to React Chess Game</h1>
          <form onSubmit={handleSignIn}>
            <input
              type="text"
              placeholder="Enter your username"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              required
            />
            <button type="submit">Sign In</button>
          </form>
        </div>
      ) : (
        <div>
          <div className="user-info">
            <p>Welcome, {username}!</p>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
          <ChessGame username={username} />
        </div>
      )}
    </div>
  );
}

export default App;

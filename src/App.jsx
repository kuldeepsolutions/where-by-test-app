// // frontend/src/App.js
// import React, { useState, useEffect } from 'react';

// const RINGCENTRAL_OAUTH_URL = 'https://platform.ringcentral.com/restapi/oauth/authorize';
// const RINGCENTRAL_TOKEN_URL = 'https://platform.ringcentral.com/restapi/oauth/token';

// const CLIENT_ID = "5tgmtQFwqw8chgBd7aZgZk";
// const REDIRECT_URI = 'http://localhost:5173'; // must be registered in your app

// // Helper to generate random string (code verifier)
// function generateRandomString(length) {
//   const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
//   let result = '';
//   const cryptoObj = window.crypto || window.msCrypto;
//   const randomValues = new Uint32Array(length);
//   cryptoObj.getRandomValues(randomValues);
//   for (let i = 0; i < length; i++) {
//     result += charset[randomValues[i] % charset.length];
//   }
//   return result;
// }

// // Base64URL encode ArrayBuffer
// function base64UrlEncode(arrayBuffer) {
//   return btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)))
//     .replace(/\+/g, '-')
//     .replace(/\//g, '_')
//     .replace(/=+$/, '');
// }

// // SHA256 hash helper for PKCE
// async function sha256(plain) {
//   const encoder = new TextEncoder();
//   const data = encoder.encode(plain);
//   const hash = await window.crypto.subtle.digest('SHA-256', data);
//   return base64UrlEncode(hash);
// }

// export default function App() {
//   const [accessToken, setAccessToken] = useState(null);
//   const [refreshToken, setRefreshToken] = useState(null);
//   const [user, setUser] = useState(null);
//   const [topic, setTopic] = useState('');
//   const [startTime, setStartTime] = useState('');
//   const [duration, setDuration] = useState(30);
//   const [meetings, setMeetings] = useState([]);

//   // On mount, check if redirected back with code
//   useEffect(() => {
//     async function handleAuthResponse() {
//       const params = new URLSearchParams(window.location.search);
//       const code = params.get('code');
//       const storedVerifier = localStorage.getItem('pkce_code_verifier');

//       if (code && storedVerifier) {
//         // Exchange code for tokens
//         const body = new URLSearchParams({
//           grant_type: 'authorization_code',
//           code,
//           redirect_uri: REDIRECT_URI,
//           client_id: CLIENT_ID,
//           code_verifier: storedVerifier,
//         });

//         const tokenRes = await fetch(RINGCENTRAL_TOKEN_URL, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//           body,
//         });
//         const tokenData = await tokenRes.json();

//         if (tokenData.access_token) {
//           setAccessToken(tokenData.access_token);
//           setRefreshToken(tokenData.refresh_token);
//           localStorage.removeItem('pkce_code_verifier');
//           window.history.replaceState({}, document.title, '/'); // clean URL
//         } else {
//           alert('Failed to get access token');
//         }
//       }
//     }
//     handleAuthResponse();
//   }, []);

//   // Fetch user info when accessToken is set
//   useEffect(() => {
//     async function fetchUser() {
//       if (!accessToken) return;
//       const res = await fetch('https://platform.ringcentral.com/restapi/v1.0/account/~/extension/~', {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       });
//       if (res.ok) {
//         const userData = await res.json();
//         setUser(userData);
//       }
//     }
//     fetchUser();
//   }, [accessToken]);

//   // PKCE login flow
//   async function login() {
//     const codeVerifier = generateRandomString(64);
//     localStorage.setItem('pkce_code_verifier', codeVerifier);
//     const codeChallenge = await sha256(codeVerifier);

//     const authUrl = `${RINGCENTRAL_OAUTH_URL}?response_type=code&client_id=${CLIENT_ID}` +
//       `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
//       `&code_challenge=${codeChallenge}&code_challenge_method=S256`;

//     window.location.href = authUrl;
//   }

//   // Refresh token method (optional)
//   async function refreshAccessToken() {
//     if (!refreshToken) return alert('No refresh token');
//     const body = new URLSearchParams({
//       grant_type: 'refresh_token',
//       refresh_token: refreshToken,
//       client_id: CLIENT_ID,
//     });
//     const res = await fetch(RINGCENTRAL_TOKEN_URL, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       body,
//     });
//     const data = await res.json();
//     console.log(data)
//     if (data.access_token) {
//       setAccessToken(data.access_token);
//       setRefreshToken(data.refresh_token);
//     } else {
//       alert('Failed to refresh token');
//     }
//   }

//   // Create meeting directly from frontend using accessToken
//   async function createMeeting() {
//     if (!accessToken) return alert('Please login first');
//     const res = await fetch('http://localhost:5000/create-meeting', {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         topic,
//         startTime,
//         duration,
//         accessToken,
//         meetingType: 'Scheduled',
//       }),
//     });
//     console.log('Create meeting response:', res);
//     if (!res.ok) return alert('Failed to create meeting');
//     const meeting = await res.json();
//     console.log('Created meeting:', meeting);
//     setMeetings((prev) => [...prev, meeting]);
//   }

//   if (!accessToken) {
//     return (
//       <div style={{ padding: 20 }}>
//         <h1>RingCentral PKCE Login</h1>
//         <button onClick={login} style={{ fontSize: 18, padding: '10px 20px' }}>
//           Login with RingCentral
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: 20, maxWidth: 600 }}>
//       <h2>Welcome, {user?.contact?.firstName || 'User'}</h2>

//       <div>
//         <label>Meeting Topic</label><br />
//         <input
//           type="text"
//           value={topic}
//           onChange={e => setTopic(e.target.value)}
//           style={{ width: '100%', padding: 8, marginBottom: 10 }}
//         />
//       </div>

//       <div>
//         <label>Start Time</label><br />
//         <input
//           type="datetime-local"
//           value={startTime}
//           onChange={e => setStartTime(e.target.value)}
//           style={{ width: '100%', padding: 8, marginBottom: 10 }}
//         />
//       </div>

//       <div>
//         <label>Duration (minutes)</label><br />
//         <input
//           type="number"
//           value={duration}
//           onChange={e => setDuration(Number(e.target.value))}
//           style={{ width: '100%', padding: 8, marginBottom: 20 }}
//         />
//       </div>

//       <button onClick={createMeeting} style={{ padding: '10px 20px', fontSize: 16 }}>
//         Create Meeting
//       </button>

//       <button onClick={refreshAccessToken} style={{ marginLeft: 10, padding: '10px 20px' }}>
//         Refresh Token
//       </button>

//       <h3 style={{ marginTop: 30 }}>Scheduled Meetings</h3>
//       <ul>
//         {meetings.map((m, i) => (
//           <li key={i}>
//             <b>{m.topic}</b> at {m.startTime}{' '}
//             <a href={m.links?.joinUri} target="_blank" rel="noreferrer">Join</a>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }



import React from 'react'
// import dotenv from 'dotenv'
// dotenv.config({
//   path:'../.env'
// })
const token =  import.meta.env.TOKEN
const App = () => {
  const [body, setBody] = React.useState({
  "endDate": "2025-06-09T11:14:18.505Z",
  "isLocked": true,
  "roomMode": "group",
  "roomNamePrefix": "example-prefix",
  "roomNamePattern": "uuid",
  "templateType": "viewerMode",
  "fields": [
    "hostRoomUrl"
  ]
})
  const [response, setResponse] = React.useState(null)
  const createMeeting = async () => {
    try {
      const res = await fetch('https://api.whereby.dev/v1/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      setResponse(data)
      console.log('Meeting created:', data)
    } catch (error) {
      console.error('Error creating meeting:', error)
    }
  }
  return (
    <div>
      <h1>RingCentral Meeting App</h1>
      <p>This is a placeholder for the RingCentral Meeting application.</p>
      <p>Please follow the instructions in the README to set up the backend and frontend.</p>
      <p>Make sure to run the backend server before starting this frontend app.</p>

      <button onClick={createMeeting}>Create Meeting</button>
      {response && (
        <div>
          <h2>Meeting Created</h2>
          <p>Meeting ID: {response.id}</p>
          <p>Start URI: <a href={response.links.startUri} target="_blank" rel="noopener noreferrer">{response.links.startUri}</a></p>
        </div>
      )}
      <p>Check the console for any errors or logs.</p>
      <p>Make sure to have the RingCentral SDK and other dependencies installed.</p>
      <p>For more information, refer to the RingCentral documentation.</p>
      <p>Thank you for using the RingCentral Meeting App!</p>
      <p>© 2023 RingCentral, Inc. All rights reserved.</p>
      <p>Version: 1.0.0</p>
      <p>Last updated: June 2025</p>
      <p>For support, please contact RingCentral support.</p>
    </div>
  )
}

export default App

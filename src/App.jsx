import React from "react";

const token = import.meta.env.TOKEN;
const App = () => {
  const [body, setBody] = React.useState({
    startDate:"2025-06-19T11:14:18.505Z",
    endDate: "2025-06-20T11:14:18.505Z",
    name: "Astro Vahlay Meeting",
    isLocked: true,
    roomMode: "group",
    roomNamePrefix: "astro-vahlay",
    roomNamePattern: "uuid",
    templateType: "viewerMode",
    fields: ["hostRoomUrl"],
    
  });
  const [response, setResponse] = React.useState(null);
  const createMeeting = async () => {
    try {
      const res = await fetch("https://cloudastro.space/api/create-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResponse(data.meeting);
      console.log("Meeting created:", data?.meeting);
    } catch (error) {
      console.error("Error creating meeting:", error);
    }
  };
  return (
    <div>
      <h1>RingCentral Meeting App</h1>
      <p>This is a placeholder for the RingCentral Meeting application.</p>
      <p>
        Please follow the instructions in the README to set up the backend and
        frontend.
      </p>
      <p>
        Make sure to run the backend server before starting this frontend app.
      </p>

      <button onClick={createMeeting}>Create Meeting</button>
      {response && (
        <div>
          <h2>Meeting Created</h2>
          <p>Meeting Start Date: {JSON.stringify(response)}</p>
          <p>Meeting End Date:{response?.endDate ?? "NO RECORD"}</p>
          <p>Meeting ID: {response?.meetingId ?? "NO RECORD"}</p>
          <p>Meeting Room Name: {response?.roomName ?? "NO RECORD"}</p>
          <p>Meeting Room URL: {response?.roomUrl ?? "NO RECORD"}</p>
          <p>
            <a
              href={response?.roomUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              {response?.roomUrl}
            </a>
          </p>

          {/* If there is a roomUrl then create a Iframe tag for the meeting */}
          {/* Embed Whereby Room in iframe */}
          {response?.roomUrl && (
            <iframe
              src={response.roomUrl}
              allow="camera; microphone; fullscreen; display-capture"
              style={{
                width: "100%",
                height: "600px",
                border: "0",
                borderRadius: "10px",
                marginTop: "1rem",
              }}
              title="Whereby Meeting"
            ></iframe>
          )}
        </div>
      )}
    </div>
  );
};

export default App;

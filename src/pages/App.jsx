import { useState, useEffect } from "react";
import WaveBackground from "../components/WaveBackground";
import Sidebar from "../components/Sidebar/index.jsx";
import MessageThread from "../components/MessageThread/index.jsx";
import ChatBar from "../components/ChatBar/index.jsx";

const RubraLogo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    {/* Red circle dot */}
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "radial-gradient(circle at 38% 38%, #ff4a3a, #c0392b)",
        boxShadow: "0 0 10px rgba(192,57,43,0.6)",
        flexShrink: 0,
      }}
    />
    <span
      style={{
        fontFamily: "'Syne', 'Inter', sans-serif",
        fontWeight: 900,
        fontSize: 22,
        color: "white",
        letterSpacing: "0.06em",
      }}
    >
      RUBRA
    </span>
  </div>
);

const HamburgerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect y="3" width="20" height="1.5" rx="0.75" fill="white" />
    <rect y="9" width="20" height="1.5" rx="0.75" fill="white" />
    <rect y="15" width="20" height="1.5" rx="0.75" fill="white" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <line x1="8" y1="2" x2="8" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="2" y1="8" x2="14" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const GearIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="3.5" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
    <path
      d="M11 2v2.5M11 17.5V20M2 11h2.5M17.5 11H20M4.1 4.1l1.77 1.77M16.13 16.13l1.77 1.77M4.1 17.9l1.77-1.77M16.13 5.87l1.77-1.77"
      stroke="rgba(255,255,255,0.55)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const UserCircle = () => (
  <div
    style={{
      width: 32,
      height: 32,
      borderRadius: "50%",
      background: "rgba(192,57,43,0.75)",
      border: "1.5px solid rgba(255,255,255,0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      fontWeight: 700,
      color: "white",
    }}
  >
    U
  </div>
);

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Desktop: sidebar always visible
  const showSidebar = isMobile ? sidebarOpen : true;
  const isFirstLoad = messages.length === 0;

  const handleSend = (text) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "Nice to meet you sir!" },
    ]);
  };

  const handleNewChat = () => {
    setMessages([]);
    setSidebarOpen(false);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "row",
        position: "relative",
        background: "#05050a",
      }}
    >
      {/* Live wave background */}
      <WaveBackground />

      {/* Desktop left icon strip (when sidebar closed on mobile, or always on desktop collapsed) */}
      {!isMobile && (
        <div
          style={{
            position: "relative",
            zIndex: 20,
            width: 62,
            height: "100%",
            background: "rgba(10,8,8,0.7)",
            backdropFilter: "blur(24px)",
            borderRight: "0.5px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 14,
            gap: 6,
            flexShrink: 0,
          }}
        >
          <button
            style={iconSideBtn}
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <HamburgerIcon />
          </button>
          <div style={{ height: 10 }} />
          <button style={iconSideBtn} onClick={handleNewChat}>
            <PlusIcon />
          </button>
          <button style={iconSideBtn}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="8" cy="8" r="5.5" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
              <line x1="12.5" y1="12.5" x2="16" y2="16" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <div style={{ flex: 1 }} />
          <button style={iconSideBtn}>
            <GearIcon />
          </button>
          <button style={{ ...iconSideBtn, marginBottom: 16 }}>
            <UserCircle />
          </button>
        </div>
      )}

      {/* Sidebar panel */}
      {(showSidebar || !isMobile) && (
        <div
          style={{
            position: isMobile ? "fixed" : "relative",
            zIndex: isMobile ? 50 : 20,
            height: "100%",
            flexShrink: 0,
          }}
        >
          <Sidebar
            open={showSidebar}
            onClose={() => setSidebarOpen(false)}
            onNewChat={handleNewChat}
            isMobile={isMobile}
          />
        </div>
      )}

      {/* Main chat area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          position: "relative",
          zIndex: 5,
          minWidth: 0,
        }}
      >
        {/* Mobile top bar */}
        {isMobile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px 10px",
              flexShrink: 0,
            }}
          >
            <button
              style={iconSideBtn}
              onClick={() => setSidebarOpen(true)}
            >
              <HamburgerIcon />
            </button>
            <RubraLogo />
            <button style={iconSideBtn} onClick={handleNewChat}>
              <PlusIcon />
            </button>
          </div>
        )}

        {/* Welcome screen or messages */}
        {isFirstLoad ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "0 20px",
            }}
          >
            <h1
              style={{
                fontFamily: "'Syne', 'Inter', sans-serif",
                fontSize: isMobile ? "clamp(22px,7vw,36px)" : "clamp(28px,4vw,48px)",
                fontWeight: 800,
                color: "white",
                lineHeight: 1.2,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginRight: 4,
                }}
              >
                <span
                  style={{
                    width: isMobile ? 18 : 24,
                    height: isMobile ? 18 : 24,
                    borderRadius: "50%",
                    background: "radial-gradient(circle at 38% 38%, #ff4a3a, #c0392b)",
                    display: "inline-block",
                    flexShrink: 0,
                    boxShadow: "0 0 12px rgba(192,57,43,0.7)",
                  }}
                />
                <span style={{ color: "#e74c3c" }}>How</span>
              </span>
              Can I assist you today?
            </h1>
          </div>
        ) : (
          <MessageThread messages={messages} />
        )}

        {/* Chat input bar */}
        <ChatBar onSend={handleSend} />
      </div>
    </div>
  );
}

const iconSideBtn = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  width: 38,
  height: 38,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.15s",
};

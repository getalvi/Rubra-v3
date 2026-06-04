import { useState } from "react";

const HamburgerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect y="3" width="20" height="1.5" rx="0.75" fill="white" />
    <rect y="9" width="20" height="1.5" rx="0.75" fill="white" />
    <rect y="15" width="20" height="1.5" rx="0.75" fill="white" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="8" cy="8" r="5.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
    <line x1="12.5" y1="12.5" x2="16" y2="16" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <line x1="8" y1="2" x2="8" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="2" y1="8" x2="14" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const DotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="3" r="1.5" fill="rgba(255,255,255,0.4)" />
    <circle cx="8" cy="8" r="1.5" fill="rgba(255,255,255,0.4)" />
    <circle cx="8" cy="13" r="1.5" fill="rgba(255,255,255,0.4)" />
  </svg>
);

const GearIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="3" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
    <path d="M10 1v2M10 17v2M1 10h2M17 10h2M3.22 3.22l1.41 1.41M15.36 15.36l1.41 1.41M3.22 16.78l1.41-1.41M15.36 4.64l1.41-1.41" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const sessions = [
  "How to become a developer...",
  "Making top Notch web apps...",
  "Today's research about AI...",
  "How to become productive...",
];

export default function Sidebar({ open, onClose, onNewChat, isMobile }) {
  const [search, setSearch] = useState("");

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 40,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      <aside
        style={{
          position: isMobile ? "fixed" : "relative",
          left: 0,
          top: 0,
          bottom: 0,
          width: 255,
          height: "100%",
          background: "rgba(18,14,14,0.92)",
          backdropFilter: "blur(24px)",
          borderRight: "0.5px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
          transform: isMobile
            ? open
              ? "translateX(0)"
              : "translateX(-100%)"
            : "translateX(0)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          flexShrink: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 14px 10px",
            gap: 8,
          }}
        >
          {/* RUBRA logo */}
          <span
            style={{
              fontFamily: "'Syne', 'Inter', sans-serif",
              fontWeight: 800,
              fontSize: 17,
              color: "white",
              letterSpacing: "0.05em",
            }}
          >
            RUBRA
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={iconBtn} title="Search">
              <SearchIcon />
            </button>
            <button style={iconBtn} onClick={onClose} title="Close menu">
              <HamburgerIcon />
            </button>
          </div>
        </div>

        {/* New Chat button */}
        <div style={{ padding: "6px 12px 12px" }}>
          <button
            onClick={onNewChat}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              background: "rgba(255,255,255,0.07)",
              border: "0.5px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              color: "white",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.07)")
            }
          >
            <PlusIcon />
            New Chat
          </button>
        </div>

        {/* Sessions */}
        <div style={{ padding: "0 12px 8px" }}>
          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 6,
              paddingLeft: 4,
            }}
          >
            Sessions
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {sessions.map((s, i) => (
              <button
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 10px",
                  background: "transparent",
                  border: "none",
                  borderRadius: 8,
                  color: "rgba(255,255,255,0.7)",
                  cursor: "pointer",
                  fontSize: 13,
                  textAlign: "left",
                  transition: "background 0.15s",
                  width: "100%",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.06)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}
                >
                  {s}
                </span>
                <span style={{ flexShrink: 0, marginLeft: 4 }}>
                  <DotsIcon />
                </span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Footer / User */}
        <div
          style={{
            padding: "12px",
            borderTop: "0.5px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(255,255,255,0.06)",
              border: "0.5px solid rgba(255,255,255,0.10)",
              borderRadius: 20,
              padding: "6px 14px 6px 6px",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(192,57,43,0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: "white",
              }}
            >
              U
            </div>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
              User486
            </span>
          </div>
          <button style={iconBtn} title="Settings">
            <GearIcon />
          </button>
        </div>
      </aside>
    </>
  );
}

const iconBtn = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: 6,
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.15s",
};

export default function Welcome({ isMobile, displayName }) {
  const first = displayName?.split(" ")[0];
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 select-none relative z-10">
      {first && (
        <p className="text-sm mb-4" style={{ color:"#4a4a6a" }}>Hey {first},</p>
      )}
      <h1 className="font-display font-extrabold text-white tracking-tight leading-tight"
        style={{ fontSize: isMobile ? "clamp(28px,8vw,42px)" : "clamp(36px,4vw,56px)" }}>
        <span style={{ color:"#e8301f" }}>How</span> can I assist<br/>you today?
      </h1>
      <p className="mt-4 text-sm max-w-xs leading-relaxed" style={{ color:"#3a3a55" }}>
        Code · Write · Research · Learn · News
      </p>
    </div>
  );
}

const col1Posters = [
  { id: 1, src: "/uploads/play_cover/0652_Hamlet.png", title: "Hamlet" },
  { id: 2, src: "/uploads/play_cover/0688_Madhavi.png", title: "Madhavi" },
  { id: 3, src: "/uploads/play_cover/0076_Jar.png", title: "Jar" },
  { id: 4, src: "/uploads/play_cover/0517_Sandajuko-Mahabharat.png", title: "Sandajuko Mahabharat" },
  { id: 5, src: "/uploads/play_cover/0143_Digree-Maila.png", title: "Digree Maila" },
  { id: 6, src: "/uploads/play_cover/0636_Anna-in-the-tropics.png", title: "Anna in the Tropics" },
];

const col2Posters = [
  { id: 7, src: "/uploads/play_cover/0139_Sunkeshari.png", title: "Sunkeshari" },
  { id: 8, src: "/uploads/play_cover/0335_The-Laramie-Project.png", title: "The Laramie Project" },
  { id: 9, src: "/uploads/play_cover/0607_Malini.png", title: "Malini" },
  { id: 10, src: "/uploads/play_cover/0059_Charumati.png", title: "Charumati" },
  { id: 11, src: "/uploads/play_cover/0698_Jyanmaya.png", title: "Jyanmaya" },
  { id: 12, src: "/uploads/play_cover/0548_Look-Back-In-Anger.png", title: "Look Back In Anger" },
];

export function AuthVisual() {
  const col1 = [...col1Posters, ...col1Posters];
  const col2 = [...col2Posters, ...col2Posters];

  return (
    <aside className="auth-visual" aria-label="Featured TheatreHub productions">
      {/* Background ambient spotlight glows */}
      <div className="auth-visual-glow auth-visual-glow-1" />
      <div className="auth-visual-glow auth-visual-glow-2" />

      {/* Dynamic Moving Poster Marquee Grid */}
      <div className="auth-visual-grid">
        <div className="auth-visual-col">
          <div className="auth-visual-track auth-track-up">
            {col1.map((item, idx) => (
              <div className="auth-visual-card" key={`c1-${item.id}-${idx}`}>
                <img src={item.src} alt={item.title} />
              </div>
            ))}
          </div>
        </div>
        <div className="auth-visual-col">
          <div className="auth-visual-track auth-track-down">
            {col2.map((item, idx) => (
              <div className="auth-visual-card" key={`c2-${item.id}-${idx}`}>
                <img src={item.src} alt={item.title} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Overlay */}
      <div className="auth-visual-overlay">
        <div className="auth-visual-badge">
          <span className="auth-badge-dot" />
          <span>Nepal Stage Archive &amp; Community</span>
        </div>
        <h2>Discover the stage.</h2>
        <p>Giving every production team in Nepal a living digital stage.</p>

        <div className="auth-visual-stats">
          <div className="auth-stat-pill">🎭 50+ Plays</div>
          <div className="auth-stat-pill">🏛️ 20+ Venues</div>
          <div className="auth-stat-pill">⚡ Live Schedule</div>
        </div>
      </div>
    </aside>
  );
}

export function AnimatedAuthBackground() {
  return (
    <div className="auth-tech-bg pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="auth-tech-bg__glow auth-tech-bg__glow--primary" />
      <div className="auth-tech-bg__glow auth-tech-bg__glow--secondary" />

      <svg className="auth-tech-bg__grid" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="auth-grid-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" fill="none" className="auth-tech-bg__grid-line" />
          </pattern>
          <linearGradient id="auth-connection-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" className="auth-tech-bg__line-stop auth-tech-bg__line-stop--soft" />
            <stop offset="50%" className="auth-tech-bg__line-stop auth-tech-bg__line-stop--bright" />
            <stop offset="100%" className="auth-tech-bg__line-stop auth-tech-bg__line-stop--soft" />
          </linearGradient>
        </defs>

        <rect width="1200" height="900" fill="url(#auth-grid-pattern)" />

        <g className="auth-tech-bg__network auth-tech-bg__network--one">
          <path d="M110 720C260 630 390 670 530 560C640 474 760 476 890 372C958 318 1045 261 1160 199" fill="none" stroke="url(#auth-connection-gradient)" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="110" cy="720" r="4" className="auth-tech-bg__node" />
          <circle cx="530" cy="560" r="3.5" className="auth-tech-bg__node" />
          <circle cx="890" cy="372" r="4" className="auth-tech-bg__node" />
          <circle cx="1160" cy="199" r="4.2" className="auth-tech-bg__node" />
        </g>

        <g className="auth-tech-bg__network auth-tech-bg__network--two">
          <path d="M0 320C132 398 258 367 376 444C493 521 632 501 759 569C912 653 1009 596 1200 700" fill="none" stroke="url(#auth-connection-gradient)" strokeWidth="1" strokeLinecap="round" />
          <circle cx="376" cy="444" r="3.5" className="auth-tech-bg__node" />
          <circle cx="759" cy="569" r="3.5" className="auth-tech-bg__node" />
          <circle cx="1009" cy="596" r="4" className="auth-tech-bg__node" />
        </g>
      </svg>

      <div className="auth-tech-bg__scan" />
    </div>
  );
}

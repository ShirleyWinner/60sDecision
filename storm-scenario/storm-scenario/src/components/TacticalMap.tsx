/** Tactical plot shared by the situation screen and the desktop layout. */
export function TacticalMap() {
  return (
    <div className="panel">
      <div className="panel-head">
        <span>TACTICAL PLOT / NORTH PACIFIC</span>
        <span className="tag amber">STORM WARNING</span>
      </div>
      <div className="map">
        <svg
          viewBox="0 0 780 390"
          role="img"
          aria-label="Tactical route map: vessel southwest, port northeast, central storm moving northwest; minor detour east, major detour west."
        >
          <defs>
            <pattern id="grid" width="39" height="39" patternUnits="userSpaceOnUse">
              <path d="M39 0H0V39" fill="none" stroke="#28434b" strokeWidth=".5" />
            </pattern>
            <radialGradient id="storm">
              <stop stopColor="#f3a75c" stopOpacity=".25" />
              <stop offset="1" stopColor="#ec9858" stopOpacity=".02" />
            </radialGradient>
          </defs>

          <rect width="780" height="390" fill="url(#grid)" />

          {/* Coastlines, west and east */}
          <path
            d="M0 0H130L142 23 117 41 168 53 139 82 151 112 110 135 120 151 83 172 98 205 48 235 0 229Z M780 0H665L638 31 677 51 626 70 660 109 695 102 700 137 744 160 780 155Z"
            fill="#1b343b"
            stroke="#3c5960"
          />

          <g fontFamily="monospace" fontSize="9" fill="#5b7b85">
            <text x="174" y="22">
              32° N
            </text>
            <text x="18" y="278">
              PACIFIC OCEAN
            </text>
            <text x="580" y="374">
              142° E
            </text>
          </g>

          {/* Storm cell 07 */}
          <circle
            cx="390"
            cy="185"
            r="120"
            fill="url(#storm)"
            stroke="#aa7548"
            strokeDasharray="4 7"
          />
          <ellipse
            cx="390"
            cy="185"
            rx="90"
            ry="68"
            transform="rotate(-25 390 185)"
            fill="none"
            stroke="#ae8052"
            opacity=".55"
          />
          <ellipse
            cx="390"
            cy="185"
            rx="57"
            ry="42"
            transform="rotate(-25 390 185)"
            fill="none"
            stroke="#d6995c"
          />
          <path
            d="M368 184q38-47 54-5t-51 23q-31-16-10-45"
            fill="none"
            stroke="#e2a363"
            strokeWidth="2"
          />

          {/* Direct line, major detour (west), minor detour (east) */}
          <path d="M176 316 606 74" stroke="#677c81" strokeDasharray="4 7" fill="none" />
          <path
            d="M176 316 260 98 432 50 606 74"
            stroke="#7b939c"
            strokeWidth="2"
            strokeDasharray="7 6"
            fill="none"
          />
          <path d="M176 316 416 314 553 217 606 74" stroke="#8ce3c3" strokeWidth="2" fill="none" />

          <g fill="#8ce3c3">
            <circle cx="416" cy="314" r="4" />
            <circle cx="553" cy="217" r="4" />
            <circle cx="606" cy="74" r="5" />
          </g>

          {/* Own vessel */}
          <circle cx="176" cy="316" r="22" fill="none" stroke="#8ce3c3" opacity=".35" />
          <path d="m176 303 9 23-9-5-9 5Z" fill="#b6f6db" />

          <g fontFamily="monospace" fontSize="10">
            <text x="204" y="345" fill="#b6f6db">
              MV MERIDIAN
            </text>
            <text x="617" y="61" fill="#d4e6df">
              PORT HELIOS
            </text>
            <text x="466" y="309" fill="#8ce3c3">
              B / +20 MIN
            </text>
            <text x="205" y="80" fill="#99adb5">
              C / +55 MIN
            </text>
            <text x="361" y="264" fill="#e9b476">
              CELL 07 / 48 KN
            </text>
            <text x="337" y="111" fill="#e9b476">
              ↖ NW · 12 KN
            </text>
          </g>

          {/* Compass rose */}
          <g transform="translate(730 320)" stroke="#93b1b6" fill="none">
            <circle r="20" />
            <path d="M0-28V28M-28 0H28" />
          </g>
          <text x="726" y="284" fontSize="10" fill="#b3cacd">
            N
          </text>
        </svg>
        <div className="map-note">SIMULATED TELEMETRY · NOT FOR NAVIGATION</div>
      </div>
      <div className="map-legend">
        <span>STORM CELL</span>
        <span>MINOR DETOUR</span>
        <span>MAJOR DETOUR</span>
      </div>
    </div>
  );
}

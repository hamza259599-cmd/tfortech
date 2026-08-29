import { useEffect, useState } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DEFAULT_STYLE = {
  background_color: "#FF3B7F",
  text_color: "#FFFFFF",
  button_color: "#FFD166",
  hover_color: "#FFFFFF",
  border_color: "transparent"
};

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState([]);
  const [style, setStyle] = useState(DEFAULT_STYLE);

  useEffect(() => {
    axios.get(`${API}/announcements`)
      .then((res) => setAnnouncements(res.data || []))
      .catch(() => setAnnouncements([]));

    axios.get(`${API}/settings/announcement-bar`)
      .then((res) => setStyle({ ...DEFAULT_STYLE, ...res.data }))
      .catch(() => setStyle(DEFAULT_STYLE));
  }, []);

  if (announcements.length === 0) return null;

  const combinedText = announcements.map((a) => a.text).join("   •   ");
  const hasBorder = style.border_color && style.border_color !== "transparent";

  return (
    <div
      className="w-full overflow-hidden py-3.5 group"
      style={{
        backgroundColor: style.background_color,
        color: style.text_color,
        borderTop: hasBorder ? `2px solid ${style.border_color}` : "none",
        borderBottom: hasBorder ? `2px solid ${style.border_color}` : "none"
      }}
      data-testid="announcement-bar"
    >
      <div className="flex whitespace-nowrap animate-[marquee_28s_linear_infinite] group-hover:[animation-play-state:paused]">
        <span
          className="text-base sm:text-lg font-semibold px-6 tracking-wide transition-colors"
          onMouseEnter={(e) => { e.currentTarget.style.color = style.hover_color; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = style.text_color; }}
        >
          {combinedText}
        </span>
        <span
          className="text-base sm:text-lg font-semibold px-6 tracking-wide"
          aria-hidden="true"
        >
          {combinedText}
        </span>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

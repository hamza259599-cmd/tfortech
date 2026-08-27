import { useEffect, useState } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    axios.get(`${API}/announcements`)
      .then((res) => setAnnouncements(res.data || []))
      .catch(() => setAnnouncements([]));
  }, []);

  if (announcements.length === 0) return null;

  const combinedText = announcements.map((a) => a.text).join("   •   ");

  return (
    <div
      className="w-full text-white overflow-hidden py-3.5"
      style={{
        background: "linear-gradient(90deg, #FF3B7F, #FFD166, #06D6A0, #4ECDC4, #9B59B6, #FF3B7F)",
        backgroundSize: "300% 100%",
        animation: "gradientShift 12s ease infinite"
      }}
      data-testid="announcement-bar"
    >
      <div className="flex whitespace-nowrap animate-[marquee_28s_linear_infinite] hover:[animation-play-state:paused]">
        <span className="text-base sm:text-lg font-semibold px-6 tracking-wide">{combinedText}</span>
        <span className="text-base sm:text-lg font-semibold px-6 tracking-wide" aria-hidden="true">{combinedText}</span>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

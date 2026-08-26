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
    <div className="w-full bg-[#1A1A1A] text-white overflow-hidden py-2.5" data-testid="announcement-bar">
      <div className="flex whitespace-nowrap animate-[marquee_28s_linear_infinite] hover:[animation-play-state:paused]">
        <span className="text-sm font-medium px-4">{combinedText}</span>
        <span className="text-sm font-medium px-4" aria-hidden="true">{combinedText}</span>
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

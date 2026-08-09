import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Zap } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function getRemaining(endTime) {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

function TimeBox({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-black/30 backdrop-blur-sm rounded-lg px-2.5 py-1.5 min-w-[44px] text-center">
        <span className="text-lg md:text-2xl font-bold text-white tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[10px] md:text-xs text-white/80 mt-1 uppercase tracking-wide">{label}</span>
    </div>
  );
}

export default function DealCountdown() {
  const [deal, setDeal] = useState(null);
  const [remaining, setRemaining] = useState(null);

  const fetchDeal = async () => {
    try {
      const res = await axios.get(`${API}/deals`);
      const active = (res.data || [])[0] || null;
      setDeal(active);
    } catch (e) {
      setDeal(null);
    }
  };

  useEffect(() => {
    fetchDeal();
    const refetchInterval = setInterval(fetchDeal, 60000);
    return () => clearInterval(refetchInterval);
  }, []);

  useEffect(() => {
    if (!deal) { setRemaining(null); return; }
    const tick = () => {
      const r = getRemaining(deal.end_time);
      setRemaining(r);
      if (!r) fetchDeal();
    };
    tick();
    const tickInterval = setInterval(tick, 1000);
    return () => clearInterval(tickInterval);
  }, [deal]);

  if (!deal || !remaining) return null;

  const discountLabel =
    deal.discount_type === "percent"
      ? `${deal.discount_value}% OFF`
      : `Rs. ${deal.discount_value} OFF`;

  return (
    <div
      className="relative overflow-hidden rounded-2xl mb-8 text-white"
      style={{
        backgroundImage: deal.banner_image ? `url(${deal.banner_image})` : undefined,
        backgroundColor: "#1A1A1A",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 px-5 py-5 md:px-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#FF8FAB] p-2 rounded-full flex-shrink-0">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold">{deal.title}</h3>
            {deal.description && <p className="text-sm text-white/80">{deal.description}</p>}
            <span className="inline-block mt-1 bg-[#FF8FAB] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {discountLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <TimeBox value={remaining.days} label="Days" />
          <span className="text-white/50 text-xl -mt-3">:</span>
          <TimeBox value={remaining.hours} label="Hrs" />
          <span className="text-white/50 text-xl -mt-3">:</span>
          <TimeBox value={remaining.minutes} label="Min" />
          <span className="text-white/50 text-xl -mt-3">:</span>
          <TimeBox value={remaining.seconds} label="Sec" />
        </div>

        <Link
          to={deal.category_id ? `/products?category=${deal.category_id}` : "/products"}
          className="bg-white text-[#1A1A1A] px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-white/90 transition-colors flex-shrink-0"
        >
          Shop Now
        </Link>
      </div>
    </div>
  );
}

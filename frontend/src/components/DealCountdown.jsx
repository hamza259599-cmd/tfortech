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
  
    if (!deal) return null;
  
    const discountLabel =
          deal.discount_type === "percent"
            ? `${deal.discount_value}% OFF`
            : `Rs. ${deal.discount_value} OFF`;
  
    const expired = !remaining;
    const hasImage = !!deal.banner_image;
  
    return (
          <div className="relative overflow-hidden rounded-2xl mb-8 text-white bg-[#1A1A1A]">
            {hasImage ? (
                    <img
                                src={deal.banner_image}
                                alt={deal.title || "Azadi Deal"}
                                className="w-full h-auto max-h-[520px] object-contain bg-black block"
                              />
                  ) : (
                    <div className="w-full aspect-[16/6] flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] to-[#333]">
                              <Zap className="w-10 h-10 text-white/30" />
                    </div>
                )}
          
                <div className="absolute top-3 left-3 md:top-5 md:left-5 flex items-center gap-2 max-w-[70%]">
                        <div className="bg-[#3B82F6] p-1.5 md:p-2 rounded-full flex-shrink-0 shadow-lg">
                                  <Zap className="w-4 h-4 md:w-5 md:h-5 text-white" fill="white" />
                        </div>
                        <div className="bg-black/40 backdrop-blur-sm rounded-lg px-2.5 py-1 md:px-3 md:py-1.5">
                                  <h3 className="text-sm md:text-lg font-bold leading-tight truncate">{deal.title}</h3>
                          {deal.description && (
                        <p className="text-[11px] md:text-xs text-white/80 truncate">{deal.description}</p>
                                  )}
                        </div>
                  {deal.discount_value ? (
                      <span className="bg-[#3B82F6] text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-full shadow-lg flex-shrink-0">
                        {discountLabel}
                      </span>
                    ) : null}
                </div>
          
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 md:bottom-5 flex items-center gap-2 md:gap-3 bg-black/55 backdrop-blur-md rounded-2xl px-3 py-2 md:px-5 md:py-3 shadow-xl">
                  {expired ? (
                      <span className="text-sm md:text-lg font-bold tracking-wide px-2">DEAL EXPIRED</span>
                    ) : (
                      <>
                                  <TimeBox value={remaining.days} label="Days" />
                                  <span className="text-white/50 text-lg md:text-xl -mt-3">:</span>
                                  <TimeBox value={remaining.hours} label="Hrs" />
                                  <span className="text-white/50 text-lg md:text-xl -mt-3">:</span>
                                  <TimeBox value={remaining.minutes} label="Min" />
                                  <span className="text-white/50 text-lg md:text-xl -mt-3">:</span>
                                  <TimeBox value={remaining.seconds} label="Sec" />
                      </>
                    )}
                </div>
          
                <Link
                          to={deal.category_id ? `/products?category=${deal.category_id}` : "/products"}
                          className="absolute bottom-3 right-3 md:bottom-5 md:right-5 bg-white text-[#1A1A1A] px-3.5 py-1.5 md:px-5 md:py-2.5 rounded-full font-semibold text-xs md:text-sm hover:bg-white/90 transition-colors shadow-lg"
                        >
                        Shop Now
                </Link>
          </div>
        );
}

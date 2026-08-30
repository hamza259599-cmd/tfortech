import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";

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

function CountdownRow({ endTime }) {
  const [remaining, setRemaining] = useState(() => getRemaining(endTime));

  useEffect(() => {
    setRemaining(getRemaining(endTime));
    const timer = setInterval(() => setRemaining(getRemaining(endTime)), 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  if (!remaining) {
    return <span className="text-xs font-bold text-red-500">Deal Expired</span>;
  }

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-700">
      {remaining.days > 0 && (
        <>
          <span className="bg-gray-100 rounded px-1.5 py-0.5 tabular-nums">{pad(remaining.days)}d</span>
          <span>:</span>
        </>
      )}
      <span className="bg-gray-100 rounded px-1.5 py-0.5 tabular-nums">{pad(remaining.hours)}h</span>
      <span>:</span>
      <span className="bg-gray-100 rounded px-1.5 py-0.5 tabular-nums">{pad(remaining.minutes)}m</span>
      <span>:</span>
      <span className="bg-gray-100 rounded px-1.5 py-0.5 tabular-nums">{pad(remaining.seconds)}s</span>
    </div>
  );
}

function DealCard({ deal }) {
  const shopLink = deal.shop_now_link || (deal.product_id ? `/product/${deal.product_id}` : "/products");
  const image = deal.banner_image || deal.product_image;
  const discountLabel =
    deal.discount_type === "percent" && deal.discount_value
      ? `${deal.discount_value}% OFF`
      : deal.discount_value
      ? `Rs. ${deal.discount_value} OFF`
      : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col sm:flex-row h-full">
      <div className="relative sm:w-48 h-40 sm:h-auto shrink-0 bg-gray-50 flex items-center justify-center">
        {image ? (
          <img src={image} alt={deal.title} className="w-full h-full object-contain" />
        ) : (
          <Zap className="w-10 h-10 text-gray-300" />
        )}
        {discountLabel && (
          <span className="absolute top-2 left-2 bg-[#FF3B7F] text-white text-[10px] font-bold px-2 py-1 rounded-full">
            {discountLabel}
          </span>
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{deal.title}</h3>
          {deal.description && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{deal.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {deal.sale_price ? (
              <span className="text-lg font-bold text-[#FF3B7F]">Rs. {Number(deal.sale_price).toLocaleString()}</span>
            ) : null}
            {deal.original_price ? (
              <span className="text-sm text-gray-400 line-through">Rs. {Number(deal.original_price).toLocaleString()}</span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
          {deal.countdown_enabled !== false ? <CountdownRow endTime={deal.end_time} /> : <span />}
          <Link
            to={shopLink}
            className="bg-[#1A1A1A] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full hover:bg-black transition-colors whitespace-nowrap"
          >
            {deal.shop_now_text || "Shop Now"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FlashDealsSection() {
  const [deals, setDeals] = useState([]);
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);

  useEffect(() => {
    axios.get(`${API}/hero-deals`)
      .then((res) => setDeals(res.data || []))
      .catch(() => setDeals([]));
  }, []);

  useEffect(() => {
    if (deals.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % deals.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [deals.length]);

  if (deals.length === 0) return null;

  const goTo = (i) => setCurrent(((i % deals.length) + deals.length) % deals.length);
  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff > 50) prev();
    else if (diff < -50) next();
    touchStartX.current = null;
  };

  const deal = deals[Math.min(current, deals.length - 1)];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="flash-deals-section">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-[#FF3B7F]" fill="#FF3B7F" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Flash Deals</h2>
      </div>

      <div className="relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <DealCard deal={deal} />

        {deals.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous deal"
              className="hidden md:flex items-center justify-center absolute -left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 text-[#1A1A1A] rounded-full p-2 shadow-md border border-gray-100 z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next deal"
              className="hidden md:flex items-center justify-center absolute -right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 text-[#1A1A1A] rounded-full p-2 shadow-md border border-gray-100 z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {deals.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {deals.map((d, i) => (
            <button
              type="button"
              key={d.id}
              onClick={() => goTo(i)}
              aria-label={`Go to deal ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-[#FF3B7F]" : "w-2 bg-gray-300 hover:bg-gray-400"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

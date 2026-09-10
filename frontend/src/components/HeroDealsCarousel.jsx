import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Zap, ChevronLeft, ChevronRight, PlayCircle, X } from "lucide-react";

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
      <div className="bg-black/30 backdrop-blur-sm rounded-lg px-2.5 py-1.5 min-w-[40px] text-center">
        <span className="text-base md:text-2xl font-bold text-white tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[9px] md:text-xs text-white/80 mt-1 uppercase tracking-wide">{label}</span>
    </div>
  );
}

function DealSlide({ deal, onWatchReview }) {
  const [remaining, setRemaining] = useState(() => getRemaining(deal.end_time));

  useEffect(() => {
    setRemaining(getRemaining(deal.end_time));
    const timer = setInterval(() => {
      setRemaining(getRemaining(deal.end_time));
    }, 1000);
    return () => clearInterval(timer);
  }, [deal.end_time]);

  const shopLink = deal.shop_now_link || (deal.product_id ? `/product/${deal.product_id}` : "/products");
  const countdownOn = deal.countdown_enabled !== false;

  return (
    <div className="relative overflow-hidden rounded-2xl text-white bg-[#1A1A1A]">
      {deal.banner_image ? (
        <img src={deal.banner_image} alt={deal.title} className="w-full h-auto max-h-[480px] object-contain bg-black block" />
      ) : (
        <div className="w-full h-[260px] md:h-[400px] bg-gradient-to-br from-[#1A1A1A] to-[#333] flex items-center justify-center">
          <Zap className="w-16 h-16 text-white/20" />
        </div>
      )}

      <div className="absolute top-3 left-3 flex items-center gap-2 max-w-[75%]">
        <div className="bg-[#3B82F6] p-1.5 rounded-full flex-shrink-0">
          <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" fill="white" />
        </div>
        <div className="bg-black/50 backdrop-blur-sm rounded-xl px-2.5 py-1.5 md:px-3">
          <p className="text-xs md:text-base font-bold truncate">{deal.title}</p>
          {deal.description ? <p className="hidden md:block text-xs text-white/70 truncate">{deal.description}</p> : null}
        </div>
      </div>

      {deal.discount_value ? (
        <div className="absolute top-3 right-3 bg-[#3B82F6] text-white text-[10px] md:text-sm font-bold px-2.5 md:px-3 py-1 md:py-1.5 rounded-full">
          {deal.discount_type === "percent" ? `${deal.discount_value}% OFF` : `Rs. ${deal.discount_value} OFF`}
        </div>
      ) : null}

      {countdownOn && (
        remaining ? (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 md:gap-2 bg-black/55 backdrop-blur-md rounded-2xl px-2.5 md:px-3 py-1.5 md:py-2">
            {remaining.days > 0 && <TimeBox value={remaining.days} label="Days" />}
            <TimeBox value={remaining.hours} label="Hrs" />
            <span className="text-white/50">:</span>
            <TimeBox value={remaining.minutes} label="Min" />
            <span className="text-white/50">:</span>
            <TimeBox value={remaining.seconds} label="Sec" />
          </div>
        ) : (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md rounded-xl px-4 py-2 text-xs md:text-sm font-bold tracking-wide">
            DEAL EXPIRED
          </div>
        )
      )}

      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 md:gap-2">
        {deal.review_video_id ? (
          <button
            onClick={() => onWatchReview(deal)}
            className="flex items-center gap-1 md:gap-1.5 bg-white/90 hover:bg-white text-[#1A1A1A] px-2.5 md:px-3 py-1.5 md:py-2 rounded-full text-[10px] md:text-sm font-semibold"
          >
            <PlayCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> Review
          </button>
        ) : null}
        <Link
          to={shopLink}
          className="bg-white text-[#1A1A1A] px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-sm font-semibold hover:bg-gray-100"
        >
          {deal.shop_now_text || "Shop Now"}
        </Link>
      </div>
    </div>
  );
}

function ReviewVideoModal({ deal, onClose }) {
  if (!deal) return null;
  const embedUrl = deal.review_video_platform === "vimeo"
    ? `https://player.vimeo.com/video/${deal.review_video_id}`
    : `https://www.youtube.com/embed/${deal.review_video_id}?autoplay=1`;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-black rounded-2xl overflow-hidden max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-3 bg-[#1A1A1A]">
          <p className="text-white text-sm font-medium truncate pr-2">{deal.title} - Customer Review</p>
          <button onClick={onClose} className="text-white/70 hover:text-white flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="aspect-video">
          <iframe
            src={embedUrl}
            title="Customer review video"
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

export default function HeroDealsCarousel() {
  const [deals, setDeals] = useState([]);
  const [current, setCurrent] = useState(0);
  const [reviewDeal, setReviewDeal] = useState(null);
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
    }, 6000);
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
    <div className="mb-8">
      <div className="relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <DealSlide deal={deal} onWatchReview={setReviewDeal} />

        {deals.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous deal"
              className="hidden md:flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#1A1A1A] rounded-full p-2 shadow z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next deal"
              className="hidden md:flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#1A1A1A] rounded-full p-2 shadow z-10"
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
              className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-[#3B82F6]" : "w-2 bg-gray-300 hover:bg-gray-400"}`}
            />
          ))}
        </div>
      )}

      <ReviewVideoModal deal={reviewDeal} onClose={() => setReviewDeal(null)} />
    </div>
  );
}

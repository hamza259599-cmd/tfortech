import { useEffect, useState } from "react";
import axios from "axios";
import { Star, Play, X } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function getEmbedInfo(url) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]+)/);
  if (yt) return { type: "iframe", src: `https://www.youtube.com/embed/${yt[1]}` };
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return { type: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };
  return { type: "video", src: url };
}

function StarRow({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`w-4 h-4 ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
      ))}
    </div>
  );
}

export default function CustomerReviewVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get(`${API}/review-videos`);
        setVideos(res.data || []);
      } catch (e) {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  if (loading || videos.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-white" data-testid="customer-reviews-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-3">
            What Our Customers Say
          </h2>
          <p className="text-[#6B7280] text-lg">Real reviews from real customers</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveVideo(v)}
              className="text-left bg-[#FDFBF7] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="relative aspect-video bg-black/80">
                {v.thumbnail_url ? (
                  <img src={v.thumbnail_url} alt={v.customer_name} className="w-full h-full object-cover opacity-90" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
                    Customer Video
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-[#1A1A1A] ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-[#1A1A1A]">{v.customer_name}</h3>
                  <StarRow rating={v.rating || 5} />
                </div>
                {v.caption && <p className="text-sm text-[#6B7280] line-clamp-2">{v.caption}</p>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeVideo && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white"
            >
              <X className="w-7 h-7" />
            </button>
            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              {(() => {
                const info = getEmbedInfo(activeVideo.video_url);
                return info.type === "iframe" ? (
                  <iframe
                    src={info.src}
                    title={activeVideo.customer_name}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={info.src} controls autoPlay className="w-full h-full" />
                );
              })()}
            </div>
            <div className="mt-3 text-white">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{activeVideo.customer_name}</h3>
                <StarRow rating={activeVideo.rating || 5} />
              </div>
              {activeVideo.caption && <p className="text-white/70 text-sm mt-1">{activeVideo.caption}</p>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

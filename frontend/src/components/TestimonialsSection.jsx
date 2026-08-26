import { useEffect, useState } from "react";
import axios from "axios";
import { Star, User } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    axios.get(`${API}/testimonials`)
      .then((res) => setTestimonials(res.data || []))
      .catch(() => setTestimonials([]));
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-gray-50" data-testid="testimonials-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
            What Our Customers Say
          </h2>
          <p className="text-[#6B7280] text-lg">Real reviews from real customers</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < (t.rating || 0) ? "fill-[#FFD166] text-[#FFD166]" : "text-gray-200"}`}
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-6">{t.review_text}</p>
              <div className="flex items-center gap-3">
                {t.customer_image ? (
                  <img
                    src={t.customer_image}
                    alt={t.customer_name}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-[#1A1A1A] text-sm">{t.customer_name}</p>
                  {t.review_date && <p className="text-xs text-gray-400">{t.review_date}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

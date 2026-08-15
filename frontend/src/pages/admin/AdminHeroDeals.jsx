import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  Plus, ArrowLeft, X, Trash2, Zap, ImagePlus, ChevronUp, ChevronDown,
  CheckCircle2, XCircle, PlayCircle
} from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const emptyDeal = {
  title: "",
  description: "",
  banner_image: "",
  product_id: "",
  original_price: "",
  sale_price: "",
  discount_type: "percent",
  discount_value: "",
  start_time: "",
  end_time: "",
  countdown_enabled: true,
  shop_now_text: "Shop Now",
  shop_now_link: "",
  review_video_url: "",
  is_active: true,
};

function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminHeroDeals() {
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyDeal);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [videoChecking, setVideoChecking] = useState(false);
  const [videoCheckResult, setVideoCheckResult] = useState(null);

  useEffect(() => {
    fetchDeals();
    fetchProducts();
  }, []);

  const fetchDeals = async () => {
    try {
      const res = await axios.get(`${API}/admin/hero-deals`);
      setDeals(res.data);
    } catch (e) {
      toast.error("Failed to load flash deals");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/products`);
      setProducts(res.data.products || res.data || []);
    } catch (e) {
      setProducts([]);
    }
  };

  function handleImageUpload(file) {
    if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please upload a JPG, PNG or WebP image");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image is too large. Please use an image under 4MB.");
      return;
    }
    setImageUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const response = await axios.post(`${API}/upload/image`, { image: reader.result });
        const imageUrl = `${process.env.REACT_APP_BACKEND_URL}${response.data.image_url}`;
        setForm((f) => ({ ...f, banner_image: imageUrl }));
        toast.success("Image uploaded!");
      } catch (err) {
        toast.error("Failed to upload image");
      } finally {
        setImageUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleValidateVideo() {
    if (!form.review_video_url || !form.review_video_url.trim()) {
      toast.error("Enter a YouTube link first");
      return;
    }
    setVideoChecking(true);
    setVideoCheckResult(null);
    try {
      const res = await axios.post(`${API}/admin/review-videos/validate`, { url: form.review_video_url });
      setVideoCheckResult(res.data);
      if (res.data.valid) toast.success("Video can be embedded!");
      else toast.error(res.data.detail || "This video cannot be embedded");
    } catch (e) {
      toast.error("Could not validate this video");
      setVideoCheckResult({ valid: false, detail: "Could not validate this video." });
    } finally {
      setVideoChecking(false);
    }
  }

  function openCreate() {
    setForm(emptyDeal);
    setEditingId(null);
    setVideoCheckResult(null);
    setShowModal(true);
  }

  function openEdit(deal) {
    setForm({
      title: deal.title || "",
      description: deal.description || "",
      banner_image: deal.banner_image || "",
      product_id: deal.product_id || "",
      original_price: deal.original_price ?? "",
      sale_price: deal.sale_price ?? "",
      discount_type: deal.discount_type || "percent",
      discount_value: deal.discount_value ?? "",
      start_time: toLocalInputValue(deal.start_time),
      end_time: toLocalInputValue(deal.end_time),
      countdown_enabled: deal.countdown_enabled !== false,
      shop_now_text: deal.shop_now_text || "Shop Now",
      shop_now_link: deal.shop_now_link || "",
      review_video_url: deal.review_video_url || "",
      is_active: deal.is_active !== false,
    });
    setEditingId(deal.id);
    setVideoCheckResult(null);
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error("Deal title is required"); return; }
    if (!form.end_time) { toast.error("Please set an end date/time"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        original_price: form.original_price === "" ? null : Number(form.original_price),
        sale_price: form.sale_price === "" ? null : Number(form.sale_price),
        discount_value: form.discount_value === "" ? null : Number(form.discount_value),
        start_time: form.start_time ? new Date(form.start_time).toISOString() : new Date().toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        product_id: form.product_id || null,
      };
      if (editingId) {
        await axios.put(`${API}/admin/hero-deals/${editingId}`, payload);
        toast.success("Flash deal updated");
      } else {
        await axios.post(`${API}/admin/hero-deals`, payload);
        toast.success("Flash deal created");
      }
      setShowModal(false);
      fetchDeals();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to save deal");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this flash deal?")) return;
    try {
      await axios.delete(`${API}/admin/hero-deals/${id}`);
      toast.success("Deal deleted");
      fetchDeals();
    } catch (e) {
      toast.error("Failed to delete deal");
    }
  }

  async function handleToggleActive(deal) {
    try {
      await axios.put(`${API}/admin/hero-deals/${deal.id}`, {
        ...deal,
        is_active: !deal.is_active,
        start_time: deal.start_time,
        end_time: deal.end_time,
      });
      fetchDeals();
    } catch (e) {
      toast.error("Failed to update deal");
    }
  }

  async function moveDeal(index, direction) {
    const newOrder = [...deals];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= newOrder.length) return;
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
    setDeals(newOrder);
    try {
      await axios.post(`${API}/admin/hero-deals/reorder`, { order: newOrder.map((d) => d.id) });
    } catch (e) {
      toast.error("Failed to save new order");
      fetchDeals();
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-gray-400 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-black">Hero Flash Deals</h1>
              <p className="text-gray-500 text-sm">Run 3-4 flash deals at once in the homepage hero carousel</p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#FF8FAB] text-white px-5 py-2.5 rounded-full font-semibold hover:bg-[#FF8FAB]/90"
          >
            <Plus className="w-4 h-4" /> New Flash Deal
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : deals.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
            <Zap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hero flash deals yet. Create up to 3-4 to run a carousel.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deals.map((deal, index) => (
              <div key={deal.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveDeal(index, -1)} disabled={index === 0} className="p-1 rounded hover:bg-gray-100 disabled:opacity-20">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveDeal(index, 1)} disabled={index === deals.length - 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-20">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-24 h-16 rounded-lg overflow-hidden bg-black flex-shrink-0">
                  {deal.banner_image ? (
                    <img src={deal.banner_image} alt={deal.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30">
                      <ImagePlus className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{deal.title}</p>
                  <p className="text-sm text-gray-400 truncate">{deal.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    {deal.discount_value ? (
                      <span className="bg-[#FF8FAB]/10 text-[#FF8FAB] px-2 py-0.5 rounded-full font-semibold">
                        {deal.discount_type === "percent" ? `${deal.discount_value}% OFF` : `Rs. ${deal.discount_value} OFF`}
                      </span>
                    ) : null}
                    {deal.review_video_url ? (
                      <span className="flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5" /> Review video</span>
                    ) : null}
                    <span>{new Date(deal.end_time) > new Date() ? "Live" : "Expired"}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleActive(deal)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                    deal.is_active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {deal.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {deal.is_active ? "Active" : "Paused"}
                </button>

                <button onClick={() => openEdit(deal)} className="px-4 py-2 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 flex-shrink-0">
                  Edit
                </button>
                <button onClick={() => handleDelete(deal.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-full flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold">{editingId ? "Edit Flash Deal" : "New Flash Deal"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Gaming Laptop Deal"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF8FAB]/50 focus:border-[#FF8FAB] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short line, e.g. Core i7, 16GB RAM, 512GB SSD"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF8FAB]/50 focus:border-[#FF8FAB] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Linked Product (optional)</label>
                <select
                  value={form.product_id}
                  onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF8FAB]/50 focus:border-[#FF8FAB] outline-none"
                >
                  <option value="">No linked product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Linking a product lets Shop Now go straight to it.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deal Image</label>
                <p className="text-xs text-gray-400 mb-2">Upload directly from your computer. No external link needed.</p>
                {form.banner_image ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black">
                    <img src={form.banner_image} alt="Deal preview" className="w-full max-h-52 object-contain" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, banner_image: "" })}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-1.5 shadow"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <label className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full shadow cursor-pointer">
                      {imageUploading ? "Uploading..." : "Replace"}
                      <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" disabled={imageUploading} onChange={(e) => handleImageUpload(e.target.files[0])} />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl py-8 cursor-pointer hover:border-[#FF8FAB] hover:bg-[#FF8FAB]/5 transition-colors">
                    {imageUploading ? (
                      <span className="text-sm text-gray-500">Uploading image...</span>
                    ) : (
                      <>
                        <ImagePlus className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-500">Click to upload deal image</span>
                        <span className="text-xs text-gray-400">JPG, PNG or WebP</span>
                      </>
                    )}
                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" disabled={imageUploading} onChange={(e) => handleImageUpload(e.target.files[0])} />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Original price</label>
                  <input
                    type="number" value={form.original_price}
                    onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                    placeholder="e.g. 250000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF8FAB]/50 focus:border-[#FF8FAB] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sale price</label>
                  <input
                    type="number" value={form.sale_price}
                    onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
                    placeholder="e.g. 210000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF8FAB]/50 focus:border-[#FF8FAB] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount %</label>
                  <input
                    type="number" value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                    placeholder="e.g. 20"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF8FAB]/50 focus:border-[#FF8FAB] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start date/time</label>
                  <input
                    type="datetime-local" value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF8FAB]/50 focus:border-[#FF8FAB] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End date/time *</label>
                  <input
                    type="datetime-local" value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF8FAB]/50 focus:border-[#FF8FAB] outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox" checked={form.countdown_enabled}
                  onChange={(e) => setForm({ ...form, countdown_enabled: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#FF8FAB]"
                />
                <span className="text-sm text-gray-700">Show countdown timer on this deal</span>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shop Now button text</label>
                  <input
                    type="text" value={form.shop_now_text}
                    onChange={(e) => setForm({ ...form, shop_now_text: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF8FAB]/50 focus:border-[#FF8FAB] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shop Now link (optional)</label>
                  <input
                    type="text" value={form.shop_now_link}
                    onChange={(e) => setForm({ ...form, shop_now_link: e.target.value })}
                    placeholder="/products or leave empty to use linked product"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF8FAB]/50 focus:border-[#FF8FAB] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Review Video (YouTube link)</label>
                <div className="flex gap-2">
                  <input
                    type="text" value={form.review_video_url}
                    onChange={(e) => { setForm({ ...form, review_video_url: e.target.value }); setVideoCheckResult(null); }}
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF8FAB]/50 focus:border-[#FF8FAB] outline-none"
                  />
                  <button
                    type="button" onClick={handleValidateVideo} disabled={videoChecking}
                    className="px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 whitespace-nowrap disabled:opacity-50"
                  >
                    {videoChecking ? "Checking..." : "Validate Video"}
                  </button>
                </div>
                {videoCheckResult && (
                  <p className={`text-xs mt-2 ${videoCheckResult.valid ? "text-green-600" : "text-red-500"}`}>
                    {videoCheckResult.valid ? `Valid — "${videoCheckResult.title || "video"}" can be embedded.` : videoCheckResult.detail}
                  </p>
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox" checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#FF8FAB]"
                />
                <span className="text-sm text-gray-700">Active (visible on the site)</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-full font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleSave} disabled={saving}
                className="px-6 py-2.5 bg-[#FF8FAB] text-white rounded-full font-semibold hover:bg-[#FF8FAB]/90 disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId ? "Save Changes" : "Create Deal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

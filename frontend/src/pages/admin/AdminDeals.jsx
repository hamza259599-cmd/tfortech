import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Plus, ArrowLeft, X, Trash2, Zap, Clock, CheckCircle2, XCircle } from "lucide-react";
import { ImagePlus } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const emptyDeal = {
  title: "",
  description: "",
  banner_image: "",
  discount_type: "percent",
  discount_value: "",
  duration_hours: "24",
  product_ids: [],
  category_id: "",
};

function timeLeftLabel(endTime) {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h left`;
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return `${hours}h ${minutes}m left`;
}

export default function AdminDeals() {
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyDeal);
  const [saving, setSaving] = useState(false);
      const [imageUploading, setImageUploading] = useState(false);

    function handleDealImageUpload(file) {
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

  useEffect(() => {
    fetchDeals();
      fetchProducts();
  }, []);
  const fetchDeals = async () => {
    try {
      const res = await axios.get(`${API}/admin/deals`);
      setDeals(res.data);
    } catch (e) {
      toast.error("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/admin/products`);
      setProducts(res.data);
    } catch (e) {
    }
  };

  const toggleProduct = (productId) => {
    setForm((f) => ({
      ...f,
      product_ids: f.product_ids.includes(productId)
        ? f.product_ids.filter((id) => id !== productId)
        : [...f.product_ids, productId],
    }));
  };

  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error("Give the deal a title"); return; }
    if (!form.discount_value || Number(form.discount_value) <= 0) { toast.error("Enter a discount value"); return; }
    if (!form.duration_hours || Number(form.duration_hours) <= 0) { toast.error("Enter how many hours the deal should run"); return; }

    setSaving(true);
    try {
      await axios.post(`${API}/admin/deals`, {
        title: form.title,
        description: form.description || null,
        banner_image: form.banner_image || null,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        duration_hours: Number(form.duration_hours),
        product_ids: form.product_ids,
        category_id: form.category_id || null,
      });
      toast.success("Deal created - timer has started!");
      setShowModal(false);
      setForm(emptyDeal);
      fetchDeals();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to create deal");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (deal) => {
    try {
      await axios.put(`${API}/admin/deals/${deal.id}`, { is_active: !deal.is_active });
      toast.success(deal.is_active ? "Deal paused" : "Deal activated");
      fetchDeals();
    } catch (e) {
      toast.error("Failed to update deal");
    }
  };

  const handleDelete = async (dealId) => {
    if (!window.confirm("Are you sure you want to permanently delete this item? This action cannot be undone.")) return;
    try {
      await axios.delete(`${API}/admin/deals/${dealId}`);
      toast.success("Deleted successfully.");
      fetchDeals();
    } catch (e) {
      toast.error("Unable to delete. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Flash Deals</h1>
              <p className="text-sm text-gray-500">Create time-limited deals with a live countdown</p>
            </div>
          </div>
          <button
            onClick={() => { setForm(emptyDeal); setShowModal(true); }}
            className="bg-[#FF8FAB] text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-[#FF8FAB]/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Deal
          </button>
        </div>
      </header>

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 p-6">
          {loading ? (
            <p className="text-gray-500">Loading deals...</p>
          ) : deals.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <Zap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No deals yet. Create one to show a countdown banner on the site.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deals.map((deal) => {
                const expired = new Date(deal.end_time).getTime() <= Date.now();
                return (
                  <div key={deal.id} className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-800">{deal.title}</h3>
                        {deal.description && <p className="text-sm text-gray-500">{deal.description}</p>}
                      </div>
                      <span className="bg-[#FF8FAB]/10 text-[#FF8FAB] text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                        {deal.discount_type === "percent" ? `${deal.discount_value}% OFF` : `Rs. ${deal.discount_value} OFF`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Clock className="w-4 h-4" />
                      {expired ? <span className="text-red-500 font-medium">Ended</span> : <span>{timeLeftLabel(deal.end_time)}</span>}
                      <span className="text-gray-300">.</span>
                      {deal.is_active && !expired ? (
                        <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="w-4 h-4" /> Live</span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400"><XCircle className="w-4 h-4" /> {expired ? "Expired" : "Paused"}</span>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 mb-4">
                      {deal.product_ids?.length ? `${deal.product_ids.length} product(s) selected` : "Applies to whole store"}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleActive(deal)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {deal.is_active ? "Pause" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(deal.id)}
                        className="px-3 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-8">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">New Flash Deal</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. 8.8 Azadi Sale"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF8FAB]/50 focus:border-[#FF8FAB] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                <input
                  type="text" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short line shown under the title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF8FAB]/50 focus:border-[#FF8FAB] outline-none"
                />
              </div>

              <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Deal Image</label>
                            <p className="text-xs text-gray-400 mb-2">Upload directly from your computer. No external link needed.</p>p>
                {form.banner_image ? (
                          <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black">
                                            <img src={form.banner_image} alt="Deal preview" className="w-full max-h-56 object-contain" />
                                            <button
                                                                  type="button"
                                                                  onClick={() => setForm({ ...form, banner_image: "" })}
                                                                  className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-1.5 shadow"
                                                                >
                                                                <X className="w-4 h-4" />
                                            </button>
                                            <label className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full shadow cursor-pointer">
                                              {imageUploading ? "Uploading..." : "Replace"}
                                                                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" disabled={imageUploading} onChange={(e) => handleDealImageUpload(e.target.files[0])} />
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
                                            <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" disabled={imageUploading} onChange={(e) => handleDealImageUpload(e.target.files[0])} />
                          </label>
                            )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount type</label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF8FAB]/50 focus:border-[#FF8FAB] outline-none"
                  >
                    <option value="percent">Percent (%)</option>
                    <option value="fixed">Fixed (Rs.)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount value *</label>
                  <input
                    type="number" value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                    placeholder={form.discount_type === "percent" ? "e.g. 20" : "e.g. 500"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF8FAB]/50 focus:border-[#FF8FAB] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Runs for how many hours? *
                </label>
                <input
                  type="number" value={form.duration_hours}
                  onChange={(e) => setForm({ ...form, duration_hours: e.target.value })}
                  placeholder="24"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF8FAB]/50 focus:border-[#FF8FAB] outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Countdown starts the moment you save this deal.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apply to specific products (optional - leave empty for whole store)
                </label>
                <div className="border border-gray-200 rounded-xl max-h-40 overflow-y-auto divide-y">
                  {products.map((p) => (
                    <label key={p.product_id} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={form.product_ids.includes(p.product_id)}
                        onChange={() => toggleProduct(p.product_id)}
                        className="rounded"
                      />
                      {p.name}
                    </label>
                  ))}
                  {products.length === 0 && <p className="px-4 py-3 text-sm text-gray-400">No products found</p>}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-[#FF8FAB] text-white rounded-xl font-medium hover:bg-[#FF8FAB]/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Creating..." : "Start Deal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Plus, ArrowLeft, X, Trash2, Star, Eye, EyeOff, Pencil, User } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const emptyForm = {
  customer_name: "",
  review_text: "",
  customer_image: "",
  rating: 5,
  review_date: "",
};

export default function AdminTestimonials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API}/admin/testimonials`);
      setItems(res.data);
    } catch (e) {
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      customer_name: item.customer_name || "",
      review_text: item.review_text || "",
      customer_image: item.customer_image || "",
      rating: item.rating || 5,
      review_date: item.review_date || "",
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result;
        const response = await axios.post(`${API}/upload/image`, { image: base64 });
        setForm((f) => ({ ...f, customer_image: `${BACKEND_URL}${response.data.image_url}` }));
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload image");
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name.trim() || !form.review_text.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`${API}/admin/testimonials/${editingId}`, form);
        toast.success("Testimonial updated");
      } else {
        await axios.post(`${API}/admin/testimonials`, { ...form, is_active: true });
        toast.success("Testimonial added");
      }
      setShowModal(false);
      fetchItems();
    } catch (e) {
      toast.error("Failed to save testimonial");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this item? This action cannot be undone.")) return;
    try {
      await axios.delete(`${API}/admin/testimonials/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Deleted successfully.");
    } catch (e) {
      toast.error("Unable to delete. Please try again.");
    }
  };

  const handleToggle = async (item) => {
    try {
      await axios.put(`${API}/admin/testimonials/${item.id}`, { is_active: !item.is_active });
      fetchItems();
    } catch (e) {
      toast.error("Failed to update");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <Link to="/admin" className="text-sm text-gray-500 flex items-center gap-1 mb-2 hover:text-[#FF8FAB]">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="font-heading text-3xl font-bold">Customer Testimonials</h1>
            <p className="text-gray-500 mt-1">Manage the reviews shown on the homepage.</p>
          </div>
          <button
            onClick={openNew}
            className="bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white rounded-full px-5 py-2.5 font-medium flex items-center gap-2"
            data-testid="new-testimonial-btn"
          >
            <Plus className="w-5 h-5" /> New Testimonial
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border p-12 text-center text-gray-400">
            No testimonials yet. Add one to show it on the homepage.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border p-5">
                <div className="flex items-center gap-3 mb-3">
                  {item.customer_image ? (
                    <img src={item.customer_image} alt={item.customer_name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{item.customer_name}</p>
                    {item.review_date && <p className="text-xs text-gray-400">{item.review_date}</p>}
                  </div>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < (item.rating || 0) ? "fill-[#FFD166] text-[#FFD166]" : "text-gray-200"}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">{item.review_text}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(item)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                      item.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {item.is_active ? "Active" : "Disabled"}
                  </button>
                  <button onClick={() => openEdit(item)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg ml-auto">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    data-testid={`delete-testimonial-${item.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-bold">
                {editingId ? "Edit Testimonial" : "New Testimonial"}
              </h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Customer Name *</label>
                <input
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  className="w-full border rounded-xl p-2.5 mt-1 text-sm"
                  data-testid="testimonial-name-input"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Review Text *</label>
                <textarea
                  value={form.review_text}
                  onChange={(e) => setForm({ ...form, review_text: e.target.value })}
                  rows={4}
                  className="w-full border rounded-xl p-2.5 mt-1 text-sm"
                  data-testid="testimonial-text-input"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Customer Photo (Optional)</label>
                <div className="flex items-center gap-3 mt-1">
                  {form.customer_image && (
                    <img src={form.customer_image} alt="" className="w-14 h-14 rounded-full object-cover" />
                  )}
                  <label className="border rounded-xl px-4 py-2 text-sm cursor-pointer hover:bg-gray-50">
                    {uploading ? "Uploading..." : "Upload Photo"}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Rating</label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full border rounded-xl p-2.5 mt-1 text-sm"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} Star{n > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Review Date (Optional)</label>
                  <input
                    type="date"
                    value={form.review_date}
                    onChange={(e) => setForm({ ...form, review_date: e.target.value })}
                    className="w-full border rounded-xl p-2.5 mt-1 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white rounded-full py-2.5 font-medium"
                  data-testid="save-testimonial-btn"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 rounded-full border font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Plus, ArrowLeft, X, Trash2, Star, Video, Eye, EyeOff, Pencil } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const emptyVideo = {
  customer_name: "",
  video_url: "",
  thumbnail_url: "",
  caption: "",
  rating: 5,
  sort_order: 0,
};

export default function AdminReviewVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyVideo);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await axios.get(`${API}/admin/review-videos`);
      setVideos(res.data);
    } catch (e) {
      toast.error("Failed to load review videos");
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyVideo);
    setShowModal(true);
  };

  const openEdit = (v) => {
    setEditingId(v.id);
    setForm({
      customer_name: v.customer_name || "",
      video_url: v.video_url || "",
      thumbnail_url: v.thumbnail_url || "",
      caption: v.caption || "",
      rating: v.rating || 5,
      sort_order: v.sort_order || 0,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.customer_name.trim()) { toast.error("Enter the customer's name"); return; }
    if (!form.video_url.trim()) { toast.error("Paste the video link"); return; }

    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`${API}/admin/review-videos/${editingId}`, form);
        toast.success("Review video updated");
      } else {
        await axios.post(`${API}/admin/review-videos`, form);
        toast.success("Review video added");
      }
      setShowModal(false);
      setForm(emptyVideo);
      setEditingId(null);
      fetchVideos();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to save review video");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (v) => {
    try {
      await axios.put(`${API}/admin/review-videos/${v.id}`, { is_active: !v.is_active });
      toast.success(v.is_active ? "Video hidden from site" : "Video shown on site");
      fetchVideos();
    } catch (e) {
      toast.error("Failed to update video");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this item? This action cannot be undone.")) return;
    try {
      await axios.delete(`${API}/admin/review-videos/${id}`);
      toast.success("Deleted successfully.");
      fetchVideos();
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
              <h1 className="text-2xl font-bold text-gray-800">Customer Review Videos</h1>
              <p className="text-sm text-gray-500">Add short customer testimonial videos (2-3 min) to build trust</p>
            </div>
          </div>
          <button
            onClick={openNew}
            className="bg-[#3B82F6] text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-[#3B82F6]/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Video
          </button>
        </div>
      </header>

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 p-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-800">
            Paste a link to the video - a YouTube link, a Vimeo link, or a direct video file URL.
            Uploading raw video files from your computer isn't supported yet - a link is the
            fastest way to get this live.
          </div>

          {loading ? (
            <p className="text-gray-500">Loading review videos...</p>
          ) : videos.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <Video className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No review videos yet. Add your first customer testimonial.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((v) => (
                <div key={v.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
                    {v.thumbnail_url ? (
                      <img src={v.thumbnail_url} alt={v.customer_name} className="w-full h-full object-cover" />
                    ) : (
                      <Video className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-gray-800">{v.customer_name}</h3>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i <= (v.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                      ))}
                    </div>
                  </div>
                  {v.caption && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{v.caption}</p>}

                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    {v.is_active ? (
                      <span className="flex items-center gap-1 text-green-600"><Eye className="w-3.5 h-3.5" /> Visible on site</span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400"><EyeOff className="w-3.5 h-3.5" /> Hidden</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(v)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(v)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {v.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="px-3 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-8">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? "Edit" : "Add"} Review Video</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                <input
                  type="text" value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  placeholder="e.g. Ayesha K."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video Link *</label>
                <input
                  type="text" value={form.video_url}
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                  placeholder="YouTube, Vimeo, or direct video URL"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail Image URL (optional)</label>
                <input
                  type="text" value={form.thumbnail_url}
                  onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Short Caption (optional)</label>
                <input
                  type="text" value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  placeholder="e.g. Loved the quality and fast delivery!"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, rating: r })}
                      className="p-1"
                    >
                      <Star className={`w-7 h-7 ${r <= form.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                    </button>
                  ))}
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
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-[#3B82F6] text-white rounded-xl font-medium hover:bg-[#3B82F6]/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId ? "Save Changes" : "Add Video"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

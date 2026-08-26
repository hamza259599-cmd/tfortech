import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Plus, ArrowLeft, Trash2, Megaphone, Eye, EyeOff, Pencil, ChevronUp, ChevronDown } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminAnnouncements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API}/admin/announcements`);
      setItems(res.data);
    } catch (e) {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditingId(null);
    setText("");
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setText(item.text);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`${API}/admin/announcements/${editingId}`, { text });
        toast.success("Announcement updated");
      } else {
        await axios.post(`${API}/admin/announcements`, { text, is_active: true });
        toast.success("Announcement added");
      }
      setShowModal(false);
      fetchItems();
    } catch (e) {
      toast.error("Failed to save announcement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this item? This action cannot be undone.")) return;
    try {
      await axios.delete(`${API}/admin/announcements/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Deleted successfully.");
    } catch (e) {
      toast.error("Unable to delete. Please try again.");
    }
  };

  const handleToggle = async (item) => {
    try {
      await axios.put(`${API}/admin/announcements/${item.id}`, { is_active: !item.is_active });
      fetchItems();
    } catch (e) {
      toast.error("Failed to update");
    }
  };

  const moveItem = async (index, direction) => {
    const newOrder = [...items];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= newOrder.length) return;
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
    setItems(newOrder);
    try {
      await axios.post(`${API}/admin/announcements/reorder`, { order: newOrder.map((i) => i.id) });
    } catch (e) {
      toast.error("Failed to save new order");
      fetchItems();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/admin" className="text-sm text-gray-500 flex items-center gap-1 mb-2 hover:text-[#FF8FAB]">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
              <Megaphone className="w-7 h-7 text-[#FF8FAB]" /> Announcement Bar
            </h1>
            <p className="text-gray-500 mt-1">Add scrolling promotional messages shown near the hero section.</p>
          </div>
          <button
            onClick={openNew}
            className="bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white rounded-full px-5 py-2.5 font-medium flex items-center gap-2"
            data-testid="new-announcement-btn"
          >
            <Plus className="w-5 h-5" /> New Announcement
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border p-12 text-center text-gray-400">
            No announcements yet. Add one to show it on the homepage.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="bg-white rounded-xl border p-4 flex items-center gap-4">
                <div className="flex flex-col">
                  <button onClick={() => moveItem(index, -1)} disabled={index === 0} className="disabled:opacity-30">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} className="disabled:opacity-30">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <p className="flex-1 text-sm">{item.text}</p>
                <button
                  onClick={() => handleToggle(item)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                    item.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {item.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {item.is_active ? "Active" : "Disabled"}
                </button>
                <button onClick={() => openEdit(item)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  data-testid={`delete-announcement-${item.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <h2 className="font-heading text-xl font-bold mb-4">
              {editingId ? "Edit Announcement" : "New Announcement"}
            </h2>
            <form onSubmit={handleSubmit}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g., 🔥 Flash Deals Available — Order Now on WhatsApp"
                rows={3}
                className="w-full border rounded-xl p-3 text-sm"
                data-testid="announcement-text-input"
                autoFocus
              />
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white rounded-full py-2.5 font-medium"
                  data-testid="save-announcement-btn"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 rounded-full border font-medium"
                >
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

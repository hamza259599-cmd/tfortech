import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { toast } from "sonner";
import { Star, Trash2, Edit2, X, Search, Filter } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/admin/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setEditForm({ rating: review.rating, comment: review.comment });
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`${API}/admin/reviews/${editingReview.review_id}`, editForm);
      toast.success("Review updated!");
      setEditingReview(null);
      fetchReviews();
    } catch (error) {
      toast.error("Failed to update review");
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await axios.delete(`${API}/admin/reviews/${reviewId}`);
      toast.success("Deleted successfully.");
      setDeleteConfirm(null);
      fetchReviews();
    } catch (error) {
      toast.error("Unable to delete. Please try again.");
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRating = filterRating === "all" || review.rating === parseInt(filterRating);
    
    return matchesSearch && matchesRating;
  });

  const renderStars = (rating, editable = false, onChange = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!editable}
            onClick={() => editable && onChange && onChange(star)}
            className={`${editable ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-[#1A1A1A] mb-2">
              Reviews Management
            </h1>
            <p className="text-gray-500">Manage customer reviews and ratings</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border">
              <p className="text-sm text-gray-500">Total Reviews</p>
              <p className="text-2xl font-bold text-[#1A1A1A]">{reviews.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border">
              <p className="text-sm text-gray-500">Average Rating</p>
              <p className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-1">
                {reviews.length > 0 
                  ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                  : "0"}
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border">
              <p className="text-sm text-gray-500">5 Star Reviews</p>
              <p className="text-2xl font-bold text-green-600">
                {reviews.filter(r => r.rating === 5).length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border">
              <p className="text-sm text-gray-500">1-2 Star Reviews</p>
              <p className="text-2xl font-bold text-red-600">
                {reviews.filter(r => r.rating <= 2).length}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 mb-6 border flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by product, user, or comment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-[#FF8FAB] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">No Reviews Found</h3>
              <p className="text-gray-500">
                {searchQuery || filterRating !== "all" 
                  ? "Try adjusting your filters" 
                  : "No reviews have been submitted yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.review_id} className="bg-white rounded-xl p-6 border hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <img
                      src={review.product_image || "https://placehold.co/80x80/F8F9FA/6B7280?text=No+Image"}
                      alt={review.product_name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    
                    {/* Review Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-[#1A1A1A]">{review.product_name}</h3>
                          <p className="text-sm text-gray-500">by {review.user_name || "Anonymous"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500 ml-2">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{review.comment}</p>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(review)}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Edit2 className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirm(review.review_id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Edit Modal */}
          {editingReview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditingReview(null)}>
              <div className="bg-white rounded-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-heading text-xl font-bold">Edit Review</h3>
                  <button onClick={() => setEditingReview(null)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">Rating</label>
                  {renderStars(editForm.rating, true, (rating) => setEditForm(prev => ({ ...prev, rating })))}
                </div>
                
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">Comment</label>
                  <Textarea
                    value={editForm.comment}
                    onChange={(e) => setEditForm(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setEditingReview(null)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} className="flex-1 bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white">
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteConfirm(null)}>
              <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-2">Delete Item?</h3>
                  <p className="text-gray-500">Are you sure you want to permanently delete this item? This action cannot be undone.</p>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

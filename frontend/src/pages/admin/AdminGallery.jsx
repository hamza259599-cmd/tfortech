import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Image, ArrowLeft, X, Eye, Copy, Upload, Trash2, FolderOpen, Package } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminGallery() {
  const [galleryImages, setGalleryImages] = useState([]); // Saved gallery images
  const [productImages, setProductImages] = useState([]); // Product images
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [activeTab, setActiveTab] = useState("gallery"); // gallery or products
  
  // Form state
  const [newImage, setNewImage] = useState({
    title: "",
    image_url: ""
  });

  useEffect(() => {
    fetchAllImages();
  }, []);

  const fetchAllImages = async () => {
    try {
      // Fetch saved gallery images
      const galleryRes = await axios.get(`${API}/admin/gallery`);
      setGalleryImages(galleryRes.data);
      
      // Fetch product images
      const productsRes = await axios.get(`${API}/admin/products`);
      const products = productsRes.data;
      
      const allProductImages = [];
      products.forEach(product => {
        if (product.image_url) {
          allProductImages.push({
            url: product.image_url,
            product_id: product.product_id,
            product_name: product.name,
            type: "main"
          });
        }
        if (product.image_urls && product.image_urls.length > 0) {
          product.image_urls.forEach((url, index) => {
            if (url && !allProductImages.find(img => img.url === url)) {
              allProductImages.push({
                url: url,
                product_id: product.product_id,
                product_name: product.name,
                type: index === 0 ? "main" : "additional"
              });
            }
          });
        }
      });
      
      setProductImages(allProductImages);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
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
        setNewImage({ ...newImage, image_url: `${BACKEND_URL}${response.data.image_url}` });
        toast.success("Image uploaded!");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      setUploading(false);
    }
  };

  const handleAddImage = async () => {
    if (!newImage.image_url) {
      toast.error("Please upload an image");
      return;
    }

    try {
      await axios.post(`${API}/admin/gallery`, {
        title: newImage.title || "Untitled",
        image_url: newImage.image_url
      });
      toast.success("Image saved to gallery!");
      setShowAddModal(false);
      setNewImage({ title: "", image_url: "" });
      fetchAllImages();
    } catch (error) {
      console.error("Error adding image:", error);
      toast.error("Failed to save image");
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Are you sure you want to permanently delete this item? This action cannot be undone.")) return;

    try {
      await axios.delete(`${API}/admin/gallery/${imageId}`);
      toast.success("Deleted successfully.");
      fetchAllImages();
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Unable to delete. Please try again.");
    }
  };

  const copyImageUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("Image URL copied! Use this in products");
  };

  const currentImages = activeTab === "gallery" ? galleryImages : productImages;

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gallery</h1>
              <p className="text-sm text-gray-500">Store and manage your images</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#FF8FAB] text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-[#FF8FAB]/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Upload Image
          </button>
        </div>
      </header>

      <div className="flex">
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Tabs */}
          <div className="bg-white rounded-xl p-2 mb-6 inline-flex gap-2">
            <button
              onClick={() => setActiveTab("gallery")}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                activeTab === "gallery"
                  ? "bg-[#FF8FAB] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              Saved Gallery ({galleryImages.length})
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                activeTab === "products"
                  ? "bg-[#FF8FAB] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Package className="w-4 h-4" />
              Product Images ({productImages.length})
            </button>
          </div>

          {/* Info Box for Gallery Tab */}
          {activeTab === "gallery" && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>💡 Tip:</strong> Upload images here to save them permanently. 
                Copy the URL and use it when adding products. Images saved here won't be deleted even if removed from products.
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF8FAB] border-t-transparent"></div>
            </div>
          ) : currentImages.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <Image className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {activeTab === "gallery" ? "No Saved Images" : "No Product Images"}
              </h3>
              <p className="text-gray-500 mb-6">
                {activeTab === "gallery" 
                  ? "Upload images to save them in your gallery" 
                  : "Add products with images to see them here"}
              </p>
              {activeTab === "gallery" && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#FF8FAB] text-white px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2 hover:bg-[#FF8FAB]/90 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Upload First Image
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {activeTab === "gallery" ? (
                // Gallery Images
                galleryImages.map((image) => (
                  <div
                    key={image.image_id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm group relative"
                  >
                    <div className="aspect-square relative">
                      <img
                        src={image.image_url}
                        alt={image.title || "Gallery image"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/200x200/F8F9FA/6B7280?text=Error";
                        }}
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => setPreviewImage(image)}
                          className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => copyImageUrl(image.image_url)}
                          className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteImage(image.image_id)}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-2 border-t">
                      <p className="text-xs text-gray-600 truncate" title={image.title}>
                        {image.title || "Untitled"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                // Product Images
                productImages.map((image, index) => (
                  <div
                    key={`${image.product_id}-${index}`}
                    className="bg-white rounded-xl overflow-hidden shadow-sm group relative"
                  >
                    <div className="aspect-square relative">
                      <img
                        src={image.url}
                        alt={image.product_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/200x200/F8F9FA/6B7280?text=Error";
                        }}
                      />
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                        image.type === "main" 
                          ? "bg-green-500 text-white" 
                          : "bg-blue-500 text-white"
                      }`}>
                        {image.type === "main" ? "Main" : "Extra"}
                      </div>
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => setPreviewImage({ ...image, image_url: image.url, title: image.product_name })}
                          className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => copyImageUrl(image.url)}
                          className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-2 border-t">
                      <p className="text-xs text-gray-600 truncate" title={image.product_name}>
                        {image.product_name}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {/* Add Image Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Upload Image</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewImage({ title: "", image_url: "" });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image *
                </label>
                {newImage.image_url ? (
                  <div className="relative">
                    <img
                      src={newImage.image_url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => setNewImage({ ...newImage, image_url: "" })}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF8FAB] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#FF8FAB] border-t-transparent"></div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-gray-400 mb-2" />
                        <span className="text-gray-500">Click to upload image</span>
                        <span className="text-sm text-gray-400">Max 5MB</span>
                      </>
                    )}
                  </label>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={newImage.title}
                  onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                  placeholder="Enter image title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF8FAB]/50 focus:border-[#FF8FAB] outline-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewImage({ title: "", image_url: "" });
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddImage}
                disabled={!newImage.image_url}
                className="flex-1 px-4 py-3 bg-[#FF8FAB] text-white rounded-xl font-medium hover:bg-[#FF8FAB]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save to Gallery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={previewImage.image_url}
              alt={previewImage.title || "Gallery image"}
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="mt-4 text-white text-center">
              <h3 className="text-xl font-semibold">{previewImage.title || "Untitled"}</h3>
              <div className="mt-4 flex justify-center gap-3">
                <button
                  onClick={() => copyImageUrl(previewImage.image_url)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

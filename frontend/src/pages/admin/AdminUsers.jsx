import { useEffect, useState } from "react";
import axios from "axios";
import { Navbar } from "../../components/Layout";
import AdminSidebar from "../../components/AdminSidebar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import { toast } from "sonner";
import { 
  Search, ShieldCheck, Mail, Calendar,
  XCircle, Trash2, UserPlus, Users, CheckCircle
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    active: 0,
    new_this_month: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users || []);
      setStats(response.data.stats || {
        total: response.data.users?.length || 0,
        admins: response.data.users?.filter(u => u.is_admin).length || 0,
        active: response.data.users?.length || 0,
        new_this_month: 0
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/admin/users/${userId}/role`, 
        { is_admin: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(currentStatus ? "Admin access removed" : "Admin access granted");
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    if (!newAdminPassword.trim()) {
      toast.error("Please enter a password");
      return;
    }
    if (newAdminPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setAddingAdmin(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API}/admin/users/add-admin`, 
        { 
          email: newAdminEmail.trim(),
          password: newAdminPassword,
          name: newAdminName.trim() || newAdminEmail.split('@')[0]
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.is_new) {
        toast.success(`New admin created: ${newAdminEmail}`);
      } else {
        toast.success(`Admin access granted to ${newAdminEmail}`);
      }
      
      setNewAdminEmail("");
      setNewAdminPassword("");
      setNewAdminName("");
      setShowAddAdminModal(false);
      fetchUsers();
    } catch (error) {
      console.error("Error adding admin:", error);
      toast.error(error.response?.data?.detail || "Failed to add admin");
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Deleted successfully.");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.detail || "Unable to delete. Please try again.");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || 
                       (roleFilter === "admin" && user.is_admin) ||
                       (roleFilter === "user" && !user.is_admin);
    return matchesSearch && matchesRole;
  });

  const statCards = [
    { label: "Total Users", value: stats.total, icon: Users, color: "bg-blue-500" },
    { label: "Admin Users", value: stats.admins, icon: ShieldCheck, color: "bg-purple-500" },
    { label: "Active Users", value: stats.active, icon: CheckCircle, color: "bg-green-500" },
    { label: "New This Month", value: stats.new_this_month, icon: Calendar, color: "bg-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Navbar />
      
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl font-bold text-[#1A1A1A]">Users Management</h1>
              <p className="text-sm text-gray-500">Manage all registered users and their roles</p>
            </div>
            <Button
              onClick={() => setShowAddAdminModal(true)}
              className="bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white"
              data-testid="add-admin-btn"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Admin
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-[#1A1A1A]">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="admin">Admins Only</SelectItem>
                  <SelectItem value="user">Regular Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#FF8FAB] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">User</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Joined</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.user_id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF8FAB] to-[#FFD166] flex items-center justify-center text-white font-semibold">
                              {user.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="font-medium text-[#1A1A1A]">{user.name || "Unknown"}</p>
                              <p className="text-xs text-gray-400">ID: {user.user_id?.slice(-8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {user.is_admin ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                              <ShieldCheck className="w-4 h-4" />
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                              <Users className="w-4 h-4" />
                              User
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Calendar className="w-4 h-4" />
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleAdmin(user.user_id, user.is_admin)}
                              className={user.is_admin ? "border-red-200 text-red-600 hover:bg-red-50" : "border-purple-200 text-purple-600 hover:bg-purple-50"}
                              data-testid={`toggle-admin-${user.user_id}`}
                            >
                              {user.is_admin ? (
                                <>
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Remove Admin
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="w-4 h-4 mr-1" />
                                  Make Admin
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteUser(user.user_id, user.name)}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              data-testid={`delete-user-${user.user_id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </main>
      </div>

      {/* Add Admin Modal */}
      <Dialog open={showAddAdminModal} onOpenChange={setShowAddAdminModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#FF8FAB]" />
              Add New Admin
            </DialogTitle>
            <DialogDescription>
              Create a new admin account with email and password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAdmin} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <Input
                type="text"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                placeholder="Admin Name"
                data-testid="new-admin-name-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="pl-10"
                  data-testid="new-admin-email-input"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
              <Input
                type="text"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="Enter password (min 6 characters)"
                data-testid="new-admin-password-input"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Share this password with the admin for login
              </p>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddAdminModal(false);
                  setNewAdminEmail("");
                  setNewAdminPassword("");
                  setNewAdminName("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addingAdmin}
                className="bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white"
                data-testid="confirm-add-admin-btn"
              >
                {addingAdmin ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-1" />
                    Create Admin
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

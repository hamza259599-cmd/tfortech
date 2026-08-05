import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../App";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, googleLogin, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <h1 className="font-heading text-3xl font-bold text-[#1A1A1A] mb-2" data-testid="login-title">
                Welcome Back! 👋
              </h1>
              <p className="text-[#6B7280]">Login to your account</p>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@email.com"
                    className="pl-10 rounded-xl border-2 border-gray-200 focus:border-[#4CC9F0] h-12"
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="pl-10 pr-10 rounded-xl border-2 border-gray-200 focus:border-[#4CC9F0] h-12"
                    required
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A1A]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white rounded-full py-6 text-lg font-medium btn-hover-lift"
                data-testid="login-submit-btn"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            <p className="text-center mt-6 text-[#6B7280]">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#FF8FAB] hover:underline font-medium" data-testid="register-link">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

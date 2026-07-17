import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import { Button } from "../components/ui/button";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(!!sessionId);

  useEffect(() => {
    const pollPaymentStatus = async (attempts = 0) => {
      if (!sessionId || attempts >= 5) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API}/checkout/status/${sessionId}`);
        setPaymentStatus(response.data);
        
        if (response.data.payment_status === "paid") {
          setLoading(false);
          return;
        }
        
        // Continue polling
        setTimeout(() => pollPaymentStatus(attempts + 1), 2000);
      } catch (error) {
        console.error("Error checking payment status:", error);
        setLoading(false);
      }
    };

    if (sessionId) {
      pollPaymentStatus();
    }
  }, [sessionId]);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FF8FAB] border-t-transparent mx-auto mb-6"></div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-4">
                Verifying Payment...
              </h1>
              <p className="text-[#6B7280]">Please wait</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-[#06D6A0]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-[#06D6A0]" />
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-4" data-testid="success-title">
                Order Placed Successfully! 🎉
              </h1>

              <p className="text-[#6B7280] text-lg mb-8">
                Your order has been received. We will contact you soon.
              </p>

              {(orderId || paymentStatus) && (
                <div className="bg-[#FDFBF7] rounded-2xl p-6 mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Package className="w-6 h-6 text-[#FF8FAB]" />
                    <span className="font-heading font-semibold text-[#1A1A1A]">Order Details</span>
                  </div>
                  
                  {orderId && (
                    <p className="text-[#6B7280] mb-2">
                      Order ID: <span className="font-medium text-[#1A1A1A]">{orderId}</span>
                    </p>
                  )}
                  
                  {paymentStatus && (
                    <p className="text-[#6B7280]">
                      Payment Status: 
                      <span className={`font-medium ml-2 ${paymentStatus.payment_status === "paid" ? "text-[#06D6A0]" : "text-[#FFD166]"}`}>
                        {paymentStatus.payment_status === "paid" ? "Completed ✓" : "Pending"}
                      </span>
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/profile">
                  <Button 
                    variant="outline" 
                    className="rounded-full border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white px-8"
                    data-testid="view-orders-btn"
                  >
                    View Orders
                  </Button>
                </Link>
                <Link to="/products">
                  <Button 
                    className="bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white rounded-full px-8"
                    data-testid="continue-shopping-btn"
                  >
                    Continue Shopping
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

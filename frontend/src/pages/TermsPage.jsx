import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { FileText } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function TermsPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${API}/settings/content`);
        setContent(response.data);
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* SEO Meta Tags */}
      <SEO 
        title="Terms & Conditions - T For Tech"
        description="Read T For Tech Terms and Conditions. Learn about our policies for orders, shipping, returns, and use of our kids' e-commerce platform."
        url="/terms"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: 'var(--color-primary)'}}>
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
            Terms & Conditions
          </h1>
          <p className="text-gray-600">
            Last updated: January 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="prose prose-lg max-w-none">
            {(content?.terms_content || "").split('\n').map((paragraph, index) => (
              <p key={index} className="text-gray-700 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

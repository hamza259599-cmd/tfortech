import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { Info } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AboutPage() {
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
        title="About Us - GoJuniors Kids Store"
        description="Learn about GoJuniors, Pakistan's trusted online store for kids' clothes, toys, and educational items. Quality products with Cash on Delivery."
        url="/about"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: 'var(--color-primary)'}}>
            <Info className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
            {content?.about_title || "About Us"}
          </h1>
        </div>

        {/* Image */}
        {content?.about_image && (
          <div className="mb-8">
            <img 
              src={content.about_image} 
              alt="About Us"
              className="w-full h-64 sm:h-80 object-cover rounded-2xl shadow-lg"
            />
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="prose prose-lg max-w-none">
            {(content?.about_content || "").split('\n').map((paragraph, index) => (
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

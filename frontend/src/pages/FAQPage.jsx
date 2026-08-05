import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function FAQPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(0);

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

  const faqs = content?.faqs || [];

  if (loading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* SEO Meta Tags */}
      <SEO 
        title="FAQs - Frequently Asked Questions"
        description="Find answers to common questions about T For Tech products, shipping, returns, and Cash on Delivery. Get help with your kids' shopping needs."
        url="/faq"
      />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: 'var(--color-primary)'}}>
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 text-lg">
            Find answers to common questions about our products and services.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No FAQs available yet.</p>
            </div>
          ) : (
            faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-[#1A1A1A] pr-4">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
                  )}
                </button>
                
                {openIndex === index && (
                  <div className="px-6 pb-4">
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center bg-gray-50 rounded-2xl p-8">
          <h3 className="font-heading text-xl font-bold text-[#1A1A1A] mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-4">
            Can't find the answer you're looking for? Please contact us.
          </p>
          <a 
            href="/contact"
            className="inline-flex items-center px-6 py-3 rounded-xl text-white font-medium"
            style={{backgroundColor: 'var(--color-primary)'}}
          >
            Contact Us
          </a>
        </div>
      </div>
    </Layout>
  );
}

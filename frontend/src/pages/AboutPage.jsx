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

  const values = content?.about_values || [];
  const stats = content?.about_stats || [];
  const journey = content?.about_journey || [];

  return (
    <Layout>
      {/* SEO Meta Tags */}
      <SEO
        title="About Us - T For Tech"
        description="Learn about T For Tech, Pakistan's trusted online store for laptops, tech, and gadgets. Quality products with Cash on Delivery."
        url="/about"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-primary)' }}>
            <Info className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
            {content?.about_title || "About Us"}
          </h1>
        </div>

        {/* Main Image */}
        {content?.about_image && (
          <div className="mb-8">
            <img
              src={content.about_image}
              alt="About Us"
              className="w-full h-64 sm:h-80 object-cover rounded-2xl shadow-lg"
            />
          </div>
        )}

        {/* Intro Content */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-16">
          <div className="prose prose-lg max-w-none">
            {(content?.about_content || "").split('\n').filter(Boolean).map((paragraph, index) => (
              <p key={index} className="text-gray-700 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Our Story Section */}
        {(content?.about_story_title || content?.about_story_content || content?.about_story_image) && (
          <div className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              {content?.about_story_image && (
                <div className="order-2 md:order-1">
                  <img
                    src={content.about_story_image}
                    alt={content?.about_story_title || "Our Story"}
                    className="w-full h-64 sm:h-96 object-cover rounded-2xl shadow-lg"
                  />
                </div>
              )}
              <div className={content?.about_story_image ? "order-1 md:order-2" : ""}>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-4">
                  {content?.about_story_title || "Our Story"}
                </h2>
                <div className="w-16 h-1.5 rounded-full mb-6" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                {(content?.about_story_content || "").split('\n').filter(Boolean).map((paragraph, index) => (
                  <p key={index} className="text-gray-600 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Our Values Section */}
        {values.length > 0 && (
          <div className="mb-20">
            <div className="text-center mb-10">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-3">
                Our Values
              </h2>
              <div className="w-16 h-1.5 rounded-full mx-auto" style={{ backgroundColor: 'var(--color-primary)' }}></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow p-6 text-center border border-gray-100"
                >
                  <div className="text-4xl mb-4">{value.icon || "⭐"}</div>
                  <h3 className="font-heading text-lg font-bold text-[#1A1A1A] mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quality & Trust Section */}
        {(content?.about_quality_title || content?.about_quality_content || content?.about_quality_image1 || content?.about_quality_image2 || stats.length > 0) && (
          <div className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-12">
              <div>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-4">
                  {content?.about_quality_title || "Quality & Trust"}
                </h2>
                <div className="w-16 h-1.5 rounded-full mb-6" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                {(content?.about_quality_content || "").split('\n').filter(Boolean).map((paragraph, index) => (
                  <p key={index} className="text-gray-600 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
              {(content?.about_quality_image1 || content?.about_quality_image2) && (
                <div className="grid grid-cols-2 gap-4">
                  {content?.about_quality_image1 && (
                    <img
                      src={content.about_quality_image1}
                      alt="Quality 1"
                      className="w-full h-32 sm:h-52 object-cover rounded-2xl shadow-lg mt-8"
                    />
                  )}
                  {content?.about_quality_image2 && (
                    <img
                      src={content.about_quality_image2}
                      alt="Quality 2"
                      className="w-full h-32 sm:h-52 object-cover rounded-2xl shadow-lg"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Stats */}
            {stats.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white rounded-2xl shadow-sm p-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="font-heading text-3xl sm:text-4xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
                      {stat.number}
                    </p>
                    <p className="text-gray-500 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Our Journey Timeline */}
        {journey.length > 0 && (
          <div className="mb-8">
            <div className="text-center mb-10">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-3">
                Our Journey
              </h2>
              <div className="w-16 h-1.5 rounded-full mx-auto" style={{ backgroundColor: 'var(--color-primary)' }}></div>
            </div>

            <div className="relative">
              <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2"></div>
              <div className="space-y-8 sm:space-y-0">
                {journey.map((item, index) => (
                  <div
                    key={index}
                    className={`sm:flex items-center sm:gap-8 ${index % 2 === 0 ? "" : "sm:flex-row-reverse"}`}
                  >
                    <div className={`sm:w-1/2 ${index % 2 === 0 ? "sm:text-right" : "sm:text-left"}`}>
                      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 inline-block w-full sm:w-auto">
                        <p className="font-heading text-xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
                          {item.year}
                        </p>
                        <h3 className="font-heading text-lg font-bold text-[#1A1A1A] mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="hidden sm:flex w-4 h-4 rounded-full border-4 border-white shadow shrink-0 mx-auto" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                    <div className="hidden sm:block sm:w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

import { useEffect, useState } from "react";
import API from "../services/api";
import { formatDateDMY } from "../utils/dateFormat";

export default function Newsroom() {
  const [newsletters, setNewsletters] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        const { data } = await API.get("/newsletters");
        setNewsletters(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchNewsletters();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen px-6 py-12 md:px-16">
      <h2 className="text-3xl md:text-4xl font-bold text-[#253B7B] mb-8">Newsroom</h2>
      <div className="space-y-3">
        {newsletters.map((item) => {
          const isExpanded = expandedId === item._id;
          return (
            <article key={item._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">
                    {formatDateDMY(item.publishedAt || item.createdAt)}
                  </p>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">{item.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedId((prev) => (prev === item._id ? null : item._id))}
                  className="text-blue-700 hover:text-blue-900 text-sm font-medium self-start md:self-auto"
                >
                  {isExpanded ? "Hide" : "View more"}
                </button>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 p-5 space-y-4">
                  {item.coverImage && (
                    <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      <img
                        src={getOptimizedImageUrl(item.coverImage, 1280)}
                        srcSet={[
                          `${getOptimizedImageUrl(item.coverImage, 640)} 640w`,
                          `${getOptimizedImageUrl(item.coverImage, 960)} 960w`,
                          `${getOptimizedImageUrl(item.coverImage, 1280)} 1280w`,
                        ].join(", ")}
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 85vw, 1024px"
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-auto max-h-[72vh] object-contain"
                      />
                    </div>
                  )}
                  {item.summary && <p className="text-gray-700">{item.summary}</p>}
                  <p className="text-gray-800 whitespace-pre-wrap">{item.content}</p>
                </div>
              )}
            </article>
          );
        })}
      </div>
      {newsletters.length === 0 && (
        <p className="text-gray-600">No newsletters published yet.</p>
      )}
    </div>
  );
}

function getOptimizedImageUrl(url, width) {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto:best,c_limit,w_${width}/`);
}

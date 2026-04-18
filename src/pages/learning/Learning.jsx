import { useState, useEffect } from "react";
import { learningAPI, serviceAPI } from "../../services/api";

const LearningCard = ({ item, onToggle }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-purple-200 hover:shadow-sm transition">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        {/* ✅ item.title from services join, not item.service_name */}
        <h3 className="font-semibold text-gray-900">{item.title}</h3>
        <span className="inline-block mt-1 px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
          {item.category || "General"}
        </span>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.description}</p>
      </div>
      <button
        onClick={() => onToggle(item.id)}
        className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200"
      >
        ✓ Marked
      </button>
    </div>
    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
      <p className="text-xs text-purple-600 font-medium">
        📚 Status: {item.status || "interested"}
      </p>
    </div>
  </div>
);

const ServiceCard = ({ service, onMark }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-purple-200 hover:shadow-sm transition">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900">{service.title}</h3>
        <span className="inline-block mt-1 px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
          {service.category || "General"}
        </span>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{service.description}</p>
      </div>
      <button
        onClick={() => onMark(service.id)}
        className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-600"
      >
        + Mark
      </button>
    </div>
  </div>
);

export default function Learning() {
  const [myLearning, setMyLearning]   = useState([]); // services I want to learn
  const [allServices, setAllServices] = useState([]); // all available services
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("all"); // "all" | "my"
  const [search, setSearch]           = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [learnRes, svcRes] = await Promise.all([
        learningAPI.getMine(),   // ✅ GET /learning — my interests
        serviceAPI.getAll(),     // ✅ GET /services — all services
      ]);
      setMyLearning(learnRes.data.learning || []);
      setAllServices(svcRes.data.services || []);
    } catch (err) {
      console.error("Failed to fetch learning data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Mark a service as "want to learn"
  const handleMark = async (serviceId) => {
    try {
      await learningAPI.add({ service_id: serviceId });
      const res = await learningAPI.getMine();
      setMyLearning(res.data.learning || []);
    } catch (err) {
      console.error("Mark failed:", err.message);
    }
  };

  // ✅ Remove from learning list
  const handleToggle = async (serviceId) => {
    try {
      await learningAPI.remove(serviceId);
      setMyLearning(myLearning.filter((l) => l.service_id !== serviceId));
    } catch (err) {
      console.error("Remove failed:", err.message);
    }
  };

  // Services I haven't marked yet
  const myLearningIds = new Set(myLearning.map((l) => l.service_id));
  const unmarkedServices = allServices.filter((s) => !myLearningIds.has(s.id));

  const filteredMy = myLearning.filter(
    (s) =>
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAll = unmarkedServices.filter(
    (s) =>
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Learning Module</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Mark services you want to learn — help the firm know your growth goals.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-5">
        {[
          { key: "all", label: `All Services (${unmarkedServices.length})` },
          { key: "my",  label: `My List (${myLearning.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍  Search services..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-24 text-gray-400">Loading...</div>
      ) : activeTab === "my" ? (
        filteredMy.length === 0 ? (
          <div className="text-center py-24 text-gray-400 text-sm">
            You haven't marked any services yet. Browse 'All Services' to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMy.map((item) => (
              <LearningCard key={item.service_id} item={item} onToggle={handleToggle} />
            ))}
          </div>
        )
      ) : (
        filteredAll.length === 0 ? (
          <div className="text-center py-24 text-gray-400 text-sm">
            No services found.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAll.map((service) => (
              <ServiceCard key={service.id} service={service} onMark={handleMark} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
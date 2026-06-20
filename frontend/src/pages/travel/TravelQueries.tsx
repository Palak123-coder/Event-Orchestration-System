import { useState, useEffect } from "react";
import {
  MessageCircle,
  Clock,
  CheckCircle2,
  Plane,
  DollarSign,
  Building,
  Bus,
  ChevronRight,
  Shield,
  Headphones,
  Loader2
} from "lucide-react";
import { api } from "../../lib/api";
import TravelTabs from "./TravelTabs";

interface Query {
  id: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  conversation: {
    from: string;
    text: string;
    time: string;
    isUser: boolean;
  }[];
  created_at: string;
  updated_at: string;
}

export default function TravelQueries() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [newQuery, setNewQuery] = useState({
    category: "",
    subject: "",
    message: ""
  });

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/participant/travel/queries");
      console.log("📥 Fetched queries:", res.data.queries);
      const fetchedQueries = res.data.queries || [];
      setQueries(fetchedQueries);
      
      // Auto-select first query if none selected
      if (fetchedQueries.length > 0 && !activeQuery) {
        setActiveQuery(fetchedQueries[0].id);
      }
    } catch (err) {
      console.error("❌ Failed to fetch queries", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  // Refresh selected query when queries update
  useEffect(() => {
    if (activeQuery) {
      const updated = queries.find(q => q.id === activeQuery);
      if (updated) {
        console.log("🔄 Active query updated:", updated);
      }
    }
  }, [queries, activeQuery]);

  const submitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuery.category || !newQuery.subject || !newQuery.message) {
      alert("Please fill all fields");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/api/participant/travel/queries", newQuery);
      setNewQuery({ category: "", subject: "", message: "" });
      await fetchQueries();
      alert("Query submitted successfully!");
    } catch (err) {
      alert("Failed to submit query");
    } finally {
      setSubmitting(false);
    }
  };

  const activeQueryData = queries.find((q) => q.id === activeQuery);

  const getIcon = (category: string) => {
    if (category.includes("Airport") || category.includes("Transport")) return Plane;
    if (category.includes("Reimbursement")) return DollarSign;
    if (category.includes("Accommodation")) return Building;
    return Bus;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      Submitted: "bg-gray-100 text-gray-700",
      "Under Review": "bg-blue-100 text-blue-700",
      "Committee Replied": "bg-indigo-100 text-indigo-700",
      Resolved: "bg-green-100 text-green-700"
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const stats = [
    { icon: MessageCircle, label: "Total Queries", value: queries.length, color: "purple" },
    { icon: Clock, label: "Under Review", value: queries.filter((q) => q.status === "Under Review" || q.status === "Submitted").length, color: "blue" },
    { icon: MessageCircle, label: "Committee Replied", value: queries.filter((q) => q.status === "Committee Replied").length, color: "indigo" },
    { icon: CheckCircle2, label: "Resolved", value: queries.filter((q) => q.status === "Resolved").length, color: "green" }
  ];

  const emergencyContacts = [
    { icon: Shield, title: "Hackathon Committee", phone: "+91 80 1234 5678", available: "Available 24x7" },
    { icon: Bus, title: "Transport Desk", phone: "+91 80 8765 4321", available: "Available 24x7" },
    { icon: Building, title: "Hotel Front Desk", phone: "+91 80 2231 1234", available: "Available 24x7" }
  ];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  const getTimeline = (status: string) => {
    const steps = ["Submitted", "Under Review", "Committee Replied", "Resolved"];
    const currentIndex = steps.indexOf(status);
    return steps.map((step, index) => ({
      status: step,
      time: index === 0 && activeQueryData ? formatDate(activeQueryData.created_at) : "—",
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-500">Loading queries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <TravelTabs />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Travel Queries</h1>
        <p className="text-gray-600 mt-1">Raise your travel-related questions. The committee will review and respond.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stat.color === "purple"
                    ? "bg-purple-50"
                    : stat.color === "blue"
                    ? "bg-blue-50"
                    : stat.color === "indigo"
                    ? "bg-indigo-50"
                    : "bg-green-50"
                }`}
              >
                <stat.icon
                  className={`w-6 h-6 ${
                    stat.color === "purple"
                      ? "text-purple-600"
                      : stat.color === "blue"
                      ? "text-blue-600"
                      : stat.color === "indigo"
                      ? "text-indigo-600"
                      : "text-green-600"
                  }`}
                />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Raise a New Query */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-lg mb-4">Raise a New Query</h3>
            <form onSubmit={submitQuery} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Query Category</label>
                  <select
                    value={newQuery.category}
                    onChange={(e) => setNewQuery({ ...newQuery, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select category</option>
                    <option>Airport & Transport</option>
                    <option>Accommodation</option>
                    <option>Reimbursement</option>
                    <option>Food & Dietary</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="Enter a short subject"
                    value={newQuery.subject}
                    onChange={(e) => setNewQuery({ ...newQuery, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  placeholder="Describe your query in detail..."
                  rows={4}
                  value={newQuery.message}
                  onChange={(e) => setNewQuery({ ...newQuery, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                ></textarea>
                <p className="text-xs text-gray-500 mt-1 text-right">{newQuery.message.length}/1000</p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Query
                </button>
              </div>
            </form>
          </div>

          {/* My Queries */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">My Queries</h3>
              <span className="text-purple-700 text-sm font-medium flex items-center gap-1">
                {queries.length} total
                <ChevronRight size={16} />
              </span>
            </div>
            <div className="space-y-3">
              {queries.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No queries yet. Submit your first query above!</p>
              ) : (
                queries.map((query) => {
                  const Icon = getIcon(query.category);
                  return (
                    <div
                      key={query.id}
                      onClick={() => setActiveQuery(query.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition ${
                        activeQuery === query.id ? "border-purple-300 bg-purple-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            activeQuery === query.id ? "bg-purple-100" : "bg-gray-100"
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${activeQuery === query.id ? "text-purple-600" : "text-gray-600"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900 text-sm">{query.subject}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(query.status)}`}>
                              {query.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">{formatDate(query.created_at)}</p>
                          <p className="text-xs text-gray-600">{query.category}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Query Conversation */}
          {activeQueryData ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Query Conversation</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activeQueryData.status)}`}>
                  {activeQueryData.status}
                </span>
              </div>

              {/* Query Header */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h4 className="font-bold text-gray-900 mb-2">{activeQueryData.subject}</h4>
                <p className="text-xs text-gray-500">
                  Submitted on {formatDate(activeQueryData.created_at)} • Category: {activeQueryData.category}
                </p>
              </div>

              {/* Messages - Show ALL messages from conversation */}
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {activeQueryData.conversation && activeQueryData.conversation.length > 0 ? (
                  activeQueryData.conversation.map((msg, index) => (
                    <div key={index} className={msg.isUser ? "text-right" : "text-left"}>
                      <p className="text-xs font-medium text-gray-600 mb-1">{msg.from}</p>
                      <div
                        className={`inline-block p-3 rounded-xl text-left max-w-full ${
                          msg.isUser 
                            ? "bg-purple-100 text-gray-900" 
                            : "bg-indigo-50 text-gray-900 border border-indigo-200"
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(msg.time)}</p>
                    </div>
                  ))
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">i</span>
                    </div>
                    <p className="text-sm text-blue-800">
                      No conversation yet. The committee will respond to your query soon.
                    </p>
                  </div>
                )}
              </div>

              {/* Info Message */}
              {activeQueryData.status === "Submitted" && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-indigo-600 text-xs font-bold">i</span>
                  </div>
                  <p className="text-sm text-indigo-800">
                    Only the committee can reply to this query. You will be notified once they respond.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <p className="text-gray-500">Select a query to view the conversation</p>
            </div>
          )}

          {/* Query Status Timeline */}
          {activeQueryData && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-lg mb-6">Query Status Timeline</h3>
              <div className="flex items-start justify-between relative">
                {getTimeline(activeQueryData.status).map((step, index) => (
                  <div key={index} className="flex flex-col items-center flex-1 relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        step.current
                          ? "bg-purple-600 text-white"
                          : step.completed
                          ? "bg-purple-100 text-purple-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {step.status === "Submitted" ? (
                        <CheckCircle2 size={18} />
                      ) : step.status === "Under Review" ? (
                        <Clock size={18} />
                      ) : step.status === "Committee Replied" ? (
                        <MessageCircle size={18} />
                      ) : (
                        <CheckCircle2 size={18} />
                      )}
                    </div>
                    <p className={`text-xs font-semibold text-center ${step.completed ? "text-gray-900" : "text-gray-400"}`}>
                      {step.status}
                    </p>
                    <p className="text-xs text-gray-500 text-center mt-0.5">{step.time}</p>
                  </div>
                ))}

                {/* Connecting Lines */}
                <div className="absolute top-5 left-0 right-0 h-0.5 -z-0">
                  {getTimeline(activeQueryData.status).map((step, index, arr) => {
                    if (index === arr.length - 1) return null;
                    const nextStep = arr[index + 1];
                    const isCompleted = step.completed && nextStep.completed;
                    return (
                      <div
                        key={index}
                        className={`absolute h-0.5 ${isCompleted ? "bg-purple-600" : "bg-gray-300"}`}
                        style={{
                          left: `${(index / (arr.length - 1)) * 100}%`,
                          width: `${100 / (arr.length - 1)}%`
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contacts */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-lg mb-4">Emergency Contacts</h3>
            <p className="text-sm text-gray-600 mb-4">Reach out anytime in case of urgent travel or accommodation issues.</p>
            <div className="space-y-3">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <contact.icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{contact.title}</p>
                    <p className="text-xs text-gray-500">{contact.available}</p>
                  </div>
                  <a href={`tel:${contact.phone}`} className="text-sm font-bold text-purple-700 hover:text-purple-800">
                    {contact.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Need Help Section */}
      <div className="fixed bottom-6 left-6 w-64 bg-white rounded-xl border border-gray-200 p-5 shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
            <Headphones className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Need Help?</h4>
            <p className="text-xs text-gray-600">Our support team is here to help you 24/7.</p>
          </div>
        </div>
        <button className="w-full px-4 py-2 border border-purple-600 text-purple-700 font-medium rounded-lg hover:bg-purple-50 transition flex items-center justify-center gap-2">
          Contact Support
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
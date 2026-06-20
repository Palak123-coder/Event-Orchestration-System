import { useState, useEffect } from "react";
import {
  MessageCircle,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Eye,
  Send,
  Flag,
  ChevronLeft,
  ChevronRight,
  Plane,
  DollarSign,
  Building,
  Utensils,
  Bus,
  Bold,
  Italic,
  List,
  ListOrdered,
  X,
  Loader2
} from "lucide-react";
import { api } from "../../lib/api";

interface Query {
  id: string;
  participant_name: string;
  participant_initials: string;
  team_name: string;
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
}

export default function TravelManagement() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [filterStatus, setFilterStatus] = useState("All Status");

  // Fetch all queries from backend
  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/committee/travel/queries");
      const fetchedQueries = res.data.queries || [];
      setQueries(fetchedQueries);
      
      // Auto-select first query if none selected
      if (fetchedQueries.length > 0 && !selectedQuery) {
        setSelectedQuery(fetchedQueries[0]);
      }
    } catch (err) {
      console.error("Failed to fetch queries", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  // Refresh selected query data after changes
  useEffect(() => {
    if (selectedQuery) {
      const updated = queries.find(q => q.id === selectedQuery.id);
      if (updated) setSelectedQuery(updated);
    }
  }, [queries]);

  // Handle Send Reply
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedQuery) return;
    try {
      setSending(true);
      await api.post(`/api/committee/travel/queries/${selectedQuery.id}/reply`, {
        reply_text: replyText
      });
      setReplyText("");
      await fetchQueries();
    } catch (err) {
      console.error("Failed to send reply", err);
      alert("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  // Handle Mark Resolved
  const handleMarkResolved = async () => {
    if (!selectedQuery) return;
    try {
      await api.patch(`/api/committee/travel/queries/${selectedQuery.id}/status`, {
        status: "Resolved"
      });
      await fetchQueries();
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status");
    }
  };

  // Handle Escalate
  const handleEscalate = async () => {
    alert("Query escalated to senior committee member");
  };

  // Dynamic Stats
  const stats = [
    { icon: MessageCircle, label: "Total Queries", value: queries.length, sublabel: "All time", color: "purple" },
    { icon: MessageCircle, label: "Open", value: queries.filter(q => q.status === "Open").length, sublabel: "Require attention", color: "orange" },
    { icon: Clock, label: "Awaiting Response", value: queries.filter(q => q.status === "Awaiting Response").length, sublabel: "Participant replied", color: "blue" },
    { icon: CheckCircle2, label: "Resolved", value: queries.filter(q => q.status === "Resolved").length, sublabel: "This event", color: "green" },
  ];

  // Filtered queries
  const filteredQueries = queries.filter(q => {
    const matchesSearch = searchTerm === "" || 
      q.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All Categories" || q.category === filterCategory;
    const matchesStatus = filterStatus === "All Status" || q.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-orange-50 text-orange-700 border border-orange-200";
      case "Awaiting Response": return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Resolved": return "bg-green-50 text-green-700 border border-green-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes("Airport") || category.includes("Transport") || category.includes("Pickup")) return Plane;
    if (category.includes("Reimbursement")) return DollarSign;
    if (category.includes("Hotel") || category.includes("Accommodation")) return Building;
    if (category.includes("Food") || category.includes("Dietary")) return Utensils;
    if (category.includes("Shuttle") || category.includes("Bus")) return Bus;
    return MessageCircle;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Travel Queries Management</h1>
        <p className="text-gray-600 mt-1">View participant travel-related queries and provide timely responses.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                stat.color === "purple" ? "bg-purple-50" :
                stat.color === "orange" ? "bg-orange-50" :
                stat.color === "blue" ? "bg-blue-50" : "bg-green-50"
              }`}>
                <stat.icon className={`w-6 h-6 ${
                  stat.color === "purple" ? "text-purple-600" :
                  stat.color === "orange" ? "text-orange-600" :
                  stat.color === "blue" ? "text-blue-600" : "text-green-600"
                }`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm font-medium text-gray-900">{stat.label}</p>
                <p className="text-xs text-gray-500">{stat.sublabel}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: All Travel Queries Table */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">All Travel Queries</h3>
            
            {/* Filters */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by participant, team, subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option>All Categories</option>
                <option>Airport & Transport</option>
                <option>Accommodation</option>
                <option>Reimbursement</option>
                <option>Food & Dietary</option>
                <option>Other</option>
              </select>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option>All Status</option>
                <option>Open</option>
                <option>Awaiting Response</option>
                <option>Resolved</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-medium">Participant / Team</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Subject</th>
                  <th className="p-4 font-medium">Submitted</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQueries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No queries found.
                    </td>
                  </tr>
                ) : (
                  filteredQueries.map((query) => {
                    const CategoryIcon = getCategoryIcon(query.category);
                    return (
                      <tr
                        key={query.id}
                        onClick={() => setSelectedQuery(query)}
                        className={`hover:bg-gray-50 transition cursor-pointer ${
                          selectedQuery?.id === query.id ? "bg-purple-50 border-l-4 border-l-purple-600" : ""
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                              {query.participant_initials}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{query.participant_name}</p>
                              <p className="text-xs text-gray-500">{query.team_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <CategoryIcon size={16} className="text-gray-600" />
                            <span className="text-gray-700 text-sm">{query.category}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-700 text-sm max-w-[200px] truncate">{query.subject}</td>
                        <td className="p-4 text-gray-600 text-xs">{formatDate(query.created_at)}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(query.status)}`}>
                            {query.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredQueries.length} of {queries.length} entries
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded hover:bg-gray-50 text-sm"><ChevronLeft size={16} /></button>
              <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm">1</button>
              <button className="px-3 py-1 border rounded hover:bg-gray-50 text-sm"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        {/* Right: Query Detail Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-gray-900">Query Detail</h3>
            {selectedQuery && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedQuery.status)}`}>
                {selectedQuery.status}
              </span>
            )}
          </div>

          {selectedQuery ? (
            <>
              {/* User Info */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                    {selectedQuery.participant_initials}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{selectedQuery.participant_name}</p>
                    <p className="text-xs text-gray-500">{selectedQuery.team_name}</p>
                  </div>
                </div>
              </div>

              {/* Category & Submitted */}
              <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Plane size={12} /> Category
                  </p>
                  <p className="text-sm font-medium text-gray-900">{selectedQuery.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Clock size={12} /> Submitted
                  </p>
                  <p className="text-sm font-medium text-gray-900 text-xs">{formatDate(selectedQuery.created_at)}</p>
                </div>
              </div>

              {/* Conversation History */}
              {selectedQuery.conversation && selectedQuery.conversation.length > 0 && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-3">Response History</p>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedQuery.conversation.map((msg, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          msg.isUser 
                            ? "bg-blue-100 text-blue-700" 
                            : "bg-purple-100 text-purple-700"
                        }`}>
                          {msg.isUser ? "P" : "C"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {msg.isUser ? selectedQuery.participant_name : "Committee (You)"}
                            </p>
                            {!msg.isUser && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                Committee
                              </span>
                            )}
                            <span className="text-xs text-gray-500 ml-auto">
                              {formatDate(msg.time)}
                            </span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border border-gray-200">
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Your Reply */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-700 mb-2">Your Reply</p>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply to the participant..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-2"
                ></textarea>
                
                {/* Formatting Toolbar */}
                <div className="flex items-center gap-1 p-2 border border-gray-200 rounded-lg mb-3">
                  <button className="p-1.5 hover:bg-gray-100 rounded"><Bold size={14} /></button>
                  <button className="p-1.5 hover:bg-gray-100 rounded"><Italic size={14} /></button>
                  <button className="p-1.5 hover:bg-gray-100 rounded"><List size={14} /></button>
                  <button className="p-1.5 hover:bg-gray-100 rounded"><ListOrdered size={14} /></button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button 
                    onClick={handleSendReply}
                    disabled={sending || !replyText.trim()}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Send Reply
                  </button>
                  <button 
                    onClick={handleMarkResolved}
                    disabled={selectedQuery.status === "Resolved"}
                    className="px-3 py-2 border border-green-300 text-green-700 font-medium rounded-lg hover:bg-green-50 transition flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 size={16} />
                    Mark Resolved
                  </button>
                  <button 
                    onClick={handleEscalate}
                    className="px-3 py-2 border border-orange-300 text-orange-700 font-medium rounded-lg hover:bg-orange-50 transition flex items-center gap-2 text-sm"
                  >
                    <Flag size={16} />
                    Escalate
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Select a query to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
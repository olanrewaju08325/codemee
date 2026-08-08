import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, DollarSign, Activity, Zap, Download } from "lucide-react";
import { Card } from "../../components/ui/Card";
import apiClient, { API_BASE_URL } from "../../apiClient";

export const AdminAnalyticsDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const stats = await apiClient.analytics.getAdminAnalytics();
        setData(stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExport = async (type: string) => {
    setExporting(true);
    try {
      // In production, we can use the backend authenticatedFetch wrapper logic to download blob,
      // but for MVP we construct a tokenized URL or fetch and parse blob
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/analytics/export?type=${type}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_export_${type}.csv`;
      a.click();
    } catch (err) {
      console.error(err);
      alert("Failed to export.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading analytics...</div>;
  if (!data) return <div style={{ padding: 24 }}>No data available.</div>;

  const { platform_overview, financial_dashboard, ai_analytics } = data;

  // Mock trend data removed as per DO NOT FABRICATE STATISTICS rule
  const revenueData: any[] = [];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Executive Analytics</h2>
        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            onClick={() => handleExport("revenue")} 
            disabled={exporting}
            className="btn btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Download size={16} /> Export Revenue (CSV)
          </button>
          <button 
            onClick={() => handleExport("students")} 
            disabled={exporting}
            className="btn btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Download size={16} /> Export Enrollment (CSV)
          </button>
        </div>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <Card style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Users color="var(--primary)" size={24} />
            <div>
              <h4 style={{ margin: 0, color: "var(--text-secondary)", fontSize: 12 }}>Total Students</h4>
              <p style={{ margin: 0, fontSize: 24, fontWeight: "bold" }}>{platform_overview.total_students}</p>
            </div>
          </div>
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Activity color="#10B981" size={24} />
            <div>
              <h4 style={{ margin: 0, color: "var(--text-secondary)", fontSize: 12 }}>Active Enrollments</h4>
              <p style={{ margin: 0, fontSize: 24, fontWeight: "bold" }}>{platform_overview.active_enrollments}</p>
            </div>
          </div>
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <DollarSign color="#F59E0B" size={24} />
            <div>
              <h4 style={{ margin: 0, color: "var(--text-secondary)", fontSize: 12 }}>Total Revenue</h4>
              <p style={{ margin: 0, fontSize: 24, fontWeight: "bold" }}>${financial_dashboard.total_revenue}</p>
            </div>
          </div>
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Zap color="#8B5CF6" size={24} />
            <div>
              <h4 style={{ margin: 0, color: "var(--text-secondary)", fontSize: 12 }}>Total AI Requests</h4>
              <p style={{ margin: 0, fontSize: 24, fontWeight: "bold" }}>{ai_analytics.total_chat_requests}</p>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
        <Card style={{ padding: 24 }}>
          <h3>Revenue Growth (YTD)</h3>
          <div style={{ height: 400, marginTop: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#F59E0B" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

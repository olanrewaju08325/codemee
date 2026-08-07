import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BookOpen, Award, CheckCircle, Zap } from "lucide-react";
import { Card } from "../../components/ui/Card";
import apiClient from "../../apiClient";

export const StudentAnalyticsDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const stats = await apiClient.analytics.getStudentAnalytics();
        setData(stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading analytics...</div>;
  if (!data) return <div style={{ padding: 24 }}>No data available.</div>;

  const { learning_progress, quiz_analytics, personal_productivity } = data;
  const pieData = [
    { name: "Completed", value: learning_progress.completed_courses },
    { name: "In Progress", value: learning_progress.total_enrolled - learning_progress.completed_courses }
  ];
  const COLORS = ["#10B981", "#3B82F6"];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
      <h2>Personal Learning Analytics</h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <Card style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <BookOpen color="var(--primary)" size={24} />
            <div>
              <h4 style={{ margin: 0, color: "var(--text-secondary)", fontSize: 12 }}>Courses Enrolled</h4>
              <p style={{ margin: 0, fontSize: 24, fontWeight: "bold" }}>{learning_progress.total_enrolled}</p>
            </div>
          </div>
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <CheckCircle color="#10B981" size={24} />
            <div>
              <h4 style={{ margin: 0, color: "var(--text-secondary)", fontSize: 12 }}>Lessons Completed</h4>
              <p style={{ margin: 0, fontSize: 24, fontWeight: "bold" }}>{learning_progress.completed_lessons}</p>
            </div>
          </div>
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Award color="#F59E0B" size={24} />
            <div>
              <h4 style={{ margin: 0, color: "var(--text-secondary)", fontSize: 12 }}>Average Quiz Score</h4>
              <p style={{ margin: 0, fontSize: 24, fontWeight: "bold" }}>{quiz_analytics.avg_score}%</p>
            </div>
          </div>
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Zap color="#8B5CF6" size={24} />
            <div>
              <h4 style={{ margin: 0, color: "var(--text-secondary)", fontSize: 12 }}>AI Sessions</h4>
              <p style={{ margin: 0, fontSize: 24, fontWeight: "bold" }}>{personal_productivity.ai_sessions}</p>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <Card style={{ padding: 24 }}>
          <h3>Recent Quiz Performance</h3>
          <div style={{ height: 300, marginTop: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={quiz_analytics.recent_trend.reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" tickFormatter={(t) => new Date(t).toLocaleDateString()} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card style={{ padding: 24 }}>
          <h3>Course Completion Overview</h3>
          <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            Overall Completion: <strong>{learning_progress.overall_completion.toFixed(1)}%</strong>
          </div>
        </Card>
      </div>
    </div>
  );
};

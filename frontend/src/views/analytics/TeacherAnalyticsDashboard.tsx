import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, BookOpen, CheckSquare, Zap } from "lucide-react";
import { Card } from "../../components/ui/Card";
import apiClient from "../../apiClient";

export const TeacherAnalyticsDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const stats = await apiClient.analytics.getTeacherAnalytics();
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

  const { overview, course_performance } = data;

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
      <h2>Teacher Analytics Dashboard</h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <Card style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Users color="var(--primary)" size={24} />
            <div>
              <h4 style={{ margin: 0, color: "var(--text-secondary)", fontSize: 12 }}>Total Students</h4>
              <p style={{ margin: 0, fontSize: 24, fontWeight: "bold" }}>{overview.total_students}</p>
            </div>
          </div>
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <BookOpen color="#10B981" size={24} />
            <div>
              <h4 style={{ margin: 0, color: "var(--text-secondary)", fontSize: 12 }}>Active Courses</h4>
              <p style={{ margin: 0, fontSize: 24, fontWeight: "bold" }}>{overview.total_courses}</p>
            </div>
          </div>
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Zap color="#F59E0B" size={24} />
            <div>
              <h4 style={{ margin: 0, color: "var(--text-secondary)", fontSize: 12 }}>Avg Quiz Score</h4>
              <p style={{ margin: 0, fontSize: 24, fontWeight: "bold" }}>{overview.avg_quiz_score}%</p>
            </div>
          </div>
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <CheckSquare color="#8B5CF6" size={24} />
            <div>
              <h4 style={{ margin: 0, color: "var(--text-secondary)", fontSize: 12 }}>Assignments Submitted</h4>
              <p style={{ margin: 0, fontSize: 24, fontWeight: "bold" }}>{overview.total_submissions}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card style={{ padding: 24 }}>
        <h3>Enrollments per Course</h3>
        <div style={{ height: 350, marginTop: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={course_performance}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="students" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

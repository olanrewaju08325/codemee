import { useState, useEffect } from "react";
import { Search, Edit, Ban } from "lucide-react";
import apiClient from "../../apiClient";

export const UserManagementTable = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiClient.admin.getUsers();
        if (data) {
          setUsers(data);
        }
      } catch (e) {
        console.error("Failed to fetch users", e);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  return (
    <div className="bg-[var(--surface-dark)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface)]">
        <h3 className="font-bold">User Directory</h3>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[var(--color-blue)]"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="p-8 text-center text-[var(--muted)]">Loading directory...</div>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="text-[var(--muted)] bg-[var(--surface)] uppercase border-b border-[var(--border)]">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[var(--border)] hover:bg-[var(--surface)]">
                <td className="px-6 py-4 font-medium">{u.full_name}</td>
                <td className="px-6 py-4 text-[var(--muted)]">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${u.role === "admin" ? "bg-red-500/10 text-red-400" : u.role === "teacher" ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[var(--muted)] hover:text-white p-1"><Edit size={16}/></button>
                  <button className="text-[var(--muted)] hover:text-red-400 p-1"><Ban size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};


import React, { useState, useEffect } from "react";
import { apiClient } from "../../api/client";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Zap, TrendingUp } from "lucide-react";

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export default function TokenUsageStats() {
  const [userStats, setUserStats] = useState([]);
  const [operationStats, setOperationStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const logs = await apiClient.entities.TokenUsageLog.list("-created_date", 1000);

      // Calculate per-user usage
      const userMap = {};
      const opMap = {};

      logs.forEach((log) => {
        userMap[log.user_email] = (userMap[log.user_email] || 0) + log.tokens_used;
        opMap[log.operation] = (opMap[log.operation] || 0) + log.tokens_used;
      });

      setUserStats(
        Object.entries(userMap)
          .map(([email, tokens]) => ({ email, tokens }))
          .sort((a, b) => b.tokens - a.tokens)
      );

      setOperationStats(
        Object.entries(opMap).map(([operation, tokens]) => ({ operation, tokens }))
      );

      setLoading(false);
    };

    loadStats();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const totalTokens = userStats.reduce((sum, u) => sum + u.tokens, 0);

  return (
    <div className="space-y-6">
      {/* Total tokens card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Tokens Used</CardTitle>
          <Zap className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalTokens.toLocaleString()}</p>
        </CardContent>
      </Card>

      {/* Per-user breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Token Usage by User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="email" angle={-45} textAnchor="end" height={80} fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tokens" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* By operation */}
      <Card>
        <CardHeader>
          <CardTitle>Token Usage by Operation</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={operationStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ operation, tokens }) => `${operation}: ${tokens}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="tokens"
              >
                {operationStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed User Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-3">Email</th>
                  <th className="text-right py-2 px-3">Tokens Used</th>
                  <th className="text-right py-2 px-3">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {userStats.map((user) => (
                  <tr key={user.email} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-3">{user.email}</td>
                    <td className="text-right py-2 px-3 font-medium">{user.tokens.toLocaleString()}</td>
                    <td className="text-right py-2 px-3 text-muted-foreground">
                      {((user.tokens / totalTokens) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

interface AccessRule {
  id: string;
  username: string;
  documentId: number;
  expiresAt: string | null;
  createdAt: string;
  createdBy: string;
}

export default function AccessAdminPage() {
  const [rules, setRules] = useState<AccessRule[]>([]);
  const [username, setUsername] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadRules() {
    const res = await fetch("/api/access");
    const data = await res.json();
    if (!res.ok || !data.success) {
      setError(data.message || "Failed to load rules.");
    } else {
      setRules(data.data);
    }
  }

  useEffect(() => {
    loadRules();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          documentId: Number(documentId),
          expiresAt: expiresAt || null,
          createdBy: "admin",
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to create rule.");
      } else {
        setUsername("");
        setDocumentId("");
        setExpiresAt("");
        await loadRules();
      }
    } catch (err) {
      console.error(err);
      setError("Unexpected error creating rule.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    const res = await fetch(`/api/access/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setError(data.message || "Failed to delete rule.");
    } else {
      await loadRules();
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Temporary Access Rules</h1>

      <form
        onSubmit={handleCreate}
        className="bg-white border rounded p-4 shadow-md max-w-xl mb-6 flex flex-col gap-3"
      >
        <h2 className="text-lg font-semibold mb-1">Create new rule</h2>

        <input
          className="border rounded p-2"
          placeholder="Username (ex: test)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="border rounded p-2"
          placeholder="Document ID (ex: 1)"
          value={documentId}
          onChange={(e) => setDocumentId(e.target.value)}
        />

        <input
          className="border rounded p-2"
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="self-start bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Add rule"}
        </button>
      </form>

      <h2 className="text-lg font-semibold mb-2">Existing rules</h2>
      {rules.length === 0 ? (
        <p>No rules yet.</p>
      ) : (
        <table className="bg-white border rounded shadow-md min-w-[600px]">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-2 border-r">ID</th>
              <th className="p-2 border-r">Username</th>
              <th className="p-2 border-r">Document ID</th>
              <th className="p-2 border-r">Expires At</th>
              <th className="p-2 border-r">Created At</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-2 border-r">{r.id}</td>
                <td className="p-2 border-r">{r.username}</td>
                <td className="p-2 border-r">{r.documentId}</td>
                <td className="p-2 border-r">
                  {r.expiresAt ?? "No expiry"}
                </td>
                <td className="p-2 border-r">{r.createdAt}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-sm text-red-600 underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

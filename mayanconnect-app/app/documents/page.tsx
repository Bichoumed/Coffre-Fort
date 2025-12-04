"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  username: string;
  role?: string;
}

interface MayanDocument {
  id: number;
  label: string;
  uuid: string;
  url: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [docs, setDocs] = useState<MayanDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  // Check "session"
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("mayanconnect_token");
    const userStr = localStorage.getItem("mayanconnect_user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
    } catch {
      router.push("/login");
    }
  }, [router]);

  // Fetch documents from our API
  useEffect(() => {
    if (!user) return;

    async function fetchDocs() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/documents");
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.message || "Failed to load documents.");
          return;
        }

        // Mayan returns: { count, next, previous, results: [...] }
        setDocs(data.data.results || []);
      } catch (err) {
        console.error(err);
        setError("Unexpected error while loading documents.");
      } finally {
        setLoading(false);
      }
    }

    fetchDocs();
  }, [user]);

  if (!user) {
    return <div className="p-8">Checking session...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Documents</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">
            Logged in as <strong>{user.username}</strong>
          </span>
          <button
            className="text-sm text-red-600 underline"
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("mayanconnect_token");
                localStorage.removeItem("mayanconnect_user");
              }
              router.push("/login");
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {loading && <p>Loading documents from Mayan...</p>}
      {error && (
        <p className="text-red-600 mb-4">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          {docs.length === 0 ? (
            <p>No documents found in Mayan.</p>
          ) : (
            <table className="min-w-full bg-white border rounded shadow-md">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="text-left p-2 border-r">ID</th>
                  <th className="text-left p-2 border-r">Label</th>
                  <th className="text-left p-2">UUID</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                <tr key={doc.id} className="border-b hover:bg-gray-100 cursor-pointer"
                onClick={() => router.push(`/documents/${doc.id}`)}>
                    <td className="p-2 border-r">{doc.id}</td>
                    <td className="p-2 border-r">{doc.label}</td>
                    <td className="p-2 font-mono text-xs">{doc.uuid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

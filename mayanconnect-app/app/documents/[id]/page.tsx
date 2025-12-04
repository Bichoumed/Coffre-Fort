// app/documents/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function DocumentDetailsPage() {
  const router = useRouter();
  const pathname = usePathname();

  // 🔍 Extract id from the URL: /documents/1 -> "1"
  const segments = pathname.split("/").filter(Boolean);
  const id = segments[segments.length - 1]; // last segment

  const [doc, setDoc] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(
    null
  );

  // 🧑 Load user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("mayanconnect_user");
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch {
        // ignore parsing errors
      }
    }
  }, []);

  // Debug helper
  useEffect(() => {
    console.log("DEBUG pathname:", pathname);
    console.log("DEBUG extracted id:", id);
    console.log("DEBUG currentUser:", currentUser);
  }, [pathname, id, currentUser]);

  // 🔁 Load document when id + user are ready
  useEffect(() => {
    if (!id) return;
    if (!currentUser) return;

    async function loadDocument() {
      setLoading(true);
      setError(null);

      try {
        const username = currentUser?.username ?? "anonymous";

        const res = await fetch(`/api/documents/${id}`, {
          headers: {
            "x-username": username,
          },
        });

        const json = await res.json();

        if (!json.success) {
          setError(json.message || "Error fetching document");
        } else {
          setDoc(json.data);
        }
      } catch (err) {
        console.error(err);
        setError("Unexpected error loading document");
      } finally {
        setLoading(false);
      }
    }

    loadDocument();
  }, [id, currentUser]);

  // ⬇️ Download latest file
async function handleDownload() {
  if (!doc || !currentUser) return;

  try {
    const res = await fetch(`/api/documents/${doc.id}/download`, {
      headers: {
        "x-username": currentUser.username,
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Download failed:", res.status, text);
      alert("Download failed (see console for details).");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    const safeName = (doc.label || `document-${doc.id}`).replace(
      /[^\w\-\.]+/g,
      "_"
    );
    a.download = safeName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Unexpected error during download:", err);
    alert("Unexpected error while downloading the file.");
  }
}



  // 👉 Only complain if we truly couldn't find an id in the URL
  if (!id) {
    return <div className="p-6 text-red-600">Invalid document id.</div>;
  }

  if (loading) return <div className="p-6">Loading document...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <button
        onClick={() => router.push("/documents")}
        className="text-blue-600 underline mb-4"
      >
        ← Back to documents
      </button>

      <h1 className="text-2xl font-bold mb-4">Document: {doc?.label}</h1>

      <div className="bg-white border rounded p-4 shadow-md">
        <p>
          <strong>ID:</strong> {doc.id}
        </p>
        <p>
          <strong>UUID:</strong> {doc.uuid}
        </p>
        <p>
          <strong>Created:</strong> {doc.datetime_created}</p>
        <p>
          <strong>Latest file:</strong> {doc.latest_file}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {/* Download latest file */}
        <button
          onClick={handleDownload}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Download latest file
        </button>

        {/* AI Summary */}
        <button
          onClick={async () => {
            if (!doc) return;

            setSummary(null);
            setSummaryError(null);
            setSummaryLoading(true);

            try {
              const res = await fetch("/api/ai/summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  documentId: doc.id,
                  label: doc.label,
                  uuid: doc.uuid,
                }),
              });

              const data = await res.json();

              if (!res.ok || !data.success) {
                setSummaryError(
                  data.message || "Failed to generate summary."
                );
              } else {
                setSummary(data.summary);
              }
            } catch (err) {
              console.error(err);
              setSummaryError("Unexpected error during AI summary.");
            } finally {
              setSummaryLoading(false);
            }
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          disabled={summaryLoading}
        >
          {summaryLoading ? "Summarizing..." : "Summarize with AI"}
        </button>
      </div>

      {summaryError && (
        <p className="mt-3 text-red-600 text-sm">{summaryError}</p>
      )}

      {summary && (
        <div className="mt-4 bg-white border rounded p-4 shadow-md max-w-2xl whitespace-pre-line">
          <h2 className="text-lg font-semibold mb-2">
            AI Summary (mock for now)
          </h2>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { databases } from "@/models/client/config";
import { db, questionCollection } from "@/models/name";

const Page = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const userId = params.userId as string;
  const questionId = searchParams.get("questionId");

  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const fetchQuestion = async () => {
      try {
        if (!questionId) {
          setError("No question selected");
          return;
        }

        const data = await databases.getDocument(
          db,
          questionCollection,
          questionId,
        );

        if (data.authorId !== userId) {
          setError("Unauthorized");
          return;
        }

        setTitle(data.title);
        setContent(data.content);
      } catch (err) {
        console.error(err);
        setError("Failed to load question");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content) {
      setError("All fields required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await databases.updateDocument(db, questionCollection, questionId!, {
        title,
        content,
      });

      router.push(`/users/${userId}/${params.userSlug}`);
    } catch {
      setError("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="mt-6 text-gray-400">Loading editor...</p>;
  }

  return (
    <div className="mt-8 max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">Edit Question</h2>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border border-gray-700 rounded"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full p-2 border border-gray-700 rounded"
        />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-white text-black rounded"
          >
            {saving ? "Updating..." : "Update"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-600 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default Page;

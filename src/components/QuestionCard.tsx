"use client";

import React from "react";
import { BorderBeam } from "./magicui/border-beam";
import Link from "next/link";
import { Models } from "appwrite";
import slugify from "@/utils/slugify";
import convertDateToRelativeTime from "@/utils/relativeTime";
import { useAuthStore } from "@/store/Auth";
import { IconTrash, IconX } from "@tabler/icons-react";
import { databases } from "@/models/client/config";
import { db, questionCollection } from "@/models/name";
import { useRouter } from "next/navigation";

const QuestionCard = ({ ques }: { ques: Models.Document }) => {
  const [height, setHeight] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [error, setError] = React.useState("");
  const ref = React.useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const router = useRouter();

  React.useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.clientHeight);
    }
  }, []);

  const tags =
    typeof ques.tags === "string"
      ? ques.tags.split(",").filter((t: string) => t.trim().length > 0)
      : ques.tags || [];

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(ques.author?.name || "User")}&background=random&size=40`;

  const isAuthor = user?.$id === ques.author?.$id;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");
    try {
      await databases.deleteDocument(db, questionCollection, ques.$id);
      setShowDeleteModal(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete question:", error);
      setError("Failed to delete question. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        ref={ref}
        className="group relative flex gap-6 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20 hover:bg-white/10"
      >
        <BorderBeam size={height} duration={12} delay={9} />

        {isAuthor && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="absolute right-4 top-4 z-10 rounded-lg bg-red-500/10 p-2 text-red-500 transition-all hover:bg-red-500/20"
            title="Delete question"
          >
            <IconTrash className="h-4 w-4" />
          </button>
        )}

        <div className="flex shrink-0 flex-col gap-3 text-center text-sm">
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-white">
              {ques.totalVotes || 0}
            </span>
            <span className="text-xs text-gray-400">votes</span>
          </div>
          <div className="flex flex-col">
            <span
              className={`text-lg font-semibold ${
                (ques.totalAnswers || 0) > 0 ? "text-green-500" : "text-white"
              }`}
            >
              {ques.totalAnswers || 0}
            </span>
            <span className="text-xs text-gray-400">answers</span>
          </div>
        </div>

        <div className="flex-1">
          <Link
            href={`/questions/${ques.$id}/${slugify(ques.title)}`}
            className="group/title"
          >
            <h2 className="mb-3 text-xl font-semibold text-orange-500 transition-colors group-hover/title:text-orange-400">
              {ques.title}
            </h2>
          </Link>

          {tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/questions?tag=${tag}`}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300 transition-colors hover:bg-white/20"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <img
              src={avatarUrl}
              alt={ques.author?.name || "User"}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/users/${ques.author?.$id}/${slugify(ques.author?.name || "")}`}
                className="font-medium text-orange-500 transition-colors hover:text-orange-400"
              >
                {ques.author?.name}
              </Link>
              <span className="text-xs text-gray-400">
                <span className="font-semibold text-white">
                  {ques.author?.reputation ?? 0}
                </span>{" "}
                reputation
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">
                asked {convertDateToRelativeTime(new Date(ques.$createdAt))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-xl border border-white/20 bg-zinc-900 p-6 shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <IconX className="h-5 w-5" />
            </button>
            <h3 className="mb-2 text-xl font-bold text-white">
              Delete Question
            </h3>
            <p className="mb-6 text-gray-400">
              Are you sure you want to delete "{ques.title}"? This action cannot
              be undone.
            </p>

            {error && (
              <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
                {error}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-2 font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuestionCard;

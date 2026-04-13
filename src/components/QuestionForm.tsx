"use client";

import RTE from "@/components/RTE";
import { Meteors } from "@/components/magicui/meteors";
import { ConfettiButton } from "@/components/magicui/confetti";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/Auth";
import { cn } from "@/lib/utils";
import slugify from "@/utils/slugify";
import { IconX } from "@tabler/icons-react";
import { Models, ID } from "appwrite";
import { useRouter } from "next/navigation";
import React from "react";
import { databases, storage } from "@/models/client/config";
import {
  db,
  questionAttachmentBucket,
  questionCollection,
} from "@/models/name";


type Question = Models.Document & {
  title: string;
  content: string;
  tags: string[] | string;
  attachmentId: string;
  authorId: string;
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col space-y-2 overflow-hidden rounded-xl border border-white/20 bg-slate-950 p-4",
        className,
      )}
    >
      <Meteors number={30} />
      {children}
    </div>
  );
};

const QuestionForm = ({ question }: { question?: Question }) => {
  const { user } = useAuthStore();
  const [tag, setTag] = React.useState("");
  const router = useRouter();

  const [formData, setFormData] = React.useState({
    title: String(question?.title || ""),
    content: String(question?.content || ""),
    authorId: user?.$id,
    tags: new Set(
      typeof question?.tags === "string"
        ? question.tags.split(",")
        : question?.tags || [],
    ),
    attachment: null as File | null,
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const create = async () => {
    if (!formData.attachment) throw new Error("Please upload an image");

    const storageResponse = await storage.createFile(
      questionAttachmentBucket,
      ID.unique(),
      formData.attachment,
    );

    const response = await databases.createDocument(
      db,
      questionCollection,
      ID.unique(),
      {
        title: formData.title,
        content: formData.content,
        authorId: formData.authorId,
        tags: Array.from(formData.tags).join(","),
        attachmentId: storageResponse.$id,
      },
    );

    return response;
  };

  const update = async () => {
    if (!question) throw new Error("Please provide a question");

    const attachmentId = await (async () => {
      if (!formData.attachment) return question.attachmentId;

      await storage.deleteFile(questionAttachmentBucket, question.attachmentId);

      const file = await storage.createFile(
        questionAttachmentBucket,
        ID.unique(),
        formData.attachment,
      );

      return file.$id;
    })();

    const response = await databases.updateDocument(
      db,
      questionCollection,
      question.$id,
      {
        title: formData.title,
        content: formData.content,
        authorId: formData.authorId,
        tags: Array.from(formData.tags).join(","),
        attachmentId,
      },
    );

    return response;
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.authorId) {
      setError("Please fill out all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = question ? await update() : await create();
      router.push(`/questions/${response.$id}/${slugify(formData.title)}`);
    } catch (error: any) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      {error && (
        <LabelInputContainer>
          <div className="text-center">
            <span className="text-red-500">{error}</span>
          </div>
        </LabelInputContainer>
      )}

      <LabelInputContainer>
        <Label htmlFor="title">
          Title Address
          <br />
          <small>
            Be specific and imagine you&apos;re asking a question to another
            person.
          </small>
        </Label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
        />
      </LabelInputContainer>

      <LabelInputContainer>
        <Label htmlFor="content">What are the details of your problem?</Label>
        <RTE
          value={formData.content}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, content: value || "" }))
          }
        />
      </LabelInputContainer>

      <LabelInputContainer>
        <Label htmlFor="image">Image</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const files = e.target.files;
            if (!files?.length) return;
            setFormData((prev) => ({
              ...prev,
              attachment: files[0],
            }));
          }}
        />
      </LabelInputContainer>

      <LabelInputContainer>
        <Label>Tags</Label>

        <div className="flex w-full gap-4">
          <Input value={tag} onChange={(e) => setTag(e.target.value)} />
          <button
            type="button"
            className="rounded-full border border-slate-600 bg-slate-700 px-6 py-2 text-sm text-white"
            onClick={() => {
              if (!tag) return;
              setFormData((prev) => ({
                ...prev,
                tags: new Set([...Array.from(prev.tags), tag]),
              }));
              setTag("");
            }}
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {Array.from(formData.tags).map((tag, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs">
                {tag}
              </span>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    tags: new Set(
                      Array.from(prev.tags).filter((t) => t !== tag),
                    ),
                  }));
                }}
              >
                <IconX size={12} />
              </button>
            </div>
          ))}
        </div>
      </LabelInputContainer>

      <ConfettiButton
        type="submit"
        disabled={loading}
        className="inline-flex h-12 items-center justify-center rounded-md border border-slate-800 bg-slate-900 px-6 font-medium text-white"
        options={{ particleCount: 100, spread: 70 }}
      >
        {question ? "Update" : "Publish"}
      </ConfettiButton>
    </form>
  );
};

export default QuestionForm;

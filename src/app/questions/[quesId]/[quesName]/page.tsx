import Answers from "@/components/Answers";
import Comments from "@/components/Comments";
import { MarkdownPreview } from "@/components/RTE";
import VoteButtons from "@/components/VoteButtons";
import { Particles } from "@/components/magicui/particles";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { avatars } from "@/models/client/config";
import {
  answerCollection,
  db,
  voteCollection,
  questionCollection,
  commentCollection,
  questionAttachmentBucket,
} from "@/models/name";
import { databases, users } from "@/models/server/config";
import { storage } from "@/models/client/config";
import { UserPrefs } from "@/store/Auth";
import convertDateToRelativeTime from "@/utils/relativeTime";
import slugify from "@/utils/slugify";
import Link from "next/link";
import { Query } from "node-appwrite";
import React from "react";
import DeleteQuestion from "./DeleteQuestion";
import EditQuestion from "./EditQuestion";
import { TracingBeam } from "@/components/ui/tracing-beam";

const toPlainObject = (data: any) => JSON.parse(JSON.stringify(data));

const Page = async ({
  params,
}: {
  params: Promise<{ quesId: string; quesName: string }>;
}) => {
  const { quesId } = await params;

  const [questionRaw, answersRaw, upvotesRaw, downvotesRaw, commentsRaw] =
    await Promise.all([
      databases.getDocument(db, questionCollection, quesId),
      databases.listDocuments(db, answerCollection, [
        Query.orderDesc("$createdAt"),
        Query.equal("questionId", quesId),
      ]),
      databases.listDocuments(db, voteCollection, [
        Query.equal("typeId", quesId),
        Query.equal("type", "question"),
        Query.equal("voteStatus", "upvoted"),
      ]),
      databases.listDocuments(db, voteCollection, [
        Query.equal("typeId", quesId),
        Query.equal("type", "question"),
        Query.equal("voteStatus", "downvoted"),
      ]),
      databases.listDocuments(db, commentCollection, [
        Query.equal("type", "question"),
        Query.equal("typeId", quesId),
        Query.orderDesc("$createdAt"),
      ]),
    ]);

  const authorRaw = await users.get<UserPrefs>(questionRaw.authorId);

  commentsRaw.documents = await Promise.all(
    commentsRaw.documents.map(async (comment: any) => {
      const commentAuthor = await users.get<UserPrefs>(comment.authorId);
      return {
        ...comment,
        author: {
          $id: commentAuthor.$id,
          name: commentAuthor.name,
          reputation: commentAuthor.prefs.reputation,
        },
      };
    }),
  );

  answersRaw.documents = await Promise.all(
    answersRaw.documents.map(async (answer: any) => {
      const [answerAuthor, answerComments, answerUpvotes, answerDownvotes] =
        await Promise.all([
          users.get<UserPrefs>(answer.authorId),
          databases.listDocuments(db, commentCollection, [
            Query.equal("typeId", answer.$id),
            Query.equal("type", "answer"),
            Query.orderDesc("$createdAt"),
          ]),
          databases.listDocuments(db, voteCollection, [
            Query.equal("typeId", answer.$id),
            Query.equal("type", "answer"),
            Query.equal("voteStatus", "upvoted"),
          ]),
          databases.listDocuments(db, voteCollection, [
            Query.equal("typeId", answer.$id),
            Query.equal("type", "answer"),
            Query.equal("voteStatus", "downvoted"),
          ]),
        ]);

      return {
        ...answer,
        comments: answerComments,
        upvotesDocuments: answerUpvotes,
        downvotesDocuments: answerDownvotes,
        author: {
          $id: answerAuthor.$id,
          name: answerAuthor.name,
          reputation: answerAuthor.prefs.reputation,
        },
      };
    }),
  );

  const question = toPlainObject(questionRaw);
  const answers = toPlainObject(answersRaw);
  const comments = toPlainObject(commentsRaw);
  const upvotes = toPlainObject(upvotesRaw);
  const downvotes = toPlainObject(downvotesRaw);
  const author = toPlainObject(authorRaw);

  const tags =
    typeof question.tags === "string" && question.tags.length > 0
      ? question.tags.split(",")
      : [];

  return (
    <TracingBeam className="container pl-6">
      <Particles
        className="fixed inset-0 h-full w-full"
        quantity={500}
        ease={100}
        color="#ffffff"
        refresh
      />

      <div className="relative mx-auto px-4 pb-20 pt-36">
        <div className="flex">
          <div className="w-full">
            <h1 className="mb-1 text-3xl font-bold">{question.title}</h1>
            <div className="flex gap-4 text-sm">
              <span>
                Asked {convertDateToRelativeTime(new Date(question.$createdAt))}
              </span>
              <span>Answers {answers.total}</span>
              <span>Votes {upvotes.total + downvotes.total}</span>
            </div>
          </div>

          <Link href="/questions/ask" className="ml-auto shrink-0">
            <ShimmerButton className="shadow-2xl">Ask a question</ShimmerButton>
          </Link>
        </div>

        <hr className="my-4 border-white/40" />

        <div className="flex gap-4">
          <div className="flex shrink-0 flex-col items-center gap-4">
            <VoteButtons
              type="question"
              id={question.$id}
              upvotes={upvotes}
              downvotes={downvotes}
            />

            <EditQuestion
              questionId={question.$id}
              questionTitle={question.title}
              authorId={question.authorId}
            />

            <DeleteQuestion
              questionId={question.$id}
              authorId={question.authorId}
            />
          </div>

          <div className="w-full overflow-auto">
            <MarkdownPreview
              className="rounded-xl p-4"
              source={question.content}
            />

            {question.attachmentId && (
              <img
                src={`https://fra.cloud.appwrite.io/v1/storage/buckets/${questionAttachmentBucket}/files/${question.attachmentId}/view?project=697a98530018be58a2b9`}
                alt={question.title}
                className="mt-3 rounded-lg"
              />
            )}

            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              {tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/questions?tag=${tag}`}
                  className="rounded-lg bg-white/10 px-2 py-0.5 hover:bg-white/20"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <img
                src={avatars.getInitials(author.name, 36, 36).toString()}
                alt={author.name}
                className="rounded-lg"
              />
              <div>
                <Link
                  href={`/users/${author.$id}/${slugify(author.name)}`}
                  className="text-orange-500 hover:text-orange-600"
                >
                  {author.name}
                </Link>
                <p>
                  <strong>{author.prefs.reputation}</strong>
                </p>
              </div>
            </div>

            <Comments
              comments={comments}
              type="question"
              typeId={question.$id}
              className="mt-4"
            />

            <hr className="my-4 border-white/40" />
          </div>
        </div>

        <Answers answers={answers} questionId={question.$id} />
      </div>
    </TracingBeam>
  );
};

export default Page;

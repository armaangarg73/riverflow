import Pagination from "@/components/Pagination";
import QuestionCard from "@/components/QuestionCard";
import {
  answerCollection,
  db,
  questionCollection,
  voteCollection,
} from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { Query } from "node-appwrite";
import React from "react";

type PageProps = {
  params: Promise<{
    userId: string;
    userSlug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
};

const Page = async ({ params, searchParams }: PageProps) => {
  const { userId } = await params;
  const { page } = await searchParams;

  const currentPage = page ?? "1";

  const queries = [
    Query.equal("authorId", userId),
    Query.orderDesc("$createdAt"),
    Query.offset((+currentPage - 1) * 25),
    Query.limit(25),
  ];

  const questions = await databases.listDocuments(
    db,
    questionCollection,
    queries,
  );

  questions.documents = await Promise.all(
    questions.documents.map(async (ques) => {
      const [author, answers, votes] = await Promise.all([
        users.get<UserPrefs>(ques.authorId),
        databases.listDocuments(db, answerCollection, [
          Query.equal("questionId", ques.$id),
          Query.limit(1),
        ]),
        databases.listDocuments(db, voteCollection, [
          Query.equal("type", "question"),
          Query.equal("typeId", ques.$id),
          Query.limit(1),
        ]),
      ]);

      return {
        ...ques,
        totalAnswers: answers.total,
        totalVotes: votes.total,
        author: {
          $id: author.$id,
          reputation: author.prefs.reputation,
          name: author.name,
        },
      };
    }),
  );

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-8">
      <div className="w-full max-w-5xl">
        <div className="mb-6">
          <p className="text-lg">{questions.total} questions</p>
        </div>
        <div className="mb-8 space-y-6">
          {questions.documents.map((ques) => (
            <QuestionCard key={ques.$id} ques={ques as any} />
          ))}
        </div>
        <Pagination total={questions.total} limit={25} />
      </div>
    </div>
  );
};

export default Page;

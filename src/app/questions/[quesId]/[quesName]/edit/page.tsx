import { db, questionCollection } from "@/models/name";
import { databases } from "@/models/server/config";
import React from "react";
import EditQues from "./EditQues";
import { Models } from "appwrite";

type Question = Models.Document & {
  authorId: string;
  title: string;
};

const Page = async ({
  params,
}: {
  params: { quesId: string; quesName: string };
}) => {
  const question = (await databases.getDocument(
    db,
    questionCollection,
    params.quesId,
  )) as Question;

  return <EditQues question={question} />;
};

export default Page;

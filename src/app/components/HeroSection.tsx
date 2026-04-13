import React from "react";
import { HeroParallax } from "@/components/ui/hero-parallax";
import { databases } from "@/models/server/config";
import {
  db,
  questionAttachmentBucket,
  questionCollection,
} from "@/models/name";
import { Query } from "node-appwrite";
import slugify from "@/utils/slugify";
import { storage } from "@/models/client/config";
import HeroSectionHeader from "./HeroSectionHeader";

export default async function HeroSection() {
  const questions = await databases.listDocuments(db, questionCollection, [
    Query.orderDesc("$createdAt"),
    Query.limit(15),
  ]);

  return (
    <HeroParallax
      header={<HeroSectionHeader />}
      products={questions.documents.map((q) => ({
        title: q.title,
        link: `/questions/${q.$id}/${slugify(q.title)}`,
        thumbnail: `https://fra.cloud.appwrite.io/v1/storage/buckets/${questionAttachmentBucket}/files/${q.attachmentId}/view?project=697a98530018be58a2b9`,
      }))}
    />
  );
}

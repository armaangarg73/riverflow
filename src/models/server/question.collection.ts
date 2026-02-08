import { IndexType, Permission, OrderBy } from "node-appwrite";
import { db, questionCollection } from "../name";
import { databases } from "./config";

export default async function createQuestionCollection()  {
    // create collection
    await databases.createCollection(db, questionCollection, questionCollection, [
        Permission.read("any"),
        Permission.read("users"),
        Permission.create("users"),
        Permission.update("users"),
        Permission.delete("users"),
    ])
    console.log("Question collection is created");

    // creating attributes

    await Promise.all([
        databases.createStringAttribute(db, questionCollection, "title", 100, true),
        databases.createStringAttribute(db, questionCollection, "content", 1000, true),
        databases.createStringAttribute(db, questionCollection, "authorId", 50, true),
        databases.createStringAttribute(db, questionCollection, "tags", 50, true , undefined , true),
        databases.createStringAttribute(db, questionCollection, "attachmentId", 50, false),
    ])
    console.log("Question Attributes created");

    // creating indexes
    await Promise.all([
      databases.createIndex(
        db,
        questionCollection,
        "title",
        IndexType.Fulltext,
        ["title"],
        [OrderBy.Asc],
      ),
      databases.createIndex(
        db,
        questionCollection,
        "content",
        IndexType.Fulltext,
        ["content"],
        [OrderBy.Asc],
      ),
      databases.createIndex(
        db,
        questionCollection,
        "question_author_index",
        IndexType.Key,
        ["authorId"],
      ),
      databases.createIndex(
        db,
        questionCollection,
        "question_tags_index",
        IndexType.Key,
        ["tags"],
      ),
      databases.createIndex(
        db,
        questionCollection,
        "question_attachment_index",
        IndexType.Key,
        ["attachmentId"],
      ),
    ]);
     console.log("Question indexes created");
}
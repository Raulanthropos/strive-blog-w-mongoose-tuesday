import mongoose from "mongoose";
import CommentSchema from "../comments/model.js";

const { Schema, model } = mongoose;

const blogPostSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    readTime: {
      value: { type: Number, required: true },
      unit: { type: String, required: true },
    },
    content: { type: String, required: true },
    comments: [
        CommentSchema,
    ],
  },
  {
    timestamps: true,
  }
);

export default model("BlogPost", blogPostSchema);

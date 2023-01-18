import mongoose from "mongoose";

const { Schema, model } = mongoose;

const commentSchema = new Schema(
  {
    name: { type: String, required: true },
    text: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default model("Comment", commentSchema);
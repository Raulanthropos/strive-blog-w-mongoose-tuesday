import mongoose from "mongoose";

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    name: { type: String, required: true },
    text: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default commentSchema;
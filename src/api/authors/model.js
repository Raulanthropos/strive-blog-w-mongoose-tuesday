import mongoose from "mongoose";

const { Schema, model } = mongoose;

const authorSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: false },
    avatar: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

export default model("Author", authorSchema);
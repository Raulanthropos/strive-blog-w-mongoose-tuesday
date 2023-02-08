import mongoose from "mongoose";

const { Schema, model } = mongoose;

const commentsSchema = new Schema(
  {
    content: String,
  },
  {
    timestamps: true,
  }
);

const blogsSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    readTime: {
      value: { type: Number, required: false },
      unit: { type: String, required: false },
    },
    author: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Author",
    }
,
    content: { type: String, required: true },
    comments: [commentsSchema],
  },
  {
    timestamps: true, // this option automatically the createdAt and updatedAt fields
  }
);

export default model("Blog", blogsSchema); // this model is now automagically linked to the "blogs" collection, if collection is not there it will be created

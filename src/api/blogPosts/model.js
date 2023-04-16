import mongoose from "mongoose";

const { Schema, model } = mongoose;

const blogPostSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    readTime: {
      value: { type: Number, required: false },
      unit: { type: String, required: true },
    },
    content: { type: String, required: true },
    comments: [
      {
        name: { type: String, required: true },
        text: { type: String, required: true },
        commentDate: { type: Date, required: true },
      },
    ],
    authors: [{ type: Schema.Types.ObjectId, ref: "Author" }],
  },
  {
    timestamps: true,
  }
);

blogPostSchema.static("findBlogPostsWithAuthors", async function (query) {
    const total = await this.countDocuments(query.criteria)
    const blogPosts = await this.find(query.criteria, query.options.fields)
      .limit(query.options.limit)
      .skip(query.options.skip)
      .sort(query.options.sort)
      .populate({ path: "authors", select: "name surname" })
    return { blogPosts, total }
  })

export default model("BlogPost", blogPostSchema);

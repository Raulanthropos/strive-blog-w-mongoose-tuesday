import mongoose from "mongoose";
import bcrypt from "bcrypt";
import BlogPostModel from "../blogPosts/model.js";

const { Schema, model } = mongoose;

const authorSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    avatar: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Admin", "User"], default: "User" },
    refreshToken: { type: String },
    googleId: {type: String}
  },
  {
    timestamps: true,
  }
);

authorSchema.pre("save", async function (next) {
  const currentAuthor = this;
  if (currentAuthor.isModified("password")) {
    const plainPW = currentAuthor.password;

    const hash = await bcrypt.hash(plainPW, 11);
    currentAuthor.password = hash;
  }

  next();
});

authorSchema.methods.toJSON = function () {
  const author = this.toObject();

  delete author.password;
  delete author.createdAt;
  delete author.updatedAt;
  delete author.__v;
  delete author.refreshToken;

  return author;
};

authorSchema.static("checkCredentials", async function (email, password, req) {
  const author = await this.findOne({ email });

  let authorIndex = null;

  // Making sure author is attached to post being handled
  if (req.baseUrl === "/blogPosts") {
    // Checks whether 'logged in user' is one of the authors of the post
    if (req.method !== "POST") {
      // For cases where blogPostId is in path params
      const relevantBlogPost = await BlogPostModel.findById(
        req.params.blogPostId
      );

      authorIndex = relevantBlogPost.authors.findIndex(
        (authorBlog) => authorBlog.toString() === author._id.toString()
      );
    } else {
      // When blogPostId not created yet
      authorIndex = req.body.authors.findIndex(
        (authorBlog) => authorBlog === author._id.toString()
      );
    }
  }

  if (authorIndex !== -1) {
    if (author) {
      const isMatch = await bcrypt.compare(password, author.password);
      console.log("is Match?", isMatch);
      if (isMatch) {
        return author;
      } else {
        return null;
      }
    } else {
      return null;
    }
  } else {
    return null;
  }
});

export default model("Author", authorSchema);

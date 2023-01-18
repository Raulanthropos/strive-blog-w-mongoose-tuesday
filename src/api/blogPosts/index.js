import express from "express";
import BlogPostModel from "./model.js";
import CommentModel from '../comments/model.js'
import { extname } from "path";
import createHttpError from "http-errors";
const blogPostsRouter = express.Router();

// POST

blogPostsRouter.post("/", async (req, res, next) => {
  try {
    const newBlogPost = new BlogPostModel(req.body);
    const { _id } = await newBlogPost.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

// GET

blogPostsRouter.get("/", async (req, res, next) => {
    try {
      const blogPosts= await BlogPostModel.find()
      res.send(blogPosts)
    } catch (error) {
      next(error)
    }
  })

// GET SPECIFIC

blogPostsRouter.get("/:blogPostId", async (req, res, next) => {
  try {
    const blogPost = await BlogPostModel.findById(req.params.blogPostId);
    if (blogPost) {
      res.send(blogPost);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.blogPostId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// PUT

blogPostsRouter.put("/:blogPostId", async (req, res, next) => {
  try {
    const updatedBlogPost = await BlogPostModel.findByIdAndUpdate(
      req.params.blogPostId,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedBlogPost) {
      res.send(updatedBlogPost);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.blogPostId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// DELETE

blogPostsRouter.delete("/:blogPostId", async (req, res, next) => {
  try {
    const deletedBlogPost = await BlogPostModel.findByIdAndDelete(
      req.params.blogPostId
    );
    if (deletedBlogPost) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `User with id ${req.params.blogPostId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// COMMENTS GET

blogPostsRouter.get("/:blogPostId/comments", async (req, res, next) => {
  try {
    const blogPost = await BlogPostModel.findById(req.params.blogPostId);

    if (blogPost) {
      res.status(200).send(blogPost.comments);
    } else {
      next(
        createHttpError(
          404,
          `No blog post with id ${req.params.blogPostId} found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// COMMENTS GET SPECIFIC

blogPostsRouter.get(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const blogPost = await BlogPostModel.findById(req.params.blogPostId);

      if (blogPost) {
        const selectedComment = blogPost.comments.find(
          (comment) => comment._id.toString() === req.params.commentId
        );

        if (selectedComment) {
          res.send(selectedComment);
        } else {
          next(
            createHttpError(
              404,
              `No blog post with id ${req.params.blogPostId} found`
            )
          );
        }
      } else {
        next(
          createHttpError(
            404,
            `No blog post with id ${req.params.blogPostId} found`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// COMMENTS POST

blogPostsRouter.post("/:blogPostId/comments", async (req, res, next) => {
  try {
    const newCommentData = new CommentModel(req.body);

    const newComment = {
      ...newCommentData.toObject(),
      commentDate: new Date(),
    };

    const updatedBlogPost = await BlogPostModel.findByIdAndUpdate(
      req.params.blogPostId,
      { $push: { comments: newComment } },
      { new: true, runValidators: true }
    );

    if (updatedBlogPost) {
      res.send(updatedBlogPost);
    } else {
      next(
        createHttpError(
          404,
          `No blog post with id ${req.params.blogPostId} found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// COMMENTS PUT

blogPostsRouter.put(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const blogPost = await BlogPostModel.findById(req.params.blogPostId);

      if (blogPost) {
        const selectedCommentIndex = blogPost.comments.findIndex(
          (comment) => comment._id.toString() === req.params.commentId
        );

        console.log(selectedCommentIndex);

        if (selectedCommentIndex !== -1) {
          blogPost.comments[selectedCommentIndex] = {
            ...blogPost.comments[selectedCommentIndex].toObject(),
            ...req.body,
          };

          await blogPost.save();

          res.send(blogPost);
        } else {
          next(
            createHttpError(
              404,
              `No comment with id ${req.params.commentId} found, ${selectedCommentIndex}`
            )
          );
        }
      } else {
        next(
          createHttpError(
            404,
            `No blog post with id ${req.params.blogPostId} found`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// COMMENTS DELETE

blogPostsRouter.delete(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const updatedBlogPost = await BlogPostModel.findByIdAndUpdate(
        req.params.blogPostId,
        { $pull: { comments: { _id: req.params.commentId } } },
        { new: true }
      );

      if (updatedBlogPost) {
        res.send(updatedBlogPost);
      } else {
        next(
          createHttpError(
            404,
            `No blog post with id ${req.params.blogPostId} was found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default blogPostsRouter;
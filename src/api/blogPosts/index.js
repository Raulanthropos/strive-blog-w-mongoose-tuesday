import express from "express";
import createHttpError from "http-errors";
import BlogsModel from "./model.js";
import q2m from "query-to-mongo";
import { basicAuthMiddleware } from "../../lib/basicAuth.js";
import { adminOnlyMiddleware } from "../../lib/adminOnly.js";
import { JWTAuthMiddleware } from "../../lib/jwtAuth.js";
import { createAccessToken } from "../../lib/tools.js";

const blogpostsRouter = express.Router();

blogpostsRouter.get(
  "/me/stories",
  basicAuthMiddleware,
  async (req, res, next) => {
    try {
      const blogs = await BlogsModel.find().populate({ path: "author" });

      const allBlogs = blogs.filter((blog) => {
        if (blog.author._id.toString() === req.author._id.toString()) {
          return blog;
        }
      });
      console.log(allBlogs);
      console.log("header", req.author);
      res.send(allBlogs);
    } catch (error) {
      next(error);
    }
  }
);

blogpostsRouter.post("/", async (req, res, next) => {
  try {
    const newBlog = new BlogsModel(req.body);
    const { _id } = await newBlog.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

blogpostsRouter.get("/", async (req, res, next) => {
  try {
    const blogs = await BlogsModel.find().populate({ path: "author" });
    res.send(blogs);
  } catch (error) {
    next(error);
  }
});

blogpostsRouter.get("/:blogId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const blog = await BlogsModel.findById(req.params.blogId).populate({
      path: "author",
      // select: "name email",
    });
    if (blog) {
      res.send(blog);
    } else {
      next(createHttpError(404, `Blog with id ${req.params.blogId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

blogpostsRouter.put("/:blogId", basicAuthMiddleware, async (req, res, next) => {
  try {
    //get the blogpost
    const searchedBlog = await BlogsModel.findById(req.params.blogId);
    console.log(req.author);
    console.log(searchedBlog);

    if (searchedBlog.author.toString() === req.author._id.toString()) {
      const updatedBlog = await BlogsModel.findByIdAndUpdate(
        req.params.blogId, // WHO you want to modify
        req.body, // HOW you want to modify
        { new: true, runValidators: true }
      );

      res.send(updatedBlog);
    } else {
      next(createHttpError(401, `unauthorzed, not your post`));
    }

    //check blog author id with the one from authorization header

    //if they are equal, update
  } catch (error) {
    next(error);
  }
});

blogpostsRouter.delete(
  "/:blogId",
  basicAuthMiddleware,
  async (req, res, next) => {
    try {
      const deletedBlog = await BlogsModel.findByIdAndDelete(req.params.blogId);

      if (deletedBlog) {
        if (req.author._id.toString() === deletedBlog.author._id.toString()) {
          res.status(204).send();
        } else {
          next(createHttpError(401, "it's not your post to delete"));
        }
      } else {
        next(
          createHttpError(404, `Blog with id ${req.params.blogId} not found`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// ********************** Embedding comments into blogposts ************************

blogpostsRouter.post("/:id", async (req, res, next) => {
  try {
    //in the req.body we will have the content of the comment we want to add

    //we need to find the blog we want to update using the id from the params and update it with
    //the comment from the req.body

    const searchedBlog = await BlogsModel.findById(req.params.id);

    if (searchedBlog) {
      const updatedBlog = await BlogsModel.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            comments: {
              ...req.body,
            },
          },
        },
        { new: true, runValidators: true }
      );
      res.send(updatedBlog);
    } else {
      next(createHttpError(404, `Blog with id ${req.params.id} not found`));
    }
  } catch (error) {
    next(error);
  }
});

blogpostsRouter.get("/:id/comments", async (req, res, next) => {
  try {
    const searchedBlog = await BlogsModel.findById(req.params.id);

    if (searchedBlog) {
      res.send(searchedBlog.comments);
    } else {
      next(createHttpError(404, `Blog with id ${req.params.id} not found`));
    }
  } catch (error) {
    next(error);
  }
});

blogpostsRouter.get("/:id/comments/:commentId", async (req, res, next) => {
  try {
    const searchedBlog = await BlogsModel.findById(req.params.id);

    if (searchedBlog) {
      // console.log("searched blog", searchedBlog);
      const searchedComment = searchedBlog.comments.find(
        (comment) => comment._id.toString() === req.params.commentId
      );

      if (searchedComment) {
        res.send(searchedComment);
      } else {
        next(
          createHttpError(
            404,
            `Comment with id ${req.params.commentId} not found`
          )
        );
      }
    } else {
      next(createHttpError(404, `Blog with id ${req.params.id} not found`));
    }
  } catch (error) {
    next(error);
  }
});

blogpostsRouter.put("/:id/comment/:commentId", async (req, res, next) => {
  try {
    const searchedBlog = await BlogsModel.findById(req.params.id);
    //returns a mongoose document

    if (searchedBlog) {
      const index = searchedBlog.comments.findIndex(
        (comment) => comment._id.toString() === req.params.commentId
      );

      if (index !== -1) {
        searchedBlog.comments[index] = {
          ...searchedBlog.comments[index].toObject(),
          ...req.body,
        };

        await searchedBlog.save();
        res.send(searchedBlog);
      } else {
        next(
          createHttpError(
            404,
            `Comment with id ${req.params.commentId} not found`
          )
        );
      }
    } else {
      next(createHttpError(404, `Blog with id ${req.params.id} not found`));
    }
  } catch (error) {
    next(error);
  }
});

blogpostsRouter.delete("/:id/comment/:commentId", async (req, res, next) => {
  try {
    const updatedBlog = await BlogsModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { comments: { _id: req.params.commentId } } },
      { new: true }
    );

    if (updatedBlog) {
      res.send(updatedBlog);
    } else {
      next(createHttpError(404, `Blog with id ${req.params.id} not found`));
    }
  } catch (error) {
    next(error);
  }
});

export default blogpostsRouter;
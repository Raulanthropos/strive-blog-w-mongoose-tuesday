import AuthorModel from "./model.js";
import express from "express";
import createHttpError from "http-errors";

const authorsRouter = express.Router();

// GET

authorsRouter.get("/", async (req, res, next) => {
  try {
    const authors = await AuthorModel.find();
    res.send(authors);
  } catch (error) {
    next(error);
  }
});

// GET SPECIFIC

authorsRouter.get("/:authorId", async (req, res, next) => {
  try {
    const author = await AuthorModel.findById(req.params.authorId);
    if (author) {
      res.send(author);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.authorId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// POST

authorsRouter.post("/", async (req, res, next) => {
  try {
    const newAuthorPre = {
        ...req.body,
        avatar: `https://ui-avatars.com/api/?name=${req.body.name}+${req.body.surname}`
    }
    const newAuthor = new AuthorModel(newAuthorPre);
    const { _id } = await newAuthor.save();

    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

// PUT

authorsRouter.put("/:authorId", async (req, res, next) => {
  try {
    const updatedAuthor = await AuthorModel.findByIdAndUpdate(
      req.params.authorId,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedAuthor) {
      res.send(updatedAuthor);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.authorId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// DELETE

authorsRouter.delete("/:authorId", async (req, res, next) => {
  try {
    const deletedAuthor = await AuthorModel.findByIdAndDelete(
      req.params.authorId
    );
    if (deletedAuthor) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `User with id ${req.params.authorId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});


export default authorsRouter;
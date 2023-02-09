import express from "express";
import createHttpError from "http-errors";
import AuthorsModel from "./model.js";
import { basicAuthMiddleware } from "../../lib/basicAuth.js";
import { JWTAuthMiddleware } from "../../lib/jwtAuth.js";
import { createAccessToken } from "../../lib/tools.js";

const authorsRouter = express.Router();

authorsRouter.post("/", async (req, res, next) => {
  try {
    const newAuthor = await AuthorsModel(req.body);
    const { _id } = await newAuthor.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

authorsRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const authors = await AuthorsModel.find();
    res.send(authors);
  } catch (error) {
    next(error);
  }
});

authorsRouter.get("/:authorId", basicAuthMiddleware, async (req, res, next) => {
  try {
    const searchedAuthor = await AuthorsModel.findById(req.params.authorId);

    if (searchedAuthor) {
      res.send(searchedAuthor);
    } else {
      next(
        createHttpError(404, `Author with id ${req.params.authorId} not found.`)
      );
    }
  } catch (error) {
    next(error);
  }
});

authorsRouter.put("/:authorId", async (req, res, next) => {
  try {
    const updatedAuthor = await AuthorsModel.findByIdAndUpdate(
      req.params.authorId,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedAuthor) {
      res.send(updatedAuthor);
    } else {
      next(
        createHttpError(404, `Author with id ${req.params.authorId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

authorsRouter.delete("/:authorId", async (req, res, next) => {
  try {
    const deletedAuthor = await AuthorsModel.findByIdAndDelete(
      req.params.authorId
    );

    if (deletedAuthor) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `Author with id ${req.params.authorId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

authorsRouter.post("/login", async (req, res, next) => {
  try {
    // 1. Obtain the credentials from req.body
    const { email, password } = req.body;

    // 2. Verify the credentials
    const author = await AuthorsModel.checkCredentials(email, password);

    if (author) {
      // 3.1 If credentials are fine --> generate an access token (JWT) and send it back as a response
      const payload = { _id: author._id, role: author.role };

      const accessToken = await createAccessToken(payload);
      res.send({ accessToken });
    } else {
      // 3.2 If credentials are NOT fine --> trigger a 401 error
      next(createHttpError(401, "Credentials are not ok!"));
    }
  } catch (error) {
    next(error);
  }
});

export default authorsRouter;
import createHttpError from "http-errors";

export const adminOnlyMiddleware = (req, res, next) => {
  if (req.author.role === "Admin") {
    next();
  } else {
    next(createHttpError(403, "This endpoint is available just for admins!"));
  }
};
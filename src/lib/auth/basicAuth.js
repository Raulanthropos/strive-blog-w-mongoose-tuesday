import createHttpError from "http-errors";
import atob from "atob";
import AuthorsModel from "../../api/authors/model.js";

export const basicAuthMiddleware = async (req, res, next) => {
  console.log("MADE IT HERE");
  if (!req.headers.authorization) {
    next(
      createHttpError(
        401,
        `Please add the necessary credentials in the Authorization header`
      )
    );
  } else {
    const base64Credentials = req.headers.authorization.split(" ")[1];
    const decodedCredentials = atob(base64Credentials);
    const [email, password] = decodedCredentials.split(":");

    const author = await AuthorsModel.checkCredentials(email, password, req);
    console.log("Basic auth file, author", author)
    if (author) {
      req.author = author;

      next();
    } else {
      next(createHttpError(401, `Either email or password are wrong`));
    }
  }
};

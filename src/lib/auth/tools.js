import jwt from "jsonwebtoken";
import AuthorsModel from "../../api/authors/model.js";

const createAccessToken = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    )
  );

export const verifyAccessToken = (accessToken) =>
  new Promise((res, rej) =>
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, originalPayload) => {
      if (err) rej(err);
      else res(originalPayload);
    })
  );

const createRefreshToken = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.REFRESH_SECRET,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    )
  );

export const verifyRefreshToken = (accessToken) =>
  new Promise((resolve, reject) =>
    jwt.verify(
      accessToken,
      process.env.REFRESH_SECRET,
      { expiresIn: "1 week" },
      (err, originalPayload) => {
        if (err) reject(err);
        else resolve(originalPayload);
      }
    )
  );

export const createTokens = async (author) => {
  console.log("creating tokens");
  const accessToken = await createAccessToken({
    _id: author._id,
    role: author.role,
  });
  console.log("accessToken", accessToken);
  const refreshToken = await createRefreshToken({ _id: author._id });
  console.log("refreshToken", refreshToken);
  author.refreshToken = refreshToken;

  await author.save();

  return { accessToken, refreshToken };
};

export const verifyRefreshAndCreateNewTokens = async (currentRefreshToken) => {
  try {
    const refreshTokenPayload = await verifyRefreshToken(currentRefreshToken);

    const author = await AuthorsModel.findById(refreshTokenPayload._id);
    if (!author)
      throw new createHttpError(
        404,
        `User with id ${refreshTokenPayload._id} not found!`
      );
    if (author.refreshToken && author.refreshToken === currentRefreshToken) {
      const { accessToken, refreshToken } = await createTokens(author);
      return { accessToken, refreshToken };
    } else {
      throw new createHttpError(401, "Refresh token not valid!");
    }
  } catch (error) {
    throw new createHttpError(401, "Refresh token not valid!");
  }
};

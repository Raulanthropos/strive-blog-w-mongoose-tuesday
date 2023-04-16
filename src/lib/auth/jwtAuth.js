import createHttpError from "http-errors"
import { verifyAccessToken } from "./tools.js"
import AuthorsModel from "../../api/authors/model.js"

export const JWTAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(createHttpError(401, "Please provide Bearer Token in the authorization header"))
  } else {
    try {
        
      const accessToken = req.headers.authorization.replace("Bearer ", "")
      const payload = await verifyAccessToken(accessToken)
      req.author = {
        _id: payload._id,
        role: payload.role,
      }

      const author = await AuthorsModel.findById(req.author._id);

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
        next()
      } else {
        next(createHttpError(400, "Incorrect user"))
      }

      
    } catch (error) {
      console.log(error)
      next(createHttpError(401, "Token not valid!"))
    }
  }
}
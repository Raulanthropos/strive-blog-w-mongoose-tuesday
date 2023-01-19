import express from "express"
import q2m from "query-to-mongo"
import commentSchema from "./model.js"

const commentsRouter = express.Router()

  commentsRouter.get("/", async (req, res, next) => {
    try {
      const mongoQuery = q2m(req.query)
      const total = await commentSchema.countDocuments(mongoQuery.criteria)
      const comments = await commentSchema.find(mongoQuery.criteria, mongoQuery.options.fields)
        .limit(mongoQuery.options.limit) // No matter the order of usage of these 3 options, Mongo will ALWAYS go with SORT, then SKIP, then LIMIT
        .skip(mongoQuery.options.skip)
        .sort(mongoQuery.options.sort)
      res.send({
        links: mongoQuery.links("http://localhost:3001/comments", total),
        total,
        totalPages: Math.ceil(total / mongoQuery.options.limit),
        comments,
      })
    } catch (error) {
      next(error)
    }
  })
  
  export default commentsRouter;
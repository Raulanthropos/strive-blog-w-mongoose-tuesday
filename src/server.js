import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import {
  badRequestHandler,
  genericServerErrorHandler,
  notFoundHandler,
  unauthorizedHandler,
} from "./errorHandlers.js";
import blogPostsRouter from "./api/blogPosts/index.js";
import mongoose from "mongoose";
import authorsRouter from "./api/authors/index.js";
import passport from "passport";
// import googleStrategy from "./lib/auth/google.js";

const server = express();
const port = process.env.PORT || 3001;

// passport.use("google", googleStrategy)

server.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
  
server.use(express.json());
server.use(passport.initialize())

server.use("/blogPosts", blogPostsRouter);
server.use("/authors", authorsRouter);

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(notFoundHandler);
server.use(genericServerErrorHandler);

mongoose.connect(process.env.MONGO_URL);

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log("Server is up and running on port " + port);
});

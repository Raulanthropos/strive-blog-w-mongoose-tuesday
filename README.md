# strive-blog-w-mongoose-tuesday

### Description

This is a simple API built with Node.js and MongoDB, using the Mongoose library for object modeling. It allows users to perform CRUD operations on a list of blog posts.

### Requirements

* Node.js
* MongoDB

### Endpoints

* GET /blogposts: Retrieve a list of all blog posts
* GET /blogposts/:id: Retrieve a specific blog post by ID
* POST /blogposts: Create a new blog post
* PUT /blogposts/:id: Update an existing blog post
* DELETE /blogposts/:id: Delete an existing blog post
* GET /blogposts/🆔/comments: Retrieve a list of all comments for a specific blog post
* GET /blogposts/🆔/comments/:commentsId: Retrieve a specific comment by ID for a specific blog post
* POST /blogposts/🆔/comments: Create a new comment for a specific blog post
* PUT /blogposts/🆔/comments/:commentsId Update an existing comment for a specific blog post
* DELETE /blogposts/🆔/comments/:commentsId Delete an existing comment for a specific blog post

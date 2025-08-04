# BongoDev Edu-Tech Support Platform

# Note
This application is built with the following tech stack:

- NestJS
- React
- MySQL

## Theme

This is a support system for the BongoDev Edu-Tech Platform. Users can create posts to ask questions, share information, and interact with each other through comments and reactions.

## Specifications

- **User Authentication**: Users can register and log in to the platform.
- **User Profiles**: Each user has a profile page showing their posts and activity.
- **Follow System**: Users can follow other users to see their posts in a personalized timeline.
- **Posts**: Users can create, view, and delete their own posts.
- **Likes**: Users can like posts.
- **Comments**: Users can comment on posts and reply to other comments.
- **Reactions**: Users can add reactions (e.g., 👍, ❤️) to comments.

### DB

The database schema includes tables for `users`, `posts`, `likes`, `follows`, `comments`, and `comment_reactions`.

### Server

The backend is a REST API built with NestJS. Key endpoints include:
*   `[GET] /api/posts/`
*   `[POST] /api/me/posts/`
*   `[DELETE] /api/me/posts/:id/`
*   `[POST] /api/posts/:id/like`
*   `[POST] /api/comments`
*   `[GET] /api/comments/post/:postId`
*   `[POST] /api/comments/:commentId/reactions`
*   `[DELETE] /api/comments/:commentId/reactions`

### Client

The frontend is a single-page application built with React. Key features include:

- **Timeline**: A feed of posts from followed users.
- **Post Detail**: A page showing a single post with its comments and replies.
- **User Profile**: A page showing a user's profile information and their posts.
- **Interactive UI**: Users can like posts, comment on posts, and react to comments with an interactive and responsive UI.

## How to start the development environment
### Programming Language

- Typescript

### Directory structure

- /src -> Frontend (React)
- /server -> Backend (NestJS)
- /db -> Database (MySQL 8.x)

### install modules

It is assumed that node(v20.x.x), npm and yarn are installed.

### setup project
#### DB
1. `cd db && docker compose build`
2. `docker compose up -d`

#### Server
1. `cd server && npm install`
2. `npm run start:dev`

#### Client
1. `cd src && yarn install`
2. `yarn dev`

### How to confirm to success to build environment
1. Access http://localhost:3000/
2. You should see the application running.

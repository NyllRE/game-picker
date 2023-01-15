export default defineEventHandler( (event) => {
   //=>> Nuxt will automatically read in any file in the ~/server/middleware to create server middleware for your project.
   //=>> Middleware handlers will run on every request before any other server route to add or check headers, log requests, or extend the event's request object.
   //=> https://nuxt.com/docs/guide/directory-structure/server#server-middleware

   // console.log('New request: ' + event.node.req.url)
})
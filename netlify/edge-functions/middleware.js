import handler from "../../common.js";
export default (request) =>
  handler(request, Netlify.env.get("DNS"), Netlify.env.get("API"));
export const config = { path: "*" };

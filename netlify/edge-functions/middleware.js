import handler from "../../common.js";
export default async (request) =>
  handler(request, Netlify.env.get("DNS"), Netlify.env.get("API"), Netlify.context.ip);
export const config = { path: "*" };

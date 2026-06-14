import handler from "../../handler/dns.js";
export default async (request) =>
  handler(
    request,
    Netlify.env.get("DNS"),
    Netlify.env.get("API"),
    Netlify.env.get("IPV4_PREFIX"),
    Netlify.env.get("IPV6_PREFIX"),
    Netlify.env.get("CONCURRENT"),
    Netlify.context.ip,
  );
export const config = { path: "*" };

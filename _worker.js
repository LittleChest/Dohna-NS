import handler from "./common";

export default {
  fetch: async (request, env) =>
    handler(
      request,
      env.DNS,
      env.API,
      env.IPV4_PREFIX,
      env.IPV6_PREFIX,
      env.CONCURRENT,
      request.headers.get("cf-connecting-ip"),
    ),
};

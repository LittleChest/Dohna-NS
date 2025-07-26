import handler from "./common";

export default {
  fetch: async (request, env) =>
    handler(request, env.DNS, env.API, request.headers.get("cf-connecting-ip")),
};

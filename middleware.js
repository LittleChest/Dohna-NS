import handler from "./common";

export default middleware = async (request) => {
  return handler(
    request,
    process.env.DNS,
    process.env.API,
    process.env.IPV4_PREFIX,
    process.env.IPV6_PREFIX
  );
};

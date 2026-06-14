import handler from "./handler/dns";

export default middleware = async (request) => {
  return handler(
    request,
    process.env.DNS,
    process.env.API,
    process.env.IPV4_PREFIX,
    process.env.IPV6_PREFIX,
    process.env.CONCURRENT,
    undefined,
    process.env.ENABLE_MOBILE_CONFIG,
  );
};

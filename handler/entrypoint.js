import dnsHandler from "./dns";
import mobileconfigHandler from "./mobileconfig";

export default async function handler(
  request,
  dns,
  api,
  ipv4Prefix = 32,
  ipv6Prefix = 128,
  concurrent = false,
  rawIP,
  enableMobileConfig = false,
) {
  const { pathname } = new URL(request.url);
  let res = new Response(null, { status: 404 });

  // DNS over HTTPS & JSON API
  if (pathname === "/dns-query" || pathname === "/resolve") {
    res = dnsHandler(
      request,
      dns,
      api,
      ipv4Prefix,
      ipv6Prefix,
      concurrent,
      rawIP,
    );
  }

  // Apple Mobile Config
  if (enableMobileConfig && pathname === "/mobileconfig") {
    res = mobileconfigHandler(request);
  }

  return res;
}

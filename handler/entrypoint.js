import dnsHandler from "./dns";

export default async function handler(
    request,
    dns,
    api,
    ipv4Prefix = 32,
    ipv6Prefix = 128,
    concurrent = false,
    rawIP,
  ) {
    const { pathname } = new URL(request.url);
    let res = new Response(null, { status: 404 });

    // DNS over HTTPS & JSON API
    if (pathname === "/dns-query" || pathname === "/resolve") {
       res = dnsHandler(request, dns, api, ipv4Prefix, ipv6Prefix, concurrent, rawIP);
    }
}
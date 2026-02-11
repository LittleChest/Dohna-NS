<!-- markdownlint-disable MD034 -->

# Dohna NS

Another DNS over HTTPS recursive resolver.

- [x] EDNS Client Subnet
- [x] [JSON API](https://developers.google.com/speed/public-dns/docs/doh/json)

## For Users

Read [Dohna NS Documentation](https://dohna.ovh/) to learn how to install Dohna NS on your device.

## Deploy

| Provider   | Deploy                                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cloudflare | [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/LittleChest/Dohna-NS)    |
| Vercel     | [![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/LittleChest/Dohna-NS)                          |
| Netlify    | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/LittleChest/Dohna-NS) |

## Environment Variables

| Key         | Default                                                                                                                                         | Description                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| DNS         | ["https://8.8.8.8/dns-query","https://8.8.4.4/dns-query","https://[2001:4860:4860::8888]/dns-query","https://[2001:4860:4860::8888]/dns-query"] | Specify a DNS over HTTPS server as the upstream.                            |
| API         | ["https://8.8.8.8/resolve","https://8.8.4.4/resolve","https://[2001:4860:4860::8888]/resolve","https://[2001:4860:4860::8888]/resolve"]         | Specify a JSON API server as the upstream.                                  |
| IPV4_PREFIX | 32                                                                                                                                              | Specify the EDNS client subnet IPv4 prefix length.                          |
| IPV6_PREFIX | 128                                                                                                                                             | Specify the EDNS client subnet IPv6 prefix length.                          |
| CONCURRENT  | false                                                                                                                                           | Whether it concurrently queries all servers and returns the fastest result. |

## Self-hosted

You can use [Netlify CLI](https://cli.netlify.com/commands/serve/) or [`workerd`](https://github.com/cloudflare/workerd/blob/main/README.md#getting-started) **(Recommended)** to serve locally.

Make sure you can connect to upstream servers.

If you find a bug on self-hosted, try to reproduce it at `dohna.ovh` before reporting it.

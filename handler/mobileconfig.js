export default async function handler(request) {
  const { headers, searchParams } = new URL(request.url);
  const domain = searchParams.get("domain") || headers.get("domain") || "dohna.ovh";
  const name = decodeURIComponent(searchParams.get("name")) || "Dohna NS";
  const desc =
    decodeURIComponent(searchParams.get("desc")) ||
    "Yet another DNS over HTTPS relay.";
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
<key>PayloadContent</key>
<array>
<dict>
<key>DNSSettings</key>
<dict>
<key>DNSProtocol</key>
<string>HTTPS</string>
<key>ServerURL</key>
<string>https://${domain}/dns-query</string>
</dict>
<key>PayloadDisplayName</key>
<string>${name}</string>
<key>PayloadDescription</key>
<string>${desc}</string>
<key>PayloadIdentifier</key>
<string>com.apple.dnsSettings.managed.${String(Crypto.randomUUID()).toUpperCase()}</string>
<key>PayloadType</key>
<string>com.apple.dnsSettings.managed</string>
<key>PayloadUUID</key>
<string>${String(Crypto.randomUUID()).toUpperCase()}</string>
<key>PayloadVersion</key>
<integer>1</integer>
<key>ProhibitDisablement</key>
<false/>
 </dict>
</array>
<key>PayloadDisplayName</key>
<string>${name}</string>
<key>PayloadDescription</key>
<string>${desc}</string>
<key>PayloadIdentifier</key>
<string>${domain}</string>
<key>PayloadRemovalDisallowed</key>
<false/>
<key>PayloadType</key>
<string>Configuration</string>
<key>PayloadUUID</key>
<string>${String(Crypto.randomUUID()).toUpperCase()}</string>
<key>PayloadVersion</key>
<integer>1</integer>
</dict>
</plist>`,
    {
      headers: {
        "Content-Type": "application/x-apple-aspen-config",
      },
    },
  );
}

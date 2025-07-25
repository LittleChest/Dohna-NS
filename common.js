export default async function handler(
  request,
  dns = "https://dns.google/dns-query",
  api = "https://dns.google/resolve"
) {
  const { method, headers, url } = request;
  const { search, searchParams, pathname } = new URL(url);
  const ip = headers.get("x-forwarded-for");

  // Anti-GFW
  if (
    method === "POST" &&
    pathname === "/dns-query" &&
    headers.get("content-type") === "application/dns-message" &&
    headers.get("accept") === "application/dns-message" &&
    headers.get("content-length") === "29" &&
    (headers.get("accept-encoding") === "gzip, br" ||
      headers.get("accept-encoding") === "gzip") &&
    (headers.get("user-agent") === "Go-http-client/1.1" ||
      headers.get("user-agent") === "Go-http-client/2.0")
  ) {
    return new Response(null, { status: 403 });
  }

  let res = new Response(null, { status: 404 });

  // JSON API
  if (pathname === "/resolve") {
    res = new Response(null, { status: 400 });

    if (method === "GET" && searchParams.has("name")) {
      res = fetch(api + search, {
        method: "GET",
        headers: {
          "User-Agent": "Dohna-NS (https://github.com/LittleChest/Dohna-NS)",
        },
      });
    }
  }

  // DNS Query
  if (pathname === "/dns-query") {
    res = new Response(null, { status: 400 });

    let queryData;

    // GET
    if (method === "GET" && searchParams.has("dns")) {
      // Decode the base64-encoded DNS query
      const decodedQuery = atob(searchParams.get("dns"));
      queryData = new Uint8Array(decodedQuery.length);
      for (let i = 0; i < decodedQuery.length; i++) {
        queryData[i] = decodedQuery.charCodeAt(i);
      }
    }

    // POST
    if (
      method === "POST" &&
      headers.get("content-type") === "application/dns-message"
    ) {
      const originalQuery = await request.arrayBuffer();
      queryData = new Uint8Array(originalQuery);
    }

    if (queryData !== undefined) {
      res = await queryDns(queryData, ip, dns);
    }
  }

  return res;
}

async function queryDns(queryData, ip, dns) {
  const hasOptRecord = checkForOptRecord(queryData);
  let newQueryData = queryData;
  if (!hasOptRecord && ip) {
    // Extract DNS Header and Question Section
    const [headerAndQuestion] = extractHeaderAndQuestion(queryData);

    // Construct a new OPT record with ECS option
    const optRecord = createOptRecord(ip);

    // Combine the header, question, and new OPT record to create a new query
    newQueryData = combineQueryData(headerAndQuestion, optRecord);
  }

  const res = await fetch(dns, {
    method: "POST",
    headers: {
      "Content-Type": "application/dns-message",
      Accept: "application/dns-message",
      "User-Agent": "Dohna-NS (https://github.com/LittleChest/Dohna-NS)",
      "X-Forwarded-For": ip,
    },
    body: newQueryData,
  });

  return res;
}

function checkForOptRecord(data) {
  // Get the number of additional records (ARCOUNT)
  const arcount = (data[10] << 8) | data[11];
  if (arcount === 0) return false;

  let offset = 12; // DNS header is 12 bytes

  // Skip the Question Section
  const qdcount = (data[4] << 8) | data[5];
  for (let i = 0; i < qdcount; i++) {
    while (data[offset] !== 0) offset++; // Skip QNAME
    offset += 5; // Skip QNAME (0 byte) + QTYPE (2 bytes) + QCLASS (2 bytes)
  }

  // Skip the Answer Section
  const ancount = (data[6] << 8) | data[7];
  for (let i = 0; i < ancount; i++) {
    // Skip each Answer record
    while (data[offset] !== 0) offset++;
    offset += 10; // TYPE(2) + CLASS(2) + TTL(4) + RDLENGTH(2)
    const rdlength = (data[offset - 2] << 8) | data[offset - 1];
    offset += rdlength;
  }

  // Check Additional Section for OPT record
  for (let i = 0; i < arcount; i++) {
    if (data[offset] === 0) {
      // OPT record NAME must be root (0)
      const type = (data[offset + 1] << 8) | data[offset + 2];
      if (type === 41) {
        // 41 is the OPT record type
        return true;
      }
    }
    // Skip this additional record
    while (data[offset] !== 0) offset++;
    offset += 10;
    const rdlength = (data[offset - 2] << 8) | data[offset - 1];
    offset += rdlength;
  }

  return false;
}

function extractHeaderAndQuestion(data) {
  let offset = 12; // DNS header is 12 bytes

  // Get the number of questions
  const qdcount = (data[4] << 8) | data[5];

  // Skip the Question Section
  for (let i = 0; i < qdcount; i++) {
    while (data[offset] !== 0) offset++; // Skip QNAME
    offset += 5; // Skip QNAME (0 byte) + QTYPE (2 bytes) + QCLASS (2 bytes)
  }

  // Extract Header and Question Section
  const headerAndQuestion = data.subarray(0, offset);

  return [headerAndQuestion, offset];
}

function createOptRecord(ip) {
  let ecsData;
  let family;

  if (isIPv4(ip)) {
    // Convert client IP to bytes
    const ipParts = ip.split(".").map((part) => parseInt(part, 10));
    family = 1; // IPv4
    const prefixLength = 32; // Adjust the prefix length as needed
    ecsData = [0, 8, 0, 8, 0, family, prefixLength, 0, ...ipParts];
  } else if (isIPv6(ip)) {
    // Convert client IP to bytes
    const ipParts = ipv6ToBytes(ip);
    family = 2; // IPv6
    const prefixLength = 128; // Adjust the prefix length as needed
    ecsData = [0, 8, 0, 20, 0, family, prefixLength, 0, ...ipParts];
  } else {
    throw new Error("Invalid IP address");
  }

  // Construct the OPT record
  return new Uint8Array([
    0, // Name (root)
    0,
    41, // Type: OPT
    16,
    0, // UDP payload size (default 4096)
    0,
    0,
    0,
    0, // Extended RCODE and flags
    0,
    ecsData.length, // RD Length
    ...ecsData,
  ]);
}

function isIPv4(ip) {
  return ip.split(".").length === 4;
}

function isIPv6(ip) {
  return ip.split(":").length > 2; // At least 3 groups separated by colons
}

function ipv6ToBytes(ipv6) {
  // Split the IPv6 address into segments
  let segments = ipv6.split(":");

  // Expand shorthand notation (e.g., '::')
  let expandedSegments = [];
  for (let i = 0; i < segments.length; i++) {
    if (segments[i] === "") {
      // Insert zero segments for "::"
      let zeroSegments = 8 - (segments.length - 1);
      expandedSegments.push(...new Array(zeroSegments).fill("0000"));
    } else {
      expandedSegments.push(segments[i]);
    }
  }

  // Convert each segment into a 16-bit number and then into 8-bit numbers
  let bytes = [];
  for (let segment of expandedSegments) {
    let segmentValue = parseInt(segment, 16);
    bytes.push((segmentValue >> 8) & 0xff); // High byte
    bytes.push(segmentValue & 0xff); // Low byte
  }

  return bytes;
}

function combineQueryData(headerAndQuestion, optRecord) {
  // Combine the header and question section with the new OPT record
  const newQueryData = new Uint8Array(
    headerAndQuestion.length + optRecord.length
  );
  newQueryData.set(headerAndQuestion, 0);
  newQueryData.set(optRecord, headerAndQuestion.length);
  // https://en.wikipedia.org/wiki/Domain_Name_System#DNS_message_format
  // Incrementing the QDCOUNT field (offset 3) to 32, signaling an additional record in the question section.
  // Setting the ARCOUNT field (offset 11) to 1, indicating one additional record in the message.
  newQueryData.set([32], 3);
  newQueryData.set([1], 11);
  return newQueryData;
}

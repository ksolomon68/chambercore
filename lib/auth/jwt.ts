import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "chambercore_secure_session_secret_change_me_in_production";

function base64UrlEncode(data: string | Buffer): string {
  return Buffer.from(data)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

export type JwtPayload = {
  sub: string; // user id
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
};

/**
 * Signs a payload into an HMAC-SHA256 JWT string.
 * Default expiration: 30 days (2592000 seconds).
 */
export function signJwt(payload: JwtPayload, expiresInSeconds: number = 60 * 60 * 24 * 30): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(fullPayload));

  const dataToSign = `${headerEncoded}.${payloadEncoded}`;
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(dataToSign)
    .digest();
  const signatureEncoded = base64UrlEncode(signature);

  return `${dataToSign}.${signatureEncoded}`;
}

/**
 * Verifies and decodes an HMAC-SHA256 JWT string.
 * Returns decoded payload if valid and not expired, or null if invalid.
 */
export function verifyJwt<T extends JwtPayload = JwtPayload>(token: string): T | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerEncoded, payloadEncoded, signatureEncoded] = parts;
    const dataToSign = `${headerEncoded}.${payloadEncoded}`;

    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(dataToSign)
      .digest();
    const expectedSignatureEncoded = base64UrlEncode(expectedSignature);

    // Timing safe compare
    const sigBuf = Buffer.from(signatureEncoded);
    const expBuf = Buffer.from(expectedSignatureEncoded);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload: T = JSON.parse(base64UrlDecode(payloadEncoded));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

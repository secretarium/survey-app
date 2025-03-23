// Copyright 2025 Secretarium Ltd <contact@secretarium.org>

import { JSON, Crypto } from '@klave/sdk';
import { ApiResult } from '../../types';
import { AuthTokenJwtHeader, AuthTokenJwtPayload } from './types';
import * as Base64 from "as-base64/assembly";


function fromUrlMode(base64: string): string {
    base64 = base64.replaceAll("-", "+").replaceAll("_", "/");
    const padding = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
    return base64 + padding;
}

export function verifyToken(jwtToken: string, utcNow: u64) : ApiResult<string> {

    // Load token identity
    let pdaPubKey = Crypto.Subtle.loadKey("auth-token-identity");
    if (!pdaPubKey.data)
        return ApiResult.error<string>(`can load token identity, error: '${pdaPubKey.err!.message}'`, 50310);

    // Parse Jwt
    let jwtParts = jwtToken.split(".");
    if (jwtParts.length != 3)
        return ApiResult.error<string>(`invalid JWT token`, 50311);

    // Verify header parameters are the ones we support
    let headerBytes = Base64.decode(fromUrlMode(jwtParts[0]));
    let header = JSON.parse<AuthTokenJwtHeader>(String.UTF8.decode(headerBytes.buffer));
    if (header.typ !== "JWT")
        return ApiResult.error<string>(`unsupported token format`, 50312);

    if (header.alg !== "ES256")
        return ApiResult.error<string>(`unsupported token algorithm`, 50313);

    // Verify signature
    let ecdsaParams = { hash: "SHA2-256" } as Crypto.EcdsaParams;
    let signature = Base64.decode(fromUrlMode(jwtParts[2]));
    let signedData = jwtParts[0] + "." + jwtParts[1];
    let verify = Crypto.Subtle.verify(ecdsaParams, pdaPubKey.data, String.UTF8.encode(signedData), signature.buffer);
    if (!verify.data || !verify.data!.isValid)
        return ApiResult.error<string>(`unsupported token signature`, 50314);

    // Parse payload
    let payloadBytes = Base64.decode(fromUrlMode(jwtParts[1]));
    let payload = JSON.parse<AuthTokenJwtPayload>(String.UTF8.decode(payloadBytes.buffer));

    // Check if expired
    if (utcNow > payload.exp)
        return ApiResult.error<string>(`token has expired`, 50315);

    // return user vendor id
    return ApiResult.success(payload.sub);
}
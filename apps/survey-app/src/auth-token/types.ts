// Copyright 2025 Secretarium Ltd <contact@secretarium.org>


@json
export class AuthTokenJwtHeader /* following the JWT standard */ {
    alg: string = "ES256";
    typ: string = "JWT";
}

@json
export class AuthTokenJwtPayload /* following the JWT standard */ {
    iss: string = "secretarium.id";
    sub: string = ""; // user vendor id
    @omitif("this.iat == 0")
    iat: u64 = 0; // issue at time
    @omitif("this.exp == 0")
    exp: u64 = 0; // expiry
    //auths: Set<string> = new Set<string>();
}
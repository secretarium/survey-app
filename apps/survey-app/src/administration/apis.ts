// Copyright 2025 Secretarium Ltd <contact@secretarium.org>

import { Ledger, JSON, Crypto } from '@klave/sdk';
import { AdministrateInput } from './types';
import { addAdmin, addOwner, isAdmin, removeAdmin, removeOwner } from './helpers';
import { EmailServiceConfiguration } from '../email/types';
import * as Base64 from "as-base64/assembly";
import { verifyToken } from '../auth-token/helpers';
import { ApiOutcome } from '../../types';
import { TBLE_NAMES } from '../../config';


export function administrateApi(utcNow: u64, input: AdministrateInput): ApiOutcome {

    // Verify input
    if (!input || !input.authToken || !input.type)
        return ApiOutcome.error(`incorrect arguments`);

    // Verify access
    let tokenRes = verifyToken(input.authToken, utcNow);
    if (!tokenRes.success)
        return ApiOutcome.error(`access denied`);
    let userId = tokenRes.result!;
    if (!isAdmin(userId))
        return ApiOutcome.error(`access denied`);

    // Run sub command
    if (input.type == "manage-admin") {

        if (!input.manageAdmin || !input.manageAdmin!.userId || !input.manageAdmin!.task)
            return ApiOutcome.error(`incorrect arguments`);

        if (input.manageAdmin!.task == "add-admin") {
            if (!addAdmin(userId, input.manageAdmin!.userId, utcNow))
                return ApiOutcome.error(`can't add`);
        }
        else if (input.manageAdmin!.task == "remove-admin") {
            if (!removeAdmin(userId, input.manageAdmin!.userId, utcNow))
                return ApiOutcome.error(`can't remove`);
        }
        else if (input.manageAdmin!.task == "add-owner") {
            if (!addOwner(userId, input.manageAdmin!.userId, utcNow))
                return ApiOutcome.error(`can't add`);
        }
        else if (input.manageAdmin!.task == "remove-owner") {
            if (!removeOwner(userId, input.manageAdmin!.userId, utcNow))
                return ApiOutcome.error(`can't remove`);
        }
        else
            return ApiOutcome.error(`incorrect arguments`);
    }
    else if (input.type == "set-auth-token-identity") {

        if (!input.authServicePubKey)
            return ApiOutcome.error(`incorrect arguments`);

        // Import public key
        let importRes = Crypto.Subtle.importKey("spki", Base64.decode(input.authServicePubKey!).buffer, {namedCurve: "P-256"} as Crypto.EcKeyGenParams, true, ["verify"]);
        if (!importRes.data)
            return ApiOutcome.error(`invalid key`);
        let pubKey = importRes.data as Crypto.CryptoKey;
        let res = Crypto.Subtle.saveKey(pubKey, "auth-token-identity");
        if (res.err)
            return ApiOutcome.error(`can't save key, error: '${res.err!.message}'`);
    }
    else if (input.type == "set-email-configuration") {

        if (!input.emailConfig)
            return ApiOutcome.error(`incorrect arguments`);

        Ledger.getTable(TBLE_NAMES.ADMIN).set("EMAIL_CONFIG", JSON.stringify<EmailServiceConfiguration>(input.emailConfig!));
    }
    else if (input.type == "set-invitation-email-template") {

        if (!input.invitationEmailTemplate)
            return ApiOutcome.error(`incorrect arguments`);

        Ledger.getTable(TBLE_NAMES.ADMIN).set("INVITATION _EMAIL_TEMPLATE", input.invitationEmailTemplate!);
    }
    else
        return ApiOutcome.error(`invalid arg 'type'`);

    return ApiOutcome.success(`update done`);
}
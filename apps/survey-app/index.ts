// Copyright 2025 Secretarium Ltd <contact@secretarium.org>

import { Notifier, Transaction, Context } from '@klave/sdk';
import { AdministrateInput } from './src/administration/types';
import { administrateApi } from './src/administration/apis';




// MANAGEMENT APIs

/**
 * @transaction
 * @param {AdministrateInput} input - A parsed input argument
 */
export function administrate(input: AdministrateInput): void {
    const result = administrateApi(u64.parse(Context.get("trusted_time")), input);
    if (!result.success)
        Transaction.abort();
    Notifier.sendJson(result);
}
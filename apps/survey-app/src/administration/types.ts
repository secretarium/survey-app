// Copyright 2025 Secretarium Ltd <contact@secretarium.org>

import { EmailServiceConfiguration } from "../email/types";


@json
export class ManageAdminInput {
    userId!: string;
    task!: string; // add-admin | remove-admin | add-owner | remove-owner
}

@json
export class AdministrateInput {
    authToken!: string;
    type!: string;
    emailConfig: EmailServiceConfiguration | null = null;
    invitationEmailTemplate: string | null = null;
    authServicePubKey: string | null = null;
    manageAdmin: ManageAdminInput | null = null;
}

@json
export class MemberRole {
    role!: string;
    date!: u64;
}
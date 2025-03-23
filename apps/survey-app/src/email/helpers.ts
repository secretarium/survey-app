// Copyright 2025 Secretarium Ltd <contact@secretarium.org>

import { JSON, HTTP, HttpRequest } from '@klave/sdk';
import { EmailServiceConfiguration, MicrosoftAuthResponse, MicrosoftEmailObject } from './types';

export function sendEmail(config: EmailServiceConfiguration, address: string, subject: string, content: string): bool {

    const applicationId = config.applicationId;
    const clientSecret = encodeURIComponent(config.clientSecret);

    // Query auth token
    // todo: token is valid of 3600 seconds (1h) so we could cache it and request on demand only if expired
    const authQuery: HttpRequest = {
        hostname: 'login.microsoftonline.com',
        port: 443,
        path: '/secretarium.com/oauth2/v2.0/token',
        method: 'POST',
        version: 'HTTP/1.1',
        headers: [['Content-Type', 'application/x-www-form-urlencoded']],
        body: `client_id=${applicationId}&scope=https://graph.microsoft.com/.default&client_secret=${clientSecret}&grant_type=client_credentials`
    };
    const authResponse = HTTP.request(authQuery);
    if (!authResponse || !authResponse.body)
        return false;
    const authResp = JSON.parse<MicrosoftAuthResponse>(authResponse.body);
    if (!authResp || !authResp.accessToken)
        return false;

    // Send email
    const emailObj : MicrosoftEmailObject = {
        message: {
            subject: subject,
            body: { contentType: 'HTML', content: content },
            toRecipients: [ { emailAddress: { address: address } } ],
        },
        saveToSentItems: 'false'
    };
    const emailQuery: HttpRequest = {
        hostname: 'graph.microsoft.com',
        port: 443,
        path: '/v1.0/users/no-reply@secretarium.org/sendMail',
        method: 'POST',
        version: 'HTTP/1.1',
        headers: [['Content-Type', 'application/json'], ['Authorization', `Bearer ${authResp.accessToken}`]],
        body: JSON.stringify<MicrosoftEmailObject>(emailObj)
    };
    const emailResponse = HTTP.request(emailQuery);
    if (!emailResponse || !emailResponse.statusCode)
        return false;

    return emailResponse.statusCode == 202;
}
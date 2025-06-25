/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Trusted domains for embedded messaging scripts.
 * These domains are considered safe for loading Shopper Agent scripts.
 * @type {string[]}
 */
const TRUSTED_DOMAINS = ['*.salesforce.com', '*.force.com', '*.salesforce-scrt.com', '*.site.com']

/**
 * Validates if a URL is from a trusted domain.
 * This function checks if the provided URL's hostname matches any of the trusted domains
 * or their subdomains.
 *
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if the URL is from a trusted domain, false otherwise
 * @example
 * isValidTrustedDomain('https://myorg.salesforce.com/script.js') // returns true
 * isValidTrustedDomain('https://malicious-site.com/script.js') // returns false
 */
export function isValidTrustedDomain(url) {
    try {
        const urlObj = new URL(url)
        const hostname = urlObj.hostname.toLowerCase()

        return TRUSTED_DOMAINS.some((domain) => {
            const pattern = domain.replace('*.', '')
            return hostname === pattern || hostname.endsWith('.' + pattern)
        })
    } catch (error) {
        console.error('Invalid URL format:', error)
        return false
    }
}

/**
 * Validates the commerce agent configuration settings.
 * This function performs comprehensive validation including:
 * - Required fields presence and type checking
 * - URL validation for script sources against trusted domains
 *
 * @param {Object} commerceAgent - The commerce agent configuration object
 * @param {string} commerceAgent.enabled - Whether the agent is enabled ('true' or 'false')
 * @param {string} commerceAgent.askAgentOnSearch - Whether to ask agent during search ('true' or 'false')
 * @param {string} commerceAgent.embeddedServiceName - Name of the embedded service deployment
 * @param {string} commerceAgent.embeddedServiceEndpoint - Endpoint URL for the embedded service
 * @param {string} commerceAgent.scriptSourceUrl - URL for the embedded messaging script
 * @param {string} commerceAgent.scrt2Url - URL for the SCRT2 script
 * @param {string} commerceAgent.salesforceOrgId - Salesforce organization ID
 * @param {string} commerceAgent.commerceOrgId - Commerce Cloud organization ID
 * @param {string} commerceAgent.siteId - Site identifier
 * @returns {boolean} - True if all validations pass, false otherwise
 * @example
 * const config = {
 *   enabled: 'true',
 *   scriptSourceUrl: 'https://myorg.salesforce.com/script.js',
 *   scrt2Url: 'https://myorg.salesforce-scrt.com/scrt2.js',
 *   // ... other required fields
 * }
 * validateCommerceAgentSettings(config) // returns true if valid
 */
export function validateCommerceAgentSettings(commerceAgent) {
    const requiredFields = [
        'enabled',
        'askAgentOnSearch',
        'embeddedServiceName',
        'embeddedServiceEndpoint',
        'scriptSourceUrl',
        'scrt2Url',
        'salesforceOrgId',
        'commerceOrgId',
        'siteId'
    ]

    // Check if all required fields are present and are strings
    const hasAllRequiredFields = requiredFields.every(
        (key) => typeof commerceAgent[key] === 'string'
    )

    if (!hasAllRequiredFields) {
        console.error('Invalid commerce agent settings: Missing required fields.')
        return false
    }

    // Validate that script URLs are from trusted domains
    const isScriptSourceUrlValid = isValidTrustedDomain(commerceAgent.scriptSourceUrl)
    const isScrt2UrlValid = isValidTrustedDomain(commerceAgent.scrt2Url)

    if (!isScriptSourceUrlValid) {
        console.error(
            'Invalid commerce agent settings: scriptSourceUrl is not from a trusted domain.'
        )
        return false
    }

    if (!isScrt2UrlValid) {
        console.error('Invalid commerce agent settings: scrt2Url is not from a trusted domain.')
        return false
    }

    return true
}

/**
 * Checks if the Shopper Agent feature is enabled.
 * This function validates both the enabled flag and ensures we're running on the client side.
 *
 * @param {string} enabled - The enabled flag from configuration ('true' or 'false')
 * @returns {boolean} - True if the agent is enabled and running on client, false otherwise
 * @example
 * isEnabled('true') // returns true on client side
 * isEnabled('false') // returns false
 */
export function isEnabled(enabled) {
    const onClient = typeof window !== 'undefined'
    return enabled === 'true' && onClient
}

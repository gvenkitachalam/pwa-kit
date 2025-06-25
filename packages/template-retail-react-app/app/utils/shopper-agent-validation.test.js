/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
    isValidTrustedDomain,
    validateCommerceAgentSettings,
    isEnabled
} from '@salesforce/retail-react-app/app/utils/shopper-agent-validation'

describe('Shopper Agent Validation Utils', () => {
    describe('isValidTrustedDomain', () => {
        test('should return true for valid salesforce.com domains', () => {
            expect(isValidTrustedDomain('https://myorg.salesforce.com/script.js')).toBe(true)
            expect(isValidTrustedDomain('https://test.salesforce.com/script.js')).toBe(true)
            expect(isValidTrustedDomain('https://salesforce.com/script.js')).toBe(true)
        })

        test('should return true for valid force.com domains', () => {
            expect(isValidTrustedDomain('https://myorg.force.com/script.js')).toBe(true)
            expect(isValidTrustedDomain('https://test.force.com/script.js')).toBe(true)
            expect(isValidTrustedDomain('https://force.com/script.js')).toBe(true)
        })

        test('should return true for valid salesforce-scrt.com domains', () => {
            expect(isValidTrustedDomain('https://myorg.salesforce-scrt.com/script.js')).toBe(true)
            expect(isValidTrustedDomain('https://test.salesforce-scrt.com/script.js')).toBe(true)
            expect(isValidTrustedDomain('https://salesforce-scrt.com/script.js')).toBe(true)
        })

        test('should return true for valid site.com domains', () => {
            expect(isValidTrustedDomain('https://myorg.site.com/script.js')).toBe(true)
            expect(isValidTrustedDomain('https://test.site.com/script.js')).toBe(true)
            expect(isValidTrustedDomain('https://site.com/script.js')).toBe(true)
        })

        test('should return false for malicious domains', () => {
            expect(isValidTrustedDomain('https://malicious-site.com/script.js')).toBe(false)
            expect(isValidTrustedDomain('https://evil.com/script.js')).toBe(false)
            expect(isValidTrustedDomain('https://fake-salesforce.com/script.js')).toBe(false)
        })

        test('should return false for invalid URL formats', () => {
            expect(isValidTrustedDomain('not-a-valid-url')).toBe(false)
            expect(isValidTrustedDomain('')).toBe(false)
            expect(isValidTrustedDomain(null)).toBe(false)
            expect(isValidTrustedDomain(undefined)).toBe(false)
        })

        test('should handle case insensitive domain matching', () => {
            expect(isValidTrustedDomain('https://MYORG.SALESFORCE.COM/script.js')).toBe(true)
            expect(isValidTrustedDomain('https://MyOrg.Force.Com/script.js')).toBe(true)
        })

        test('should handle different protocols', () => {
            expect(isValidTrustedDomain('http://myorg.salesforce.com/script.js')).toBe(true)
            expect(isValidTrustedDomain('https://myorg.salesforce.com/script.js')).toBe(true)
        })
    })

    describe('validateCommerceAgentSettings', () => {
        const validConfig = {
            enabled: 'true',
            askAgentOnSearch: 'true',
            embeddedServiceName: 'MIAW_Guided_Shopper_production',
            embeddedServiceEndpoint: 'https://myorg.salesforce.com/ESWMIAWGuidedShopper',
            scriptSourceUrl:
                'https://myorg.salesforce.com/ESWMIAWGuidedShopper/assets/js/bootstrap.min.js',
            scrt2Url: 'https://myorg.salesforce-scrt.com',
            salesforceOrgId: 'mock_salesforce_org_id',
            commerceOrgId: 'mock_ecom_id',
            siteId: 'RefArchGlobal'
        }

        test('should return true for valid configuration', () => {
            expect(validateCommerceAgentSettings(validConfig)).toBe(true)
        })

        test('should return false when required fields are missing', () => {
            const invalidConfig = {
                enabled: 'true'
                // Missing other required fields
            }

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            expect(validateCommerceAgentSettings(invalidConfig)).toBe(false)
            expect(consoleSpy).toHaveBeenCalledWith(
                'Invalid commerce agent settings: Missing required fields.'
            )

            consoleSpy.mockRestore()
        })

        test('should return false when required fields are not strings', () => {
            const invalidConfig = {
                ...validConfig,
                enabled: true, // Should be string 'true'
                scriptSourceUrl: 123 // Should be string
            }

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            expect(validateCommerceAgentSettings(invalidConfig)).toBe(false)
            expect(consoleSpy).toHaveBeenCalledWith(
                'Invalid commerce agent settings: Missing required fields.'
            )

            consoleSpy.mockRestore()
        })

        test('should return false when scriptSourceUrl is from untrusted domain', () => {
            const invalidConfig = {
                ...validConfig,
                scriptSourceUrl: 'https://malicious-site.com/script.js'
            }

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            expect(validateCommerceAgentSettings(invalidConfig)).toBe(false)
            expect(consoleSpy).toHaveBeenCalledWith(
                'Invalid commerce agent settings: scriptSourceUrl is not from a trusted domain.'
            )

            consoleSpy.mockRestore()
        })

        test('should return false when scrt2Url is from untrusted domain', () => {
            const invalidConfig = {
                ...validConfig,
                scrt2Url: 'https://malicious-site.com/scrt2.js'
            }

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            expect(validateCommerceAgentSettings(invalidConfig)).toBe(false)
            expect(consoleSpy).toHaveBeenCalledWith(
                'Invalid commerce agent settings: scrt2Url is not from a trusted domain.'
            )

            consoleSpy.mockRestore()
        })

        test('should return false when scriptSourceUrl has invalid format', () => {
            const invalidConfig = {
                ...validConfig,
                scriptSourceUrl: 'not-a-valid-url'
            }

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            expect(validateCommerceAgentSettings(invalidConfig)).toBe(false)
            expect(consoleSpy).toHaveBeenCalledWith(
                'Invalid commerce agent settings: scriptSourceUrl is not from a trusted domain.'
            )

            consoleSpy.mockRestore()
        })

        test('should return false when scrt2Url has invalid format', () => {
            const invalidConfig = {
                ...validConfig,
                scrt2Url: 'not-a-valid-url'
            }

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            expect(validateCommerceAgentSettings(invalidConfig)).toBe(false)
            expect(consoleSpy).toHaveBeenCalledWith(
                'Invalid commerce agent settings: scrt2Url is not from a trusted domain.'
            )

            consoleSpy.mockRestore()
        })

        test('should accept valid Salesforce domains', () => {
            const validConfigWithSalesforce = {
                ...validConfig,
                scriptSourceUrl: 'https://test.salesforce.com/script.js',
                scrt2Url: 'https://test.salesforce-scrt.com/scrt2.js'
            }

            expect(validateCommerceAgentSettings(validConfigWithSalesforce)).toBe(true)
        })

        test('should accept valid force.com domains', () => {
            const validConfigWithForce = {
                ...validConfig,
                scriptSourceUrl: 'https://myorg.force.com/script.js',
                scrt2Url: 'https://myorg.force.com/scrt2.js'
            }

            expect(validateCommerceAgentSettings(validConfigWithForce)).toBe(true)
        })

        test('should accept valid site.com domains', () => {
            const validConfigWithSite = {
                ...validConfig,
                scriptSourceUrl: 'https://myorg.site.com/script.js',
                scrt2Url: 'https://myorg.site.com/scrt2.js'
            }

            expect(validateCommerceAgentSettings(validConfigWithSite)).toBe(true)
        })
    })

    describe('isEnabled', () => {
        test('should return true when enabled is "true" and on client side', () => {
            expect(isEnabled('true')).toBe(true)
        })

        test('should return false when enabled is "false"', () => {
            expect(isEnabled('false')).toBe(false)
        })

        test('should return false when enabled is not "true"', () => {
            expect(isEnabled('yes')).toBe(false)
            expect(isEnabled('1')).toBe(false)
            expect(isEnabled('')).toBe(false)
            expect(isEnabled(null)).toBe(false)
            expect(isEnabled(undefined)).toBe(false)
        })

        test('should return false when not on client side', () => {
            // Mock window to be undefined (server-side)
            const originalWindow = global.window
            delete global.window

            expect(isEnabled('true')).toBe(false)

            // Restore window
            global.window = originalWindow
        })
    })
})

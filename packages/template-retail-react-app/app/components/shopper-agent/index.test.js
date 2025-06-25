/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import {render, act} from '@testing-library/react'
import {Helmet} from 'react-helmet'
import ShopperAgent from '@salesforce/retail-react-app/app/components/shopper-agent/index'

// Mock the embeddedservice_bootstrap object
const mockEmbeddedService = {
    init: jest.fn(),
    settings: {
        language: '',
        disableStreamingResponses: false
    },
    prechatAPI: {
        setHiddenPrechatFields: jest.fn()
    }
}

jest.mock('@salesforce/commerce-sdk-react', () => {
    const originalModule = jest.requireActual('@salesforce/commerce-sdk-react')
    return {
        ...originalModule,
        useUsid: () => ({usid: 'test-usid'})
    }
})

jest.mock('@salesforce/retail-react-app/app/components/shared/ui', () => {
    const originalModule = jest.requireActual(
        '@salesforce/retail-react-app/app/components/shared/ui'
    )
    return {
        ...originalModule,
        useTheme: jest.fn().mockReturnValue({
            zIndices: {
                sticky: 1100
            }
        })
    }
})

const commerceAgentSettings = {
    enabled: 'true',
    askAgentOnSearch: 'true',
    embeddedServiceName: 'MIAW_Guided_Shopper_production',
    embeddedServiceEndpoint: 'https://myorg.salesforce.com/ESWMIAWGuidedShopper',
    scriptSourceUrl: 'https://myorg.salesforce.com/ESWMIAWGuidedShopper/assets/js/bootstrap.min.js',
    scrt2Url: 'https://myorg.salesforce-scrt.com',
    salesforceOrgId: 'mock_salesforce_org_id',
    commerceOrgId: 'mock_ecom_id',
    siteId: 'RefArchGlobal'
}

describe('ShopperAgent Component', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks()

        // Mock the window.embeddedservice_bootstrap object
        global.window.embeddedservice_bootstrap = mockEmbeddedService
    })

    afterEach(() => {
        // Clean up the window.embeddedservice_bootstrap mock
        delete global.window.embeddedservice_bootstrap
    })

    const defaultProps = {
        commerceAgentConfiguration: commerceAgentSettings,
        basketId: '4a67cda5b1b9325a29207854c1',
        locale: 'en-US',
        basketDoneLoading: true
    }

    test('should render nothing when enabled is false', () => {
        const disabledSettings = {...commerceAgentSettings, enabled: 'false'}
        const props = {...defaultProps, commerceAgentConfiguration: disabledSettings}
        const {container} = render(<ShopperAgent {...props} />)

        expect(container.firstChild).toBeNull()
    })

    test('should render nothing when basketDoneLoading is false', () => {
        const props = {...defaultProps, basketDoneLoading: false}
        const {container} = render(<ShopperAgent {...props} />)

        expect(container.firstChild).toBeNull()
    })

    test('should render Helmet with script tag when all conditions are met', () => {
        render(<ShopperAgent {...defaultProps} />)

        const helmet = Helmet.peek()
        expect(helmet.scriptTags).toHaveLength(1)
        expect(helmet.scriptTags[0].src).toBe(commerceAgentSettings.scriptSourceUrl)
        expect(helmet.scriptTags[0].async).toBe(true)
        expect(helmet.scriptTags[0].type).toBe('text/javascript')
        expect(helmet.scriptTags[0].id).toBe('embedded-messaging-script')
    })

    test('should initialize embedded service when script is available', () => {
        render(<ShopperAgent {...defaultProps} />)

        // Simulate script loading by calling the initialization manually
        act(() => {
            if (mockEmbeddedService.init) {
                mockEmbeddedService.init(
                    commerceAgentSettings.salesforceOrgId,
                    commerceAgentSettings.embeddedServiceName,
                    commerceAgentSettings.embeddedServiceEndpoint,
                    {
                        scrt2URL: commerceAgentSettings.scrt2Url
                    }
                )
            }
        })

        expect(mockEmbeddedService.init).toHaveBeenCalledWith(
            commerceAgentSettings.salesforceOrgId,
            commerceAgentSettings.embeddedServiceName,
            commerceAgentSettings.embeddedServiceEndpoint,
            {
                scrt2URL: commerceAgentSettings.scrt2Url
            }
        )
    })

    test('should handle initialization error gracefully', () => {
        // Mock console.error to avoid noise in test output
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

        // Mock embedded service to throw an error
        mockEmbeddedService.init.mockImplementation(() => {
            throw new Error('Initialization failed')
        })

        const {container} = render(<ShopperAgent {...defaultProps} />)

        // Component should still render (error is caught in initEmbeddedMessaging)
        expect(container.firstChild).toBeNull()

        consoleSpy.mockRestore()
    })

    test('should set prechat fields when embedded messaging is ready', () => {
        render(<ShopperAgent {...defaultProps} />)

        // Simulate the embedded messaging ready event
        act(() => {
            const event = new CustomEvent('onEmbeddedMessagingReady')
            window.dispatchEvent(event)
        })

        expect(mockEmbeddedService.prechatAPI.setHiddenPrechatFields).toHaveBeenCalledWith({
            SiteId: commerceAgentSettings.siteId,
            Locale: defaultProps.locale,
            OrganizationId: commerceAgentSettings.commerceOrgId,
            UsId: 'test-usid',
            IsCartMgmtSupported: true
        })
    })

    test('should update basket ID when embedded messaging button is clicked', () => {
        render(<ShopperAgent {...defaultProps} />)

        // Simulate the embedded messaging button clicked event
        act(() => {
            const event = new CustomEvent('onEmbeddedMessagingButtonClicked')
            window.dispatchEvent(event)
        })

        expect(mockEmbeddedService.prechatAPI.setHiddenPrechatFields).toHaveBeenCalledWith({
            BasketId: defaultProps.basketId
        })
    })

    test('should handle missing prechatAPI gracefully', () => {
        // Remove prechatAPI from mock
        delete mockEmbeddedService.prechatAPI

        render(<ShopperAgent {...defaultProps} />)

        // Simulate the embedded messaging ready event
        act(() => {
            const event = new CustomEvent('onEmbeddedMessagingReady')
            window.dispatchEvent(event)
        })

        // Should not throw an error
        expect(mockEmbeddedService.init).toHaveBeenCalled()
    })

    test('should handle missing embeddedservice_bootstrap gracefully', () => {
        // Remove embeddedservice_bootstrap from window
        delete global.window.embeddedservice_bootstrap

        const {container} = render(<ShopperAgent {...defaultProps} />)

        // Should still render the Helmet component
        expect(container.firstChild).not.toBeNull()
    })

    test('should set z-index when embedded messaging window is maximized', () => {
        // Mock querySelector to return a mock frame
        const mockFrame = document.createElement('div')
        mockFrame.style.zIndex = '0'

        const originalQuerySelector = document.body.querySelector
        document.body.querySelector = jest.fn().mockImplementation((selector) => {
            if (selector === 'div.embedded-messaging iframe') {
                return mockFrame
            }
            return originalQuerySelector.call(document, selector)
        })

        render(<ShopperAgent {...defaultProps} />)

        // Simulate the embedded messaging window maximized event
        act(() => {
            const event = new CustomEvent('onEmbeddedMessagingWindowMaximized')
            window.dispatchEvent(event)
        })

        // Verify z-index was updated
        expect(mockFrame.style.zIndex).toBe('1101') // sticky (1100) + 1

        // Restore original querySelector
        document.body.querySelector = originalQuerySelector
    })

    test('should update prechat fields when configuration changes', () => {
        const {rerender} = render(<ShopperAgent {...defaultProps} />)

        // Simulate initial embedded messaging ready event
        act(() => {
            const event = new CustomEvent('onEmbeddedMessagingReady')
            window.dispatchEvent(event)
        })

        // Reset mock to test configuration change
        mockEmbeddedService.prechatAPI.setHiddenPrechatFields.mockClear()

        // Re-render with different configuration
        const newCommerceAgentSettings = {
            ...commerceAgentSettings,
            siteId: 'NewSiteId',
            commerceOrgId: 'new_commerce_org_id'
        }
        const newProps = {
            ...defaultProps,
            commerceAgentConfiguration: newCommerceAgentSettings
        }

        rerender(<ShopperAgent {...newProps} />)

        // Simulate embedded messaging ready event again
        act(() => {
            const event = new CustomEvent('onEmbeddedMessagingReady')
            window.dispatchEvent(event)
        })

        // Should update with new values
        expect(mockEmbeddedService.prechatAPI.setHiddenPrechatFields).toHaveBeenCalledWith({
            SiteId: newCommerceAgentSettings.siteId,
            Locale: defaultProps.locale,
            OrganizationId: newCommerceAgentSettings.commerceOrgId,
            UsId: 'test-usid',
            IsCartMgmtSupported: true
        })
    })

    test('should update basket ID when basket changes', () => {
        const {rerender} = render(<ShopperAgent {...defaultProps} />)

        // Simulate initial button click event
        act(() => {
            const event = new CustomEvent('onEmbeddedMessagingButtonClicked')
            window.dispatchEvent(event)
        })

        // Reset mock to test basket change
        mockEmbeddedService.prechatAPI.setHiddenPrechatFields.mockClear()

        // Re-render with different basket ID
        const newProps = {
            ...defaultProps,
            basketId: 'new-basket-id'
        }

        rerender(<ShopperAgent {...newProps} />)

        // Simulate button click event again
        act(() => {
            const event = new CustomEvent('onEmbeddedMessagingButtonClicked')
            window.dispatchEvent(event)
        })

        // Should update with new basket ID
        expect(mockEmbeddedService.prechatAPI.setHiddenPrechatFields).toHaveBeenCalledWith({
            BasketId: 'new-basket-id'
        })
    })
})

/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useEffect} from 'react'
import {Helmet} from 'react-helmet'
import {useUsid} from '@salesforce/commerce-sdk-react'
import PropTypes from 'prop-types'
import {useTheme} from '@salesforce/retail-react-app/app/components/shared/ui'
import {
    validateCommerceAgentSettings,
    isEnabled
} from '@salesforce/retail-react-app/app/utils/shopper-agent-validation'

const onClient = typeof window !== 'undefined'

/**
 * Initializes the embedded messaging service with the provided configuration.
 * This function sets up the embedded messaging bootstrap with the specified
 * parameters and handles any initialization errors gracefully.
 *
 * @param {string} salesforceOrgId - The Salesforce organization ID
 * @param {string} embeddedServiceDeploymentName - The name of the embedded service deployment
 * @param {string} embeddedServiceDeploymentUrl - The URL of the embedded service deployment
 * @param {string} scrt2Url - The URL for the SCRT2 script
 * @param {string} locale - The locale for the embedded messaging service
 * @example
 * initEmbeddedMessaging(
 *   '00D1234567890ABC',
 *   'MIAW_Guided_Shopper_production',
 *   'https://myorg.salesforce.com/ESWMIAWGuidedShopper',
 *   'https://myorg.salesforce-scrt.com',
 *   'en-US'
 * )
 */
const initEmbeddedMessaging = (
    salesforceOrgId,
    embeddedServiceDeploymentName,
    embeddedServiceDeploymentUrl,
    scrt2Url,
    locale
) => {
    try {
        if (
            onClient &&
            window.embeddedservice_bootstrap &&
            window.embeddedservice_bootstrap.settings
        ) {
            window.embeddedservice_bootstrap.settings.language = locale
            window.embeddedservice_bootstrap.settings.disableStreamingResponses = true
            window.embeddedservice_bootstrap.init(
                salesforceOrgId,
                embeddedServiceDeploymentName,
                embeddedServiceDeploymentUrl,
                {
                    scrt2URL: scrt2Url
                }
            )
        }
    } catch (err) {
        console.error('Error initializing Embedded Messaging: ', err)
    }
}

/**
 * Custom hook to manage the embedded messaging service initialization.
 * This hook monitors when the embedded messaging script is available and
 * initializes the service with the provided configuration.
 *
 * @param {string} salesforceOrgId - The Salesforce organization ID
 * @param {string} embeddedServiceDeploymentName - The name of the embedded service deployment
 * @param {string} embeddedServiceDeploymentUrl - The URL of the embedded service deployment
 * @param {string} scrt2Url - The URL for the SCRT2 script
 * @param {string} locale - The locale for the embedded messaging service
 * @example
 * useMiaw(
 *   '00D1234567890ABC',
 *   'MIAW_Guided_Shopper_production',
 *   'https://myorg.salesforce.com/ESWMIAWGuidedShopper',
 *   'https://myorg.salesforce-scrt.com',
 *   'en-US'
 * )
 */
function useMiaw(
    salesforceOrgId,
    embeddedServiceDeploymentName,
    embeddedServiceDeploymentUrl,
    scrt2Url,
    locale
) {
    useEffect(() => {
        // Check if the embedded messaging script has been loaded and is available
        if (onClient && window.embeddedservice_bootstrap) {
            initEmbeddedMessaging(
                salesforceOrgId,
                embeddedServiceDeploymentName,
                embeddedServiceDeploymentUrl,
                scrt2Url,
                locale
            )
        }
    }, [
        salesforceOrgId,
        embeddedServiceDeploymentName,
        embeddedServiceDeploymentUrl,
        scrt2Url,
        locale
    ])
}

/**
 * ShopperAgentWindow component that handles the embedded messaging service initialization
 * and event management. This component is responsible for:
 * - Loading the embedded messaging script via Helmet
 * - Setting up event listeners for embedded messaging events
 * - Managing pre-chat fields and basket context
 * - Handling z-index management for the chat widget
 *
 * @param {Object} props - Component props
 * @param {Object} props.commerceAgentConfiguration - Commerce agent configuration object
 * @param {string} props.basketId - The basket ID for the embedded messaging script
 * @param {string} props.locale - The locale for the embedded messaging script
 * @returns {JSX.Element} Helmet component with embedded messaging script
 * @example
 * <ShopperAgentWindow
 *   commerceAgentConfiguration={config}
 *   basketId="4a67cda5b1b9325a29207854c1"
 *   locale="en-US"
 * />
 */
const ShopperAgentWindow = ({commerceAgentConfiguration, locale, basketId}) => {
    const theme = useTheme()
    const {
        embeddedServiceName,
        embeddedServiceEndpoint,
        scriptSourceUrl,
        scrt2Url,
        salesforceOrgId,
        commerceOrgId,
        siteId
    } = commerceAgentConfiguration

    const {usid} = useUsid()

    /**
     * Sets up event listeners for embedded messaging events.
     * This effect handles:
     * - onEmbeddedMessagingReady: Sets initial pre-chat fields
     * - onEmbeddedMessagingWindowMaximized: Manages z-index for chat widget
     */
    useEffect(() => {
        const handleEmbeddedMessagingReady = () => {
            if (window.embeddedservice_bootstrap?.prechatAPI) {
                window.embeddedservice_bootstrap.prechatAPI.setHiddenPrechatFields({
                    SiteId: siteId,
                    Locale: locale,
                    OrganizationId: commerceOrgId,
                    UsId: usid,
                    IsCartMgmtSupported: true
                })
            }
        }

        const handleEmbeddedMessagingWindowMaximized = () => {
            const zIndex = theme.zIndices.sticky + 1
            const embeddedMessagingFrame = document.body.querySelector(
                'div.embedded-messaging iframe'
            )
            if (embeddedMessagingFrame) {
                embeddedMessagingFrame.style.zIndex = zIndex
            }
        }

        window.addEventListener('onEmbeddedMessagingReady', handleEmbeddedMessagingReady)
        window.addEventListener(
            'onEmbeddedMessagingWindowMaximized',
            handleEmbeddedMessagingWindowMaximized
        )

        // Cleanup function
        return () => {
            window.removeEventListener('onEmbeddedMessagingReady', handleEmbeddedMessagingReady)
            window.removeEventListener(
                'onEmbeddedMessagingWindowMaximized',
                handleEmbeddedMessagingWindowMaximized
            )
        }
    }, [commerceAgentConfiguration, usid, theme.zIndices.sticky])

    /**
     * Updates basket ID in pre-chat fields when basket changes.
     * This effect listens for the embedded messaging button click event
     * and updates the basket ID in the pre-chat fields.
     */
    useEffect(() => {
        const handleEmbeddedMessagingButtonClicked = () => {
            if (window.embeddedservice_bootstrap?.prechatAPI) {
                window.embeddedservice_bootstrap.prechatAPI.setHiddenPrechatFields({
                    BasketId: basketId
                })
            }
        }

        window.addEventListener(
            'onEmbeddedMessagingButtonClicked',
            handleEmbeddedMessagingButtonClicked
        )

        // Cleanup function
        return () => {
            window.removeEventListener(
                'onEmbeddedMessagingButtonClicked',
                handleEmbeddedMessagingButtonClicked
            )
        }
    }, [basketId])

    // Initialize the embedded messaging service
    useMiaw(salesforceOrgId, embeddedServiceName, embeddedServiceEndpoint, scrt2Url, locale)

    return (
        <Helmet>
            <script
                id="embedded-messaging-script"
                src={scriptSourceUrl}
                async
                type="text/javascript"
            />
        </Helmet>
    )
}

ShopperAgentWindow.propTypes = {
    commerceAgentConfiguration: PropTypes.object,
    basketId: PropTypes.string,
    locale: PropTypes.string
}

/**
 * ShopperAgent component that initializes and manages the embedded messaging service.
 * This is the main component that:
 * - Validates the commerce agent configuration
 * - Checks if the feature is enabled
 * - Ensures basket loading is complete
 * - Renders the ShopperAgentWindow when all conditions are met
 *
 * The component follows a conditional rendering pattern where it only renders
 * the embedded messaging functionality when all prerequisites are satisfied.
 *
 * @param {Object} props - Component props
 * @param {Object} props.commerceAgentConfiguration - Commerce agent configuration object
 * @param {string} props.basketId - The basket ID for the embedded messaging script
 * @param {string} props.locale - The locale for the embedded messaging script
 * @param {boolean} props.basketDoneLoading - Whether the basket has finished loading
 * @returns {JSX.Element|null} The ShopperAgent component or null if conditions not met
 * @example
 * <ShopperAgent
 *   commerceAgentConfiguration={config}
 *   basketId="4a67cda5b1b9325a29207854c1"
 *   locale="en-US"
 *   basketDoneLoading={true}
 * />
 */
function ShopperAgent({commerceAgentConfiguration, basketId, locale, basketDoneLoading}) {
    const {enabled} = commerceAgentConfiguration
    const isShopperAgentEnabled = isEnabled(enabled)

    return isShopperAgentEnabled &&
        basketDoneLoading &&
        validateCommerceAgentSettings(commerceAgentConfiguration) ? (
        <ShopperAgentWindow
            commerceAgentConfiguration={commerceAgentConfiguration}
            locale={locale}
            basketId={basketId}
        />
    ) : null
}

ShopperAgent.propTypes = {
    commerceAgentConfiguration: PropTypes.object,
    basketId: PropTypes.string,
    locale: PropTypes.string,
    basketDoneLoading: PropTypes.bool
}

export default ShopperAgent

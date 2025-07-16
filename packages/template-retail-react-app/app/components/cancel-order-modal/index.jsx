/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useState} from 'react'
import PropTypes from 'prop-types'
import {FormattedMessage} from 'react-intl'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Select,
    Flex,
    HStack
} from '@chakra-ui/react'

/**
 * A Modal for requesting order cancellation
 */
const CancelOrderModal = ({isOpen, onClose, order, onCancel}) => {
    const [selectedReason, setSelectedReason] = useState('')

    // Mock cancellation reasons for testing
    const mockCancellationReasons = [
        { id: 'item_price_too_high', label: 'Item price too high' },
        { id: 'shipping_cost_too_high', label: 'Shipping cost too high' },
        { id: 'item_not_arrive_on_time', label: 'Item(s) would not arrive on time' },
        { id: 'order_created_by_mistake', label: 'Order created by mistake' },
        { id: 'changed_mind', label: 'Changed my mind' },
        { id: 'no_longer_needed', label: 'No longer needed' },
        { id: 'financial_reasons', label: 'Financial reasons' },
        { id: 'other', label: 'Other' }
    ]

    const cancellationReasons = order?.c_cancellationReasons || mockCancellationReasons

    const handleCancel = () => {
        onCancel(order, selectedReason)
        onClose()
    }

    if (!order) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <FormattedMessage
                        defaultMessage="Request Cancellation"
                        id="cancel_order_modal.title.request_cancellation"
                    />
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {/* TODO:Modal body is empty for now until UX designs are finalized */}
                </ModalBody>

                <ModalFooter>
                    <Flex direction={{base: 'column', sm: 'row'}} gap={3} w="full" align="center">
                        <Select
                            placeholder="Cancellation reason (optional)"
                            value={selectedReason}
                            onChange={(e) => setSelectedReason(e.target.value)}
                            size="sm"
                            flex={1}
                            minW="200px"
                        >
                            {cancellationReasons.map((reason) => (
                                <option key={reason.id} value={reason.id}>
                                    {reason.label}
                                </option>
                            ))}
                        </Select>
                        <HStack spacing={2}>
                            <Button variant="outline" onClick={onClose} size="sm">
                                <FormattedMessage
                                    defaultMessage="Keep Order"
                                    id="cancel_order_modal.button.keep_order"
                                />
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={handleCancel}
                                size="sm"
                            >
                                <FormattedMessage
                                    defaultMessage="Request Cancellation"
                                    id="cancel_order_modal.button.confirm"
                                />
                            </Button>
                        </HStack>
                    </Flex>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

CancelOrderModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    order: PropTypes.object,
    onCancel: PropTypes.func.isRequired
}

export default CancelOrderModal

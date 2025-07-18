/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import PropTypes from 'prop-types'
import {
    Button,
    Text,
    Stack,
    Input,
    FormControl,
    FormLabel,
    Link,
    Box
} from '@salesforce/retail-react-app/app/components/shared/ui'
import FormCard from '@salesforce/retail-react-app/app/components/form-card'

const OrderLookupForm = ({onSubmit}) => {
    const handleSubmit = (e) => {
        e.preventDefault()
        if (onSubmit) {
            onSubmit()
        }
    }

    return (
        <FormCard>
            <Stack spacing={6}>
                <Box textAlign="center">
                    <Text fontSize="lg" fontWeight="medium">
                        Look it up with your order number
                    </Text>
                    <Text fontSize="sm" color="gray.600" mt={1}>
                        Find an individual order
                    </Text>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Stack spacing={4}>
                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="medium">
                                Order Number
                            </FormLabel>
                            <Input placeholder="Enter order number" size="md" />
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="medium">
                                Email
                            </FormLabel>
                            <Input type="email" placeholder="you@email.com" size="md" />
                        </FormControl>

                        <Button type="submit" colorScheme="blue" size="lg" width="100%" mt={2}>
                            Continue
                        </Button>
                    </Stack>
                </form>

                <Box textAlign="center">
                    <Link color="blue.600" fontSize="sm" textDecoration="underline">
                        Can&apos;t find? How to find your order number
                    </Link>
                </Box>
            </Stack>
        </FormCard>
    )
}

OrderLookupForm.propTypes = {
    onSubmit: PropTypes.func
}

export default OrderLookupForm

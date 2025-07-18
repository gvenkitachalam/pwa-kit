/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import PropTypes from 'prop-types'
import {Box} from '@salesforce/retail-react-app/app/components/shared/ui'

const FormCard = ({children, ...props}) => {
    return (
        <Box
            bg="white"
            borderRadius="md"
            boxShadow="md"
            p={{base: 6, md: 8}}
            maxW="md"
            width="100%"
            mx="auto"
            {...props}
        >
            {children}
        </Box>
    )
}

FormCard.propTypes = {
    children: PropTypes.node.isRequired
}

export default FormCard

import { useEffect, useState } from "react";
import {
    IndexTable,
    LegacyCard,
    useIndexResourceState,
    Text,
    Badge,
} from '@shopify/polaris';
import React from 'react';

const PayoutsTable = ({ payoutsData }) => {

    // console.log('payoutsData', payoutsData);

    const resourceName = {
        singular: 'order',
        plural: 'orders',
    };
    function formatPayoutDate(payoutDate) {
        if (!payoutDate) return '';

        const date = new Date(payoutDate);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }

    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(payoutsData);

    const rowMarkup = payoutsData.map(
        (
            { orderName, createdAt, totalAmount, quantity, lineItemName },
            index,
        ) => (
            <IndexTable.Row
                id={orderName}
                key={orderName}
                selected={selectedResources.includes(orderName)}
                position={index}
            >
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {orderName}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{formatPayoutDate(createdAt)}</IndexTable.Cell>
                <IndexTable.Cell>
                    <Text as="span" alignment="end" numeric>
                        {totalAmount}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text as="span" alignment="end" numeric>
                        {quantity}
                    </Text>
                </IndexTable.Cell>

                <IndexTable.Cell>    <Text as="span" alignment="center" numeric>
                    {lineItemName}
                </Text></IndexTable.Cell>
            </IndexTable.Row>
        ),
    );
    return (
        <LegacyCard>
            <IndexTable
                resourceName={resourceName}
                itemCount={payoutsData.length}
                selectedItemsCount={
                    allResourcesSelected ? 'All' : selectedResources.length
                }
                onSelectionChange={handleSelectionChange}
                headings={[
                    { title: 'Order' },
                    { title: 'Date' },
                    { title: 'Total Amount RON', alignment: 'end' },
                    { title: 'Quantity', alignment: 'end' },
                    { title: 'Item Name', alignment: 'center' },

                ]}
            >
                {rowMarkup}
            </IndexTable>
        </LegacyCard>
    );
};

export default PayoutsTable;

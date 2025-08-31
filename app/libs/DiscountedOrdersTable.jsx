import { useEffect, useState } from "react";
import {
    IndexTable,
    LegacyCard,
    useIndexResourceState,
    Text,
    Badge,
} from '@shopify/polaris';
import React from 'react';

const DiscountedOrdersTable = ({ payoutsData }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // This runs only on the client
        setIsClient(true);
    }, []);

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
            { name, createdAt, totalPrice, code, billingName, shippingNmae },
            index,
        ) => (
            <IndexTable.Row
                id={name}
                key={name}
                selected={selectedResources.includes(name)}
                position={index}
            >
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {name}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{formatPayoutDate(createdAt)}</IndexTable.Cell>

                <IndexTable.Cell>
                    <Text as="span" alignment="end" numeric>
                        {totalPrice}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text as="span" alignment="end" >
                        {code}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>

                    <Text as="span" alignment="end" >
                        {billingName}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>

                    <Text as="span" alignment="end" >
                        {shippingNmae}
                    </Text>

                </IndexTable.Cell>

            </IndexTable.Row>
        ),
    );

    if (!isClient) return null;

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
                    { title: 'Order ID' },
                    { title: 'Date' },
                    { title: 'Total  Net Amount RON', alignment: 'end' },
                    { title: 'Code ', alignment: 'end' },
                    { title: 'Billing Name', alignment: 'end' },
                    { title: 'Shipping Name', alignment: 'end' },


                ]}
            >
                {rowMarkup}
            </IndexTable>
        </LegacyCard>
    );
};

export default DiscountedOrdersTable;

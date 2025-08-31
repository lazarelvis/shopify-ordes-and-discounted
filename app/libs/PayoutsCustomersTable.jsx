import { useEffect, useState } from "react";
import {
    IndexTable,
    LegacyCard,
    useIndexResourceState,
    Text,
    Badge,
} from '@shopify/polaris';
import React from 'react';

const PayoutsCustomersTable = ({ payoutsData }) => {
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
            { order_name, payout_date, payout_netAmount, payout_status, payout_feeAmount, transaction_net, transaction_fee, billing_name },
            index,
        ) => (
            <IndexTable.Row
                id={order_name}
                key={order_name}
                selected={selectedResources.includes(order_name)}
                position={index}
            >
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {order_name}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{formatPayoutDate(payout_date)}</IndexTable.Cell>

                <IndexTable.Cell>
                    <Text as="span" alignment="end" numeric>
                        {payout_netAmount}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text as="span" alignment="end" numeric>
                        {payout_feeAmount}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text as="span" alignment="end" numeric>
                        <Badge progress="complete" >
                            {payout_status}
                        </Badge>
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text as="span" alignment="end" numeric>
                        {transaction_net}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text as="span" alignment="end" numeric>
                        {transaction_fee}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{billing_name}</IndexTable.Cell>
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
                    { title: 'Total Fee Amount RON', alignment: 'end' },
                    { title: 'Status', alignment: 'end' },
                    { title: 'Transaction Net RON', alignment: 'end' },
                    { title: 'Transaction Fee', alignment: 'end' },
                    { title: 'Billing Name' },

                ]}
            >
                {rowMarkup}
            </IndexTable>
        </LegacyCard>
    );
};

export default PayoutsCustomersTable;

// app/routes/_index.jsx
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import PayoutsTable from "../libs/PayoutsTable";
import {
  Page,
  Layout,
  Card,
  BlockStack,
} from "@shopify/polaris";

export async function loader() {
  const shop = process.env.SHOPIFY_STORE_URL;
  const token = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

  if (!shop || !token) {
    throw new Error("Missing SHOPIFY_STORE_URL or SHOPIFY_ADMIN_API_ACCESS_TOKEN in .env");
  }

  const response = await fetch(`https://${shop}/admin/api/2025-07/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({
      query: `
{
  orders(first: 250, sortKey: CREATED_AT, reverse: true) {
    edges {
      cursor
      node {
        id
        name
        createdAt
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
     
        lineItems(first: 5) {
          edges {
            node {
              name
              quantity
              originalUnitPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
      `,
    }),
  });

  const data = await response.json();
  // console.log("Shopify Response:", JSON.stringify(data, null, 2));

  if (data.errors) {
    throw new Error("Shopify API Error: " + JSON.stringify(data.errors));
  }

  return json(data.data.orders);
}
export async function action() {

}




const Test = () => {
  const testData = useLoaderData();

  const ordersData = testData.edges

  const extractedOrders = ordersData.map(order => {
    const node = order.node;
    const lineItem = node.lineItems.edges[0]?.node;
    return {
      orderName: node.name,
      createdAt: node.createdAt,
      totalAmount: node.totalPriceSet.shopMoney.amount,
      quantity: lineItem?.quantity || 0,
      lineItemName: node.lineItems.edges[0]?.node.name || null // assumes at least one item
    };
  });


  return (
    <Page fullWidth>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <PayoutsTable payoutsData={extractedOrders} />
            </Card>
          </Layout.Section>

        </Layout>
      </BlockStack>
    </Page>

  )


}
export default Test
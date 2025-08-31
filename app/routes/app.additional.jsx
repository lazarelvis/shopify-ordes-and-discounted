import {
  Box,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ExportToExcelButton from "../libs/ExportToExcelButton";
import DiscountedOrdersTable from "../libs/DiscountedOrdersTable"

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
      orders(first: 250 query: "created_at:>=2024-01-01 created_at:<=2025-07-31" , sortKey: CREATED_AT, reverse: true) {

        edges {
          node {
            id
            name
            createdAt
            totalPrice
            shippingLine {
              title
              price
            }
            discountApplications(first: 100) {
              edges {
                node {
                  __typename
                  ... on ManualDiscountApplication {
                    title
                    value {
                      ... on MoneyV2 {
                        amount
                        currencyCode
                      }
                      ... on PricingPercentageValue {
                        percentage
                      }
                    }
                  }
                  ... on DiscountCodeApplication {
                    code
                    value {
                      ... on MoneyV2 {
                        amount
                      }
                      ... on PricingPercentageValue {
                        percentage
                      }
                    }
                  }
                }
              }
            }
            lineItems(first: 30) {
              edges {
                node {
                  name
                  discountedTotalSet {
                    shopMoney {
                      amount
                      currencyCode
                    }
                  }
                  discountAllocations  {
                    allocatedAmount  {
                     amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
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


export default function AdditionalPage() {

  let allDiscountedOrders = [];

  const data = useLoaderData();
  const orders = data.edges.map(edge => edge.node);

  const filtered = orders.filter(order => order.discountApplications.edges.length > 0);
  allDiscountedOrders.push(...filtered);



  const extracted = allDiscountedOrders.map(order => ({
    name: order.name,
    createdAt: order.createdAt,
    totalPrice: order.totalPrice,
    code: order.discountApplications.edges[0]?.node.code || '-',
    billingName: 'N/A',
    shippingNmae: 'N/A'
  }));

  // console.log(extracted);
  // console.log("extracted", JSON.stringify(extracted, null, 2));


  return (
    <Page>
      <TitleBar title="Discounted Orders">
        <ExportToExcelButton data={extracted} fileName="odiscounted-orders-export.xlsx" />
      </TitleBar>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <DiscountedOrdersTable payoutsData={extracted} />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function Code({ children }) {
  return (
    <Box
      as="span"
      padding="025"
      paddingInlineStart="100"
      paddingInlineEnd="100"
      background="bg-surface-active"
      borderWidth="025"
      borderColor="border"
      borderRadius="100"
    >
      <code>{children}</code>
    </Box>
  );
}

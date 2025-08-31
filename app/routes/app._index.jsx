import { useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import Orders from "./orders";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import PayoutsCustomersTable from "../libs/PayoutsCustomersTable";
import ExportToExcelButton from "../libs/ExportToExcelButton";

export async function loader() {
  const shop = process.env.SHOPIFY_STORE_URL;
  const token = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

  if (!shop || !token) {
    throw new Error("Missing SHOPIFY_STORE_URL or SHOPIFY_ADMIN_API_ACCESS_TOKEN in .env");
  }

  const response = await fetch(`https://${shop}/admin/api/2025-07/shopify_payments/payouts.json?date_min=2025-01-01&date_max=2025-07-31&status=paid`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
  });

  // console.log("Shopify Response:", JSON.stringify(data, null, 2));

  const payoutsResponse = await response.json();

  const payoutsData = payoutsResponse.payouts

  for (const payout of payoutsData) {
    const payoutId = payout.id;

    const response2 = await fetch(`https://${shop}/admin/api/2025-07/shopify_payments/payouts/${payoutId}/transactions.json`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
    });
    const transactionsRes = await response2.json();

    payout.transactions = (transactionsRes.transactions || []).filter(
      (t) => t.type === "charge"
    );

    for (const tx of payout.transactions) {
      if (tx.source_order_id) {
        const orderGid = `gid://shopify/Order/${tx.source_order_id}`;
        const query = `
          {
            order(id: "${orderGid}") {
              id
              name
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              shippingAddress {
                name
              }
              billingAddress {
                name
              }
            }
          }
        `;

        const orderRes = await fetch(`https://${shop}/admin/api/2025-07/graphql.json`, {
          method: "POST",
          headers: {
            "X-Shopify-Access-Token": token,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ query })
        });

        const ord = await orderRes.json();
        // console.log("!ord:", JSON.stringify(ord, null, 2));
        tx.orderDetails = ord.data?.order || null;
      }
    }
  }
  // Extrage și formatează datele într-o structură curată
  const extracted = payoutsData.map(payout => ({
    status: payout.status,
    date: payout.date,
    currency: payout.currency,
    netAmount: payout.amount,
    // NOU: Am corectat calea către feeAmount pentru a se potrivi cu structura de la Shopify
    feeAmount: payout.summary.charges_fee_amount,
    transactions: (payout.transactions || []).map(tx => ({
      payout_status: tx.payout_status,
      currency: tx.currency,
      amount: tx.amount,
      fee: tx.fee,
      net: tx.net,
      orderDetails: tx.orderDetails
        ? {
          name: tx.orderDetails.name,
          shippingAddress: { name: tx.orderDetails.shippingAddress?.name || 'N/A' },
          billingAddress: { name: tx.orderDetails.billingAddress?.name || 'N/A' }
        }
        : null
    }))
  }));

  // console.log("extracted:", JSON.stringify(extracted, null, 2));

  // Fiecare tranzacție va deveni un rând în fișierul Excel.
  const flattenedData = [];
  for (const payout of extracted) {
    for (const tx of payout.transactions) {
      flattenedData.push({
        'order_name': tx.orderDetails?.name,
        'payout_date': payout.date,
        'payout_netAmount': payout.netAmount,
        'payout_feeAmount': payout.feeAmount,
        'payout_status': payout.status,
        'payout_currency': payout.currency,
        'transaction_payout_status': tx.payout_status,
        'transaction_amount': tx.amount,
        'transaction_fee': tx.fee,
        'transaction_net': tx.net,
        'transaction_currency': tx.currency,
        'shipping_name': tx.orderDetails?.shippingAddress?.name,
        'billing_name': tx.orderDetails?.billingAddress?.name,
      });
    }
  }


  if (payoutsData.errors) {
    throw new Error("Shopify API Error 1: " + JSON.stringify(payoutsData.errors));
  }


  return json(flattenedData);
}

export async function action() {

}

export default function Index() {
  const flattenedData = useLoaderData();

  return (
    <Page>
      <TitleBar title="Payouts">
        <ExportToExcelButton data={flattenedData} fileName="orders-export.xlsx" />
      </TitleBar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <PayoutsCustomersTable payoutsData={flattenedData} />
              </BlockStack>

              <Text as="p" tone="critical">
                This app is not approved to access the Customer object. Access to personally identifiable information
                (PII) like customer names, addresses, emails, phone numbers is only available on Shopify, Advanced, and Plus plans. Learn more:
                https://admin.shopify.com/store/znqi6m-qc/settings/apps/development/274287034369/configuration
              </Text>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}

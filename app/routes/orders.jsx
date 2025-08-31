// app/routes/_index.jsx
import React from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader() {
  const test = {
    name: "test1",
    description: "this is a descript"
  }
  return json(test)
}
export async function action() {

}
const Orders = () => {
  const orders = useLoaderData();
  console.log('!orders', orders);

  return (
    <div>
      <h1>Latest Orders</h1>
    </div>
  );
}

export default Orders

import React from "react";
import { Notification, Message } from "element-react";
import StripeCheckout from 'react-stripe-checkout';
import {API, graphqlOperation} from 'aws-amplify';
import {getUser} from '../graphql/queries';
import {creteOrder} from '../graphql/mutations'
import {history} from '../App';

const stripeConfig = {
  currency: "MXN",
  publishableAPIKey: "pk_test_51HqR9zAPmWC5sWDK8nSnEv9V4ZNUchibZhERBPZPn1cwwQ3SyUmdFNeAKNLP0aR2Zs3b5wio5WnxL8Ipu97vpoMP00qgkom4SA"
}

const PayButton = ({product, user, userAttributes}) => {

  const getOwnerEmail = async ownerId => {
    try {
    const input = {id: ownerId}
    const result = await API.graphql(graphqlOperation(getUser, input));
    return result.data.getUser.email;
    } catch (error){
      console.error("Error fetching product's owner email", error);
    }
  }
  const createShippingAddress = source => ({
    city: source.address_city,
    country: source.address_country,
    address_line1: source.address_line1,
    address_state: source.address_state,
    address_zip: source.address_zip
  })
  const handleCharge = async token => {
    try {
      const ownerEmail = await getOwnerEmail(product.owner);
      const result = await API.post('orderlambda', '/charge', {
        body: {
          token,
          charge: {
            currency: stripeConfig.currency,
            amount: product.price,
            description: product.description
          },
          email: {
            customerEmail: userAttributes.email,
            ownerEmail,
            shipped: product.shipped
          }
        }
      })
      console.log({result});
      if (result.charge.status === "succeeded") {
        let shippingAddress = null;
        if(product.shipped){
          shippingAddress =  createShippingAddress(result.charge.source)
        }
        const input = {
          orderUserId: user.attributes.sub,
          orderProductId: product.id,
          shippingAddress
        }
        const order = await API.graphql(graphqlOperation(creteOrder, {input}))
        console.log({order});
        Notification({
          title: "Éxito",
          message: `${result.message}`,
          type: 'success',
          duration: 3000
        })
        setTimeout(()=>{history.push('/'); Message({type: 'info', message: 'Revisar el email para ver los detalles de la órden', duration:5000, showClose:true })}, 3000)
      }
    } catch (error) {
      Notification.error({
        title: "Error",
        message: `${error.message || 'Ocurrió un error al procesar la orden'}`
      })
      console.error(error);
    }
  }
  return (
    <StripeCheckout token={handleCharge} name={product.description} amount={product.price} billingAddress={product.shipped } locale="auto" allowRememberMe={false} shippingAddress={product.shipped} email={userAttributes.email} currency={stripeConfig.currency} stripeKey={stripeConfig.publishableAPIKey} />
  );

};

export default PayButton;

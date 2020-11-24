import React from "react";
import {API, graphqlOperation} from 'aws-amplify';

import { Loading, Tabs, Icon } from "element-react";
import {Link} from 'react-router-dom';
import NewProduct from '../components/NewProduct';
import Product from '../components/Product';
import { onCreateProduct, onUpdateProduct, onDeleteProduct } from '../graphql/subscriptions';

const getMarket = /* GraphQL */ `
  query GetMarket($id: ID!) {
    getMarket(id: $id) {
      id
      name
      products(sortDirection: DESC, limit: 999) {
        items {
          id
          description
          price
          shipped
          owner
          file{
            key
          }
          createdAt
          updatedAt
        }
        nextToken
      }
      tags
      owner
      createdAt
      updatedAt
    }
  }
`;

class MarketPage extends React.Component {
  state = {
    market: null,
    isLoading: true,
    isMarketOwner: false,
    isEmailVerified: false
  };

  componentDidMount() {
    this.handleGetMarket();

    const {
      attributes: { sub }
    } = this.props.user;

    
    try {
      this.createProductListener = API.graphql(graphqlOperation(onCreateProduct, { owner: sub }))
      .subscribe({
        next: productData => {  
          const createProduct = productData.value.data.onCreateProduct;
          const prevProducts = this.state.market.products.items.filter(
            item => item.id !== createProduct.id
          )
          const updatedProducts = [createProduct, ...prevProducts]
          const market = { ...this.state.market };
          market.products.items = updatedProducts;
          this.setState({ market });
        }
      })
    } catch (error) {
      console.error('error with onCreateProduct subscription', error)
    }

    try {
      this.updateProductListener = API.graphql(graphqlOperation(onUpdateProduct, { owner: sub } ))
      .subscribe({
        next: productData => {
          const updatedProduct = productData.value.data.onUpdateProduct
          const updatedProductIndex = this.state.market.products.items.findIndex(
            item => item.id === updatedProduct.id
          )    
        const updatedProducts = [
          ...this.state.market.products.items.slice(0, updatedProductIndex),
          updatedProduct,
          ...this.state.market.products.items.slice(updatedProductIndex + 1)
        ]
        const market = { ...this.state.market };
        market.products.items = updatedProducts;
        this.setState({ market });
      }
      });
    } catch (error) {
      console.error("error with on update product subscription", error)
    }

    try {
      this.deleteProductListener = API.graphql(graphqlOperation(onDeleteProduct, { owner: sub } ))
      .subscribe({
        next: productData => {  
          const deletedProduct = productData.value.data.onDeleteProduct;
          const deletedProducts = this.state.market.products.items.filter(
            item => item.id !== deletedProduct.id
          )
          const market = { ...this.state.market };
          market.products.items = deletedProducts;
          this.setState({ market });
        }
      });
    } catch(error) {
      console.error('error with on delete product subscription', error)
    }
    
  }

  componentWillUnmount() {
    this.createProductListener.unsubscribe();
    this.updateProductListener.unsubscribe();
    this.deleteProductListener.unsubscribe();
  }

  handleGetMarket = async () => {
    const input = {
      id: this.props.marketId
    }
    const result = await API.graphql(graphqlOperation(getMarket, input));
    console.log(result.data.getMarket.owner);
    this.setState({market: result.data.getMarket, isLoading: false}, () => {
      this.checkMarketOwner();
      this.checkEmailVerified();
    });

  }

  checkMarketOwner = () => {
    const {user} = this.props;
    const {market} = this.state;
    if (user) {
      this.setState({isMarketOwner: user.username === market.owner})
    }
  }
  checkEmailVerified = () => {
    const {userAttributes} = this.props;
    if (userAttributes) {
      this.setState({isEmailVerified: userAttributes.email_verified})
    }
  }

  render() {
    const {market, isLoading, isMarketOwner, isEmailVerified} = this.state
    return isLoading ? (
      <Loading fullscreen={true} />
    ) : (
      <React.Fragment>
        <Link className='link' to='/'>
          Back to Markets List
        </Link>
        <span className='items.center pt-2'>
        <h2 className='mb-mr'>{market.name}</h2> - {market.owner}
        </span>
        <div className='items-center pt-2'>
        <span style={{color: 'var(--lightSquidInk)', paddingBottom: '1em'}}>
          <Icon name='date' className='icon' />
          {market.createdAt}
        </span>
        </div>

        <Tabs type='border-card' value={isMarketOwner ? "1" : "2"}>
          {isMarketOwner && (
            <Tabs.Pane label={
              <React.Fragment>
                <Icon name="plus" className="icon" />
                Agregar producto
              </React.Fragment>
            } name="1">
              {isEmailVerified ? (<NewProduct marketId={this.props.marketId}></NewProduct>) : (
                <Link to="/profile" className="header">
                  Verifica tu correo antes de agregar productos
                </Link>
              )}
            </Tabs.Pane>
          )}

          <Tabs.Pane label={
            <React.Fragment>
              <Icon name="menu" className="icon"></Icon>
              Productos ({
                market.products.items.length
              })
            </React.Fragment>
          } name="2">

             <div className='product-list'>
              {market.products.items.map(product => (
                <Product key={product.id} product={product}/>
              ))}

            </div>
 
          </Tabs.Pane>
        </Tabs>
      </React.Fragment>
    )
  }
}

export default MarketPage;

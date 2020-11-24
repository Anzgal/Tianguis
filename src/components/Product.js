import React from "react";
import {API, graphqlOperation} from 'aws-amplify';
// prettier-ignore
import { Notification, Popover, Button, Dialog, Card, Form, Input, Radio } from "element-react";
import { S3Image } from 'aws-amplify-react';
import {updateProduct, deleteProduct} from '../graphql/mutations';
import {convertCentsToPesos, convertPesosToCents} from '../utils';
import {UserContext} from '../App';
import PayButton from './PayButton';
import { Link } from 'react-router-dom';



class Product extends React.Component {
  state = {
    description: "",
    price: "",
    shipped: false,
    updatedProductDialog: false,
    deleteProductDialog: false
  };

  handleUpdateProduct = async productID => {
    try {
      this.setState({updatedProductDialog: false})
      const {description, price, shipped} = this.state;
      const input = {
        id: productID,
        description,
        shipped,
        price: convertPesosToCents(price)
      }
      const result = await API.graphql(graphqlOperation(updateProduct, {input}))
      console.log({result});
      Notification({title: "Éxito", message:"El producto se actualizó con éxito", type:"success"})
    } catch (error) {
      console.error(`Hubo un error al actualizar el producto: ${productID}`, error);
    }
  }
  handleDeleteProduct = async productId => {
      
    try{
      this.setState({deleteProductDialog:false})
      const input = {
        id:productId
      }
      await API.graphql(graphqlOperation(deleteProduct, {input}))
      Notification({title: "Éxito", message:"El producto se eliminó con éxito", type:"success"})

    } catch(error){
      console.error(`Hubo un error al eliminar el producto: ${productId}`, error);
    }
  
  }
  
  render() {
    const { product } = this.props;
    const {updatedProductDialog, description, shipped, price, deleteProductDialog} = this.state;
    return (
      
      <UserContext.Consumer>
      
        {({user, userAttributes}) => {
          const isProductOwner = user && user.attributes.sub === product.owner;
          const isEmailVerified = userAttributes && userAttributes.email_verified;
          return(
          <div className="card-container">
          <Card bodyStyle={{ padding: 0, minWidth: '200px' }}>
          
            <S3Image 
              imgKey={product.file.key}
              theme={{
                photoImg: { maxWidth:'100%', maxHeight: '100%' }
              }}
            />
        
            <div className="card-body">
              <h3 className="m-0">{product.description}</h3>
              <div className="items-center">
                <img 
                  src={`https://img.icons8.com/${product.shipped ? "plasticine/.2x/in-transit.png" : "plasticine/.2x/handle-with-care.png"}`}
                  alt="Shipping Icon"
                  className="icon"
                />
                {product.shipped ? "Envío" : "Recoger"}
              </div>
              <div className="text-right">
                <span className="mx-1">
                  ${convertCentsToPesos(product.price)}
                </span>
                {isEmailVerified ? (!isProductOwner && (
                  <PayButton product={product} user={user} userAttributes={userAttributes}/>
                )): (
                  <Link to="/profile" className="link">
                    Verificar correo
                  </Link>
                )}
              </div>
            </div>
          </Card>
          <div className="text-center">
            {isProductOwner && (
              <React.Fragment>
                <Button type="warning" icon="edit" className="m-1" onClick={() => this.setState({updatedProductDialog: true, description:product.description, shipped: product.shipped, price: convertCentsToPesos(product.price)})} /> 
                <Popover placement="top" width="160" trigger="click" visible={deleteProductDialog} content={
                  <React.Fragment>
                    <p>¿Deseas eliminar el producto?</p>
                    <div className="text-right">
                      <Button size="mini" type="text" className="m-1" onClick={() => this.setState({deleteProductDialog: false})}>
                        Cancelar
                      </Button>
                      <Button type="primary" size="mini" className="m-1" onClick={() => this.handleDeleteProduct(product.id)}>
                        Confirmar
                      </Button>
                      
                    </div>
                  </React.Fragment>
                }>
                <Button type="danger" icon="delete" onClick={()=>this.setState({deleteProductDialog:true})} />
                </Popover>
              </React.Fragment>
            )}
          </div>

          <Dialog title="Editar producto" size="large" customClass="dialog" visible={updatedProductDialog} onCancel={()=> this.setState({ updatedProductDialog:false })}>
              <Dialog.Body>
                <Form labelPosition="top">

                  <Form.Item label="Editar descripción del producto">
                  <Input icon="information" value={description} placeholder="Descripción del producto" trim={true} onChange={description => this.setState({description})} />  

                  </Form.Item>
                  <Form.Item label="Editar precio del producto">
                    <Input value={price} type="number" icon="plus" placeholder="Precio" onChange={price => this.setState({price})} />  

                  </Form.Item>

                  <Form.Item label="Editar envío">
                    <div className="text-center">
                      <Radio value="true" checked={shipped === true} onChange={() => this.setState({shipped: true})}>
                        Envío
                      </Radio>
                      <Radio value="false" checked={shipped === false} onChange={() => this.setState({shipped: false})}>
                        Recoger
                      </Radio>
                    </div>  

                  </Form.Item >

                </Form>
              </Dialog.Body>
              <Dialog.Footer>
                <Button onClick={() => this.setState({updatedProductDialog: false})}>
                  Cancel
                </Button>
                <Button type="primary" onClick={() => this.handleUpdateProduct(product.id)}>
                  Confirmar
                </Button>
              </Dialog.Footer>
          </Dialog>

        </div>
        )
      }}

      
      
      </UserContext.Consumer>
    
    
    )
  }
}

export default Product;

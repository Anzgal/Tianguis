import React from "react";
import {Auth, API, graphqlOperation} from 'aws-amplify';
// prettier-ignore
import { Table, Button, Notification, MessageBox, Message, Tabs, Icon, Form, Dialog, Input, Card, Tag } from 'element-react';
import {convertCentsToPesos} from '../utils';

const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      email
      registered
      orders(sortDirection: DESC) {
        items {
          id
          createdAt
          updatedAt
          product {
            id
            owner
            price
            createdAt
            description
          }
          shippingAddress{
            city
            country
            address_line1
            address_state
            address_zip
          }
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;

class ProfilePage extends React.Component {
  state = { 
    email: this.props.userAttributes && this.props.userAttributes.email,
    emailDialog: false,
    verificationCode: "",
    verificationForm: false,
    orders: [],
    columns: [
      {prop: "name", width: "150" },
      {prop: "value", width: "330"},
      {prop: "tag", width: "150", render: row => {
        if (row.name === "Email") {
          const emailVerified = this.props.userAttributes.email_verified
          return emailVerified ? (
            <Tag type="success">Verificado</Tag>
          ) : (
            <Tag type="danger">No verificado</Tag>
          )
        }
      }},
      {prop: "operations", render: row => {
        switch (row.name) {
          case "Email":
             return(
               <Button onClick={() => this.setState({emailDialog: true})} type="info" size="small">
                 Editar
               </Button>
             )
              

          case "Borrar Perfil":
              return(
                <Button onClick={this.handleDeleteProfile} type="danger" size="small">
                  Eliminar
                </Button>
              )
              
        
          default:
            return;
            
        }
      }}

    ]
  };

  componentDidMount(){
    if (this.props.userAttributes) {
      this.getUserOrders(this.props.userAttributes.sub)
    }
  }
  getUserOrders = async userId => {
    const input = {
      id: userId
    }
    const result = await API.graphql(graphqlOperation(getUser,input))
    this.setState({orders: result.data.getUser.orders.items})
  }
  handleUpdateEmail = async () => {
    try {
      const updatedAttributes = {
          email: this.state.email
        }
        const result = await Auth.updateUserAttributes(this.props.user, updatedAttributes)
        if (result === "SUCCESS") {
          this.sendVerificationCode("email")
        }
      } catch (error) {
        console.error(error);
        Notification.error({
          title: "Error",
          message: "Ocurrió un error al actualizar el correo"
        })
      }
    
  };

  sendVerificationCode = async attr => {
    await Auth.verifyCurrentUserAttribute(attr)
    this.setState({verificationForm: true})
    Message({
      type: "info",
      customClass: "message",
      message: `Se envío un código de verificación al correo ${this.state.email}`
    })
  }
  handleVerifyEmail= async attr => {
    try {
      const result = await Auth.verifyCurrentUserAttributeSubmit(attr, this.state.verificationCode)
      Notification({
        title: "Éxito",
        message: "El corre fue actualizado con éxito",
        type: `${result.toLowerCase()}`
      })
    } catch (error) {
      console.error(error);
      Notification.error({
        title: "Error", 
        message: 'Error al actualizar el correo'
      })
    }
    setTimeout(() => window.location.reload(), 3000)
  }

  handleDeleteProfile = () => {
    MessageBox.confirm("¿Deseas borrar de forma permanente tu cuenta?", "Precaución",
      {
        confirmButtonText: "Borrar",
        cancelButtonText: "Cancelar",
        type: "warning"
      }
    ).then(
      async () => {
        try {
          await this.props.user.deleteUser()
        } catch (error) {
          console.error(error);
        }
      }
    ).catch(() => {
      Message({
        type: "info",
        message: "Se canceló la operación"
      })
    })




/*     MessageBox.confirm('This will permanently delete the file. Continue?', 'Warning', {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning'
    }).then(() => {
      Message({
        type: 'success',
        message: 'Delete completed!'
      });
    }).catch(() => {
      Message({
        type: 'info',
        message: 'Delete canceled'
      });
    }); */
  }

  render() {
    const {orders, columns, emailDialog, email, verificationForm, verificationCode} = this.state
    const {user, userAttributes} = this.props;
    return userAttributes && (
      <React.Fragment>
        <Tabs activeName="1" className="profile-tabs">
          <Tabs.Pane label={
            <React.Fragment>
              <Icon name="document" className="icon" />
              Resumen
            </React.Fragment>
          }
          name="1">
            <h2 className="header">Resumen del perfil</h2>

            <Table columns={columns} data={[
              {
                name: "Tu ID",
                value: userAttributes.sub
              },
              {
                name: "Nombre de Usuario",
                value: user.username
              },
              {
                name: "Email",
                value: userAttributes.email
              },
              {
                name: "Teléfono",
                value: userAttributes.phone_number
              },
              {
                name: "Borrar Perfil",
                value: "Adios vaquero"
              }
            ]}
            showHeader={false}
            rowClassName={
              row => row.name === "Borrar Perfil" && 'delete-profile'
            }
            />

          </Tabs.Pane>
          <Tabs.Pane label={
            <React.Fragment>
              <Icon name="message" className="icon"/>
              Órdenes
            </React.Fragment>
          }
          name="2">
            <h2 className="header">Lista de órdenes</h2>
            {orders.map(order =>(
              <div className="mb-1" key={order.id}>
                <Card>
                  <pre>
                    <p>Id de orden: {order.id} </p>
                    <p>Producto: {order.product.description} </p>
                    <p>Precio: ${convertCentsToPesos(order.product.price)} </p>
                    <p>Fecha de la orden: {order.createdAt} </p>
                    {order.shippingAddress && (
                      <React.Fragment>
                        Dirección de envío: 
                        <div className="ml-2">
                          <p>{order.shippingAddress.address_line1}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.address_state}, {order.shippingAddress.country}, {order.shippingAddress.address_zip}</p>
                        </div>
                      </React.Fragment>
                    )}
                  </pre>
                </Card>
              </div>
            ))}

          </Tabs.Pane>
        </Tabs>

        <Dialog size='large' customClass="dialog" title="Editar correo" visible={emailDialog} onCancel={() => this.setState({emailDialog:false})}>
          <Dialog.Body>
            <Form labelPosition="top">
              <Form.Item label="Email">
                <Input value={email} onChange={email => this.setState({email})} />
              </Form.Item>
              {verificationForm && (
                <Form.Item label="Ingrese el código de verificación" labelWidth="120">
                  <Input onChange={verificationCode => this.setState({verificationCode}) } value={verificationCode}/>
                </Form.Item>
              )}
            </Form>
          </Dialog.Body>
          <Dialog.Footer>
            <Button onClick={() => this.setState({emailDialog: false})}>
              Cancelar
            </Button>
            {!verificationForm &&  <Button type="primary" onClick={this.handleUpdateEmail}>
              Guardar
            </Button>}
            {
              verificationForm && (
                <Button type="primary" onClick={() => this.handleVerifyEmail('email')}>
                  Confirmar
                </Button>
              )
            }
          </Dialog.Footer>
        </Dialog>
      </React.Fragment>
    )
  }
}

export default ProfilePage;

import React from "react";
// prettier-ignore
import { Form, Button, Dialog, Input, Select, Notification } from 'element-react';
import { API, graphqlOperation } from 'aws-amplify';
import { createMarket } from '../graphql/mutations';
import { UserContext } from '../App';

class NewMarket extends React.Component {
  state = {
    name: "",
    tags: ["Frutas", "Verduras", "Artesanías"],
    selectedTags: [],
    options: [],
    addMarketDialog: false
  };

  handleAddMarket = async user => {
    try {
      this.setState({addMarketDialog: false})
      const input = {
        name: this.state.name,
        tags: this.state.selectedTags,
        owner: user.username
      };
      const result = await API.graphql(graphqlOperation(createMarket, {input}));
      console.log({result})
      console.info(`Created market: id ${result.data.createMarket.id}`);
      this.setState({name: "", selectedTags: []});
    } catch (error) {
      Notification.error({
        title: "Hubo un error",
        message: `${error.message || "Error al agregar el changarro"}`
      })
    }
    
  }

  handleFilterTags = query => {
    const options = this.state.tags.map(tag => ({value: tag, label: tag})).filter(tag=> tag.label.toLowerCase().includes(query.toLowerCase()))
    this.setState({options})
  }

  render() {
    return (
      <UserContext.Consumer>
      {({user}) =>  <React.Fragment>
        <div className='market-header'>
          <h1 className='market-title'>
            Crea tu changarro
            <Button type="text" icon="edit" className="market-title-button" onClick={ () => this.setState({ addMarketDialog:true }) }/>
          </h1>
        

        <Form inline={true} onSubmit={this.props.handleSearch} >
          <Form.Item>
            <Input placeholder="Buscar changarros" icon="circle-cross" value={this.props.searchTerm} onChange={this.props.handleSearchChange} onIconClick={this.props.handleClearSearch} />
          </Form.Item>

          <Form.Item>
            <Button type="info" icon="search" onClick={this.props.handleSearch} loading={this.props.isSearching}>
              Buscar
            </Button>
          </Form.Item>
        </Form>

        </div>

        <Dialog title="Creat nuevo changarro" visible={this.state.addMarketDialog} onCancel={() => this.setState({addMarketDialog:false})} size="large" customClass="dialog">
          <Dialog.Body>
            <Form labelPosition="top">
              <Form.Item label="Ingresar el nombre del changarro">
                <Input placeholder="Nombre del changarro" trim={true} onChange={name => this.setState({name})} value={this.state.name} />
              </Form.Item>
              <Form.Item label = "Agregar etiquetas">
                <Select multiple={true} filterable={true} placeholder="Etiquetas" onChange={selectedTags  => this.setState({selectedTags})} remoteMethod={this.handleFilterTags} remote={true}>
                {this.state.options.map(option => (
                  <Select.Option key={option.value} label={option.label} value={option.value} />
                ))}
                </Select>
              </Form.Item>
            </Form>
          </Dialog.Body>
          <Dialog.Footer>
            <Button onClick={() => this.setState({addMarketDialog: false})} >
              Cancelar
            </Button>

            <Button type="primary" onClick={() => this.handleAddMarket(user)} disabled={!this.state.name} >
              Agregar
            </Button>
          </Dialog.Footer>
        </Dialog>
      </React.Fragment>}
      </UserContext.Consumer>
    )
  }
}

export default NewMarket;

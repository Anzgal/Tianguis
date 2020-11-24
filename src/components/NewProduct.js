import React from "react";
// prettier-ignore
import { Form, Button, Input, Notification, Radio, Progress } from "element-react";
import {createProduct} from '../graphql/mutations';
import {PhotoPicker} from 'aws-amplify-react';
import {Auth, Storage, API, graphqlOperation} from 'aws-amplify';
import aws_exports from '../aws-exports';
import { convertPesosToCents } from '../utils';

const initialState = {
  description: "",
  price: "",
  shipped: false,
  imagePreview: "",
  image: "",
  isUploading: false,
  percentUploaded: 0
};
class NewProduct extends React.Component {
  state = {
    ...initialState
  };

  handleAddProduct = async () =>{
    try {
      //console.log(this.state);
      this.setState({isUploading: true});
      const visibility = "public";
      const {identityId} = await Auth.currentCredentials();
      const filename= `/${visibility}/${identityId}/${Date.now()}-${this.state.image.name}`;
      const uploadedFile = await Storage.put(filename, this.state.image.file, { 
        contentType: this.state.image.type,
        progressCallback: progress => {
          const percentUploaded = Math.round((progress.loaded/progress.total) * 100);
          this.setState({ percentUploaded });
        }
        
      });
      const file = {
        key: uploadedFile.key,
        bucket: aws_exports.aws_user_files_s3_bucket,
        region: aws_exports.aws_project_region
      }
      const input = {
        productMarketId: this.props.marketId,
        description: this.state.description,
        shipped: this.state.shipped,
        price: convertPesosToCents(this.state.price),
        file
      }
      const result = await API.graphql(graphqlOperation(createProduct, { input }));
      console.log('Producto subido con éxito', result);
      Notification({
        title: "Éxito",
        message: "Pruducto creado exitosamentes!",
        type: "success"
      })
      this.setState({...initialState});
    } catch (error) {
      console.error('Error adding new Product', error);
    }
    
  }

  render() {
    const {shipped, imagePreview, description, price, image, isUploading, percentUploaded} = this.state;
    return (
      <div className="flex-center">
        <h2 className="header">Agregar nuevo producto</h2>
        <div>
          <Form className="market-header">
            <Form.Item label="Agregar descripción del producto">
              <Input value={description} type="text" icon="information" placeholder="Descripción" onChange={description => this.setState({description})} />  

            </Form.Item>
            <Form.Item label="Agregar precio del producto">
              <Input value={price} type="number" icon="plus" placeholder="Precio" onChange={price => this.setState({price})} />  

            </Form.Item>

            <Form.Item label="Ofrecer envío?">
              <div className="text-center">
                <Radio value="true" checked={shipped === true} onChange={() => this.setState({shipped: true})}>
                  Si
                </Radio>
                <Radio value="false" checked={shipped === false} onChange={() => this.setState({shipped: false})}>
                  No
                </Radio>
              </div>  

            </Form.Item >
            {imagePreview && (
              <img className="image-preview" src={imagePreview} alt="Product Preview" />
            )}

              {
                percentUploaded > 0 && (
                <Progress 
                  type= "circle"
                  className="progress"
                  status="success"
                  percentage={percentUploaded}
                />
                )
              }
            <PhotoPicker onPick={file => this.setState({image: file}) } title="Imagen del producto" preview="hidden" onLoad={url => this.setState({imagePreview: url})} theme={
              {
                formContainer: {
                  margin: 0,
                  padding: '0.8em'
                },
                sectionHeader: {
                  padding: '0.2em',
                  color: 'var(--darkAmazonOrange)'
                },
                sectionBody: {
                  margin: 0,
                  width: "250px"
                },
                formsection: {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }
              }
            }/>
            <Form.Item>
              <Button disabled={!image || !description || !price || isUploading} type="primary" onClick={this.handleAddProduct} loading={isUploading}>
                {isUploading ? 'Subiendo...' : 'Agregar producto'}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    )
  }
}

export default NewProduct;

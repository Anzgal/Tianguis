/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createMarket = /* GraphQL */ `
  mutation CreateMarket(
    $input: CreateMarketInput!
    $condition: ModelMarketConditionInput
  ) {
    createMarket(input: $input, condition: $condition) {
      id
      name
      products {
        items {
          id
          description
          price
          shipped
          owner
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
export const updateMarket = /* GraphQL */ `
  mutation UpdateMarket(
    $input: UpdateMarketInput!
    $condition: ModelMarketConditionInput
  ) {
    updateMarket(input: $input, condition: $condition) {
      id
      name
      products {
        items {
          id
          description
          price
          shipped
          owner
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
export const deleteMarket = /* GraphQL */ `
  mutation DeleteMarket(
    $input: DeleteMarketInput!
    $condition: ModelMarketConditionInput
  ) {
    deleteMarket(input: $input, condition: $condition) {
      id
      name
      products {
        items {
          id
          description
          price
          shipped
          owner
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
export const createProduct = /* GraphQL */ `
  mutation CreateProduct(
    $input: CreateProductInput!
    $condition: ModelProductConditionInput
  ) {
    createProduct(input: $input, condition: $condition) {
      id
      description
      market {
        id
        name
        products {
          nextToken
        }
        tags
        owner
        createdAt
        updatedAt
      }
      file {
        bucket
        region
        key
      }
      price
      shipped
      owner
      createdAt
      updatedAt
    }
  }
`;
export const updateProduct = /* GraphQL */ `
  mutation UpdateProduct(
    $input: UpdateProductInput!
    $condition: ModelProductConditionInput
  ) {
    updateProduct(input: $input, condition: $condition) {
      id
      description
      market {
        id
        name
        products {
          nextToken
        }
        tags
        owner
        createdAt
        updatedAt
      }
      file {
        bucket
        region
        key
      }
      price
      shipped
      owner
      createdAt
      updatedAt
    }
  }
`;
export const deleteProduct = /* GraphQL */ `
  mutation DeleteProduct(
    $input: DeleteProductInput!
    $condition: ModelProductConditionInput
  ) {
    deleteProduct(input: $input, condition: $condition) {
      id
      description
      market {
        id
        name
        products {
          nextToken
        }
        tags
        owner
        createdAt
        updatedAt
      }
      file {
        bucket
        region
        key
      }
      price
      shipped
      owner
      createdAt
      updatedAt
    }
  }
`;
export const registerUser = /* GraphQL */ `
  mutation RegisterUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    registerUser(input: $input, condition: $condition) {
      id
      username
      email
      registered
      orders {
        items {
          id
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const updateuser = /* GraphQL */ `
  mutation Updateuser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateuser(input: $input, condition: $condition) {
      id
      username
      email
      registered
      orders {
        items {
          id
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const creteOrder = /* GraphQL */ `
  mutation CreteOrder(
    $input: CreateOrderInput!
    $condition: ModelOrderConditionInput
  ) {
    creteOrder(input: $input, condition: $condition) {
      id
      product {
        id
        description
        market {
          id
          name
          tags
          owner
          createdAt
          updatedAt
        }
        file {
          bucket
          region
          key
        }
        price
        shipped
        owner
        createdAt
        updatedAt
      }
      user {
        id
        username
        email
        registered
        orders {
          nextToken
        }
        createdAt
        updatedAt
      }
      shippingAddress {
        city
        country
        address_line1
        address_state
        address_zip
      }
      createdAt
      updatedAt
    }
  }
`;

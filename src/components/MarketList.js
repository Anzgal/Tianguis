import React from "react";
import {Connect} from 'aws-amplify-react'
import { onCreateMarket } from '../graphql/subscriptions';
import { listMarkets } from '../graphql/queries';
import { graphqlOperation } from 'aws-amplify';
import Error from './Error';
import {Link} from 'react-router-dom';

import { Loading, Card, Icon, Tag } from "element-react";

const MarketList = ({searchResults}) => {
  const onNewMarket = (prevQuery, newData) => {
    let updatedQuery = {...prevQuery};
    const updatedMarketList = [
      newData.onCreateMarket,
      ...prevQuery.listMarkets.items
    ]
    updatedQuery.listMarkets.items = updatedMarketList;
    return updatedQuery;
  }
  return (
    <Connect query={graphqlOperation(listMarkets)} subscription={graphqlOperation(onCreateMarket)} onSubscriptionMsg={onNewMarket} >

      {
        ({data, loading, errors }) => {

          if (errors.length > 0) return <Error errors={errors} />
          if (loading || !data.listMarkets) return <Loading fullscreen={true}/>
          
          const markets = searchResults.length > 0 ? searchResults : data.listMarkets.items;

          return(
            <React.Fragment>
              {searchResults.length > 0 ? (
                <h2 className="text-green">
                  <Icon type="success" name="check" className="icon"></Icon>
                  {searchResults.length} Resultados
                </h2>
              ) : ( <h2 className="header">
                <img src="https://www.flaticon.es/svg/static/icons/svg/3752/3752599.svg" alt="directory" className="large-icon"/>
                Changarros
              </h2>)}
              {markets.map(market => (
                <div key={market.id} className="my-2">
                  <Card bodyStyle={{padding: "0.7em", display:"flex",alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <span className="flex">
                        <Link className="link" to={`/markets/${market.id}`}>
                          {market.name}
                        </Link>

                        <span style={{color: 'var(--darkAmazonOrange)'}}>
                          {market.products.items ? market.products.items.length : 0}
                        </span>

                        <img src='https://www.flaticon.es/svg/static/icons/svg/891/891462.svg' alt="shopping cart" className="large-icon"/>

                      </span>
                      <div style={{color: "var(--lightSquidInk)"}}>
                        {market.owner}
                      </div>

                    </div>
                      <div>
                      {market.tags && market.tags.map(tag => (
                        <Tag key={tag} type="danger" className="mx-1">
                          {tag}
                        </Tag>
                      ))}
                      </div>
                    
                  </Card>
                </div>
              ))}
            </React.Fragment>
          );
        }
      }

    </Connect>
  );
};

export default MarketList;

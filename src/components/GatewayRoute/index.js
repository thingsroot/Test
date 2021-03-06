import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { isAuthenticated } from '../../utils/Session';
import OEM from '../../assets/OEM';
const GatewayRoute = ({component: Component, ...rest}) => (
  <Route {...rest}
      render={(props) => {
        document.title = rest.title ? OEM.Title + ' · ' + rest.title : OEM.Title;
        return (
          !!isAuthenticated()
          ? <Component {...Object.assign({mqtt: rest.mqtt, gateway: rest.gateway, ...rest}, props)} />
          : <Redirect to={{
              pathname: '/login',
              state: {from: props.location}
          }}/>
      )
      }}
  />
)

export default GatewayRoute
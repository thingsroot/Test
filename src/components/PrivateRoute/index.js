import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { isAuthenticated } from '../../utils/Session';
import OEM from '../../assets/OEM';
const PrivateRoute = ({component: Component, ...rest}) => (
  <Route {...rest}
      render={(props) => {
        document.title = rest.title ? OEM.Title + ' · ' + rest.title : OEM.Title + ' · ' + OEM.Companies;
        return (
          !!isAuthenticated()
          ? <Component {...props} />
          : <Redirect to={{
            pathname: '/login',
            state: {from: props.location}
          }}/>
      )
      }}
  />
)

export default PrivateRoute
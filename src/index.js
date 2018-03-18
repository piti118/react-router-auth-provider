// @flow
import React, { Component } from 'react'
import type { Node, ComponentType } from 'react'
import PropTypes from 'prop-types';
import { getContext } from 'recompose';
import {
  Route,
  withRouter,
} from 'react-router-dom'
import type { AxiosPromise } from 'axios'

type Props<WhoAmIResponse, AuthInfo> = {
  whoami: () => AxiosPromise<any>,
  getAuthInfo: WhoAmIResponse => AuthInfo,
  logout: () => AxiosPromise<any>,
  loadingComponent: ComponentType<any>,
  redirectOnLogout: string | null,
  history: any,
  children?: Node,
}

type State<T> = {
  ready: boolean,
  isLoggedIn: boolean,
  authInfo: ?T
}

function Blank() {
  return null
}

export class AuthProvider<WhoAmIResponse, AuthInfo>
  extends Component<Props<WhoAmIResponse, AuthInfo>,
    State<AuthInfo>> {

  static defaultProps = {
    getAuthInfo: (x: WhoAmIResponse) => x,
    loadingComponent: Blank,
    redirectOnLogout: null
  };

  constructor(props: Props<WhoAmIResponse, AuthInfo>) {
    super(props)
    this.state = {
      ready: false,
      isLoggedIn: false,
      authInfo: null
    };
  }

  onLoginSuccess = (authInfo: AuthInfo, cb?: () => any) => {
    this.setState({ authInfo, isLoggedIn: true }, cb)
  }

  onLogout = (cb?: (cb?: () => any) => any) => {
    this.props.logout().then(() => {
        this.setState({ authInfo: null, isLoggedIn: false }, () => {
          if (cb) {
            cb(
              () => {
                if (this.props.redirectOnLogout) {
                  this.props.history.push(this.props.redirectOnLogout)
                }
              }
            )
          } else {
            if (this.props.redirectOnLogout) {
              this.props.history.push(this.props.redirectOnLogout)
            }
          }
        })
      }
    )
      .catch(err => console.error(err))
  }

  getChildContext = () => {
    return {
      isLoggedIn: this.state.isLoggedIn,
      authInfo: this.state.authInfo,
      onLoginSuccess: this.onLoginSuccess,
      onLogout: this.onLogout
    }
  }

  static
  childContextTypes = {
    isLoggedIn: PropTypes.bool,
    authInfo: PropTypes.object,
    onLoginSuccess: PropTypes.func,
    onLogout: PropTypes.func,
  }

  componentDidMount() {
    this.props.whoami()
      .then(({ data }) => {
        const authInfo = this.props.getAuthInfo(data)
        this.setState({ authInfo: authInfo, isLoggedIn: true, ready: true })
      })
      .catch(err => {
        if (err.response.status === 401) {
          this.setState({ authInfo: null, isLoggedIn: false, ready: true })
        } else {
          console.error(err)
        }
      })
  }

  render() {
    const LoadingComponent = this.props.loadingComponent
    if (!this.state.ready) {
      return <LoadingComponent />
    } else {
      return this.props.children
    }
  }
}


type AuthRouteProps<AuthInfo> = {
  //from withAuth
  loggedIn: bool,
  authInfo: AuthInfo,
  //from withRouter
  history: any,
  //own props
  path: string,
  component: ComponentType<any>,
  loginRoute: string,
  roleCheck: (AuthInfo) => bool,
}

class AuthRouteBase<AuthInfo> extends Component<AuthRouteProps<AuthInfo>> {

  static defaultProps = {
    roleCheck: () => true
  }

  render() {
    const { loggedIn, loginRoute, path, authInfo, roleCheck } = this.props
    const Component = this.props.component
    return (<Route exact path={path} render={props => {
      if (loggedIn && roleCheck(authInfo)) {
        return <Component {...props} />
      } else {
        this.props.history.replace(loginRoute, { from: props.location })
        return null
      }
    }} />)
  }
}

export const withAuth = getContext(AuthProvider.childContextTypes)
export const AuthRoute = withRouter(withAuth(AuthRouteBase))
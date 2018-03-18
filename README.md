# react-router-auth-provider

A simple authorization context provider
for react-router with redirection.

## Install
```
npm install --save react-router-auth-provider
```
or
```
yarn add react-router-auth-provider
```

## Usage

react-router-auth-provider consists of ``<AuthProvider/>``, ``<AuthRoute/>`` and HOC ``withAuth``.
Easiest way to see how it works together is to head over to [example](https://github.com/piti118/react-router-auth-provider-example)

## API

### AuthProvider
AuthProvider is a React.Component whose purpose is to provide all the necessary
authorization information and function. The props are
- `whoami: ()=>AxiosPromise(WhoAmIResponse)` a function to GET whoami information. Only run once on component did mount to check if 
the cookies associated with this session is already logged in for not. The backend should response with 200 on success
and 401 on not authorized. The json body is then passed through getAuthInfo before saving it to the context. Simplest way
to do this is to just do `() => axios.get('/api/whoami')`.
- `getAuthInfo: WhoAmIResponse=>AuthInfo` a function to convert `WhoAmIResponse` to `AuthInfo`. This is optional.
The default value is identity function which means whatever whoami returns will be saved to `authInfo` context.
- `logout: ()=>AxiosPromise<any>` a function to call logout. Simplest way to do this is to do
`axios.get('/api/logout')`
-  `loadingComponent: ComponentType<any>` a react component to show when the it is waiting for
`whoami` to respond. Default is Blank.
- `redirectOnLogout: string|null` a path to redirect to after logout. If `null` it stays on the same route.
which typically if it's inside `AuthRoute` it will redirect to login.

### AuthRoute
`AuthRoute` is a wrapper around react-router's `Route` which shows the component if user is autorized. Otherwise it will
redirect the user to `loginRoute`. The props are

- `path:string` route's path
- `component` component to show if authorized.
- `loginRoute` route to redirect to when user is not autorized.
- `roleCheck: (AuthInfo) => bool` a function to check role. Default is `()=>true`. Which means
it only require login but does not perform role check.

### withAuth
A higher order component to provide grab the context from `AuthProvider`.
withAuth provides authorization the following props from the AuthProvider.

- `loggedIn: bool` boolean to check if user is logged in.
- `authInfo: object` authorization info object. This could contains stuff like username, roles etc.
- `onLoginSuccess: (authInfo: AuthInfo, cb?: () => any) => void` a function to call when loggin is successful 
to trigger update of `loggedIn` and `authInfo` with optional callback.
- `onLogout: (cb?: (cb?: () => any) => any) => any` a function to called with optional
callback when logout to trigger update of `loggedIn` and `authInfo`.




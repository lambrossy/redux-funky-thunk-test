import React from "react";
import ReactDOM from "react-dom";
import { createStore, applyMiddleware } from "redux";
import { Provider, connect } from "react-redux";
import thunk from "redux-thunk";
import funky from "redux-funky-thunk";
import { pipeP, objOf, merge, always, invoker, identity } from "ramda";
import "./styles.css";

const createUser = deps =>
  pipeP(
    postUser(deps),
    getUser(deps)
  );

const postUser = ({ fetch, dispatchAction, dispatchError }) => payload =>
  Promise.resolve(payload)
    .then(dispatchAction("POST_USER"))
    .then(JSON.stringify)
    .then(objOf("body"))
    .then(merge({ method: "POST" }))
    .then(fetch("https://jsonplaceholder.typicode.com/users"))
    .then(invoker(0, "json"))
    .then(dispatchAction("POST_USER_SUCCESS"));

const getUser = ({ fetch, dispatchAction, dispatchError }) => payload =>
  Promise.resolve(payload)
    .then(dispatchAction("GET_USER"))
    .then(always({}))
    .then(fetch(`https://jsonplaceholder.typicode.com/users/${payload.id}`))
    .then(invoker(0, "json"))
    .then(dispatchAction("GET_USER_SUCCESS"));

const action = ({ dispatchAction }) => payload =>
  Promise.resolve(payload).then(dispatchAction("HELLO"));

const mapState = identity;

const mapDispatch = funky({
  getUser,
  postUser,
  createUser,
  action
});

const App = connect(
  mapState,
  mapDispatch
)(props => (
  <div>
    <button onClick={_ => props.createUser({ name: "New user" })}>
      Create user
    </button>
    <button onClick={_ => props.getUser({ id: 1 })}>Get user</button>
    <button onClick={_ => props.action({ test: true })}>Action</button>
  </div>
));

const store = createStore(
  (s, a) => console.log(a) || s,
  {},
  applyMiddleware(
    thunk.withExtraArgument({
      fetch: url => options => window.fetch(url, options)
    })
  )
);

const rootElement = document.getElementById("root");

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement
);

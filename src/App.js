import React, { Component } from 'react';
import { Route, withRouter } from 'react-router-dom'
import axios from 'axios'
import './App.css';
import Login from './components/Login/Login.js';
import NavBar from './components/NavBar/NavBar.js';
import Home from './components/Home/Home.js';

axios.defaults.withCredentials = true;

class App extends Component {
  constructor() {
    super()
    this.state = {
      loggedIn: false,
      username: null,
      userID: null,
      loadedApi: false
    }

    this.getUser = this.getUser.bind(this)
    this.componentDidMount = this.componentDidMount.bind(this)
    this.updateUser = this.updateUser.bind(this)
  }

  componentDidMount() {
    this.getUser()
  }

  // Update user state from NavBar (logout)
  updateUser (userObject) {
    this.setState(userObject);
  }

  // Check if user is saved in server session, otherwise redirect to login 
  getUser() {
    axios.get(process.env.REACT_APP_API_URL + '/v1/account/').then(response => {
      if (response.data.user) {
        this.setState({
          loggedIn: true,
          username: response.data.user.username,
          userID: response.data.user._id,
          loadedApi: true
        });
      } else {
        this.setState({
          loggedIn: false,
          username: null,
          loadedApi: true,
          twitter: null
        })
        this.props.history.push("/login");
      }
    })
  }

  render() {
    return (
      <div className="App">
      <NavBar updateUser={this.updateUser} loggedIn={this.state.loggedIn} />
        {this.state.loadedApi &&
          <div>
            <Route
              exact path="/"
              render={() =>
                <Home
                username={this.state.username}
                userID={this.state.userID}
                loggedIn={this.state.loggedIn}
                />}
            />
            <Route
              path="/login"
              render={() =>
                <Login loggedIn={this.state.loggedIn}
                />}
            />
          </div>
        }
      </div>
    );
  }
}

export default withRouter(App);

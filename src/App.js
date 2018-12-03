import React, { Component } from 'react';
import { Route, Link, withRouter } from 'react-router-dom'
import axios from 'axios'
import logo from './logo.svg';
import './App.css';
import Signup from './components/sign-up';
import LoginForm from './components/login-form';
import Navbar from './components/navbar';
import Home from './components/home';

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

 updateUser (userObject) {
   console.log("updating!");
   console.log(userObject);
   this.setState(userObject);
 }

 getUser() {
   console.log("getting");
   axios.get('http://localhost:3005/v1/account/').then(response => {
     console.log('Get user response: ')
     console.log(response.data);
     console.log(response.data.user);
     if (response.data.user) {
       console.log('Get User: There is a user saved in the server session: ')

       this.setState({
         loggedIn: true,
         username: response.data.user.username,
         userID: response.data.user._id,
         loadedApi: true
       });
     } else {
       console.log('Get user: no user');
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
      <Navbar updateUser={this.updateUser} loggedIn={this.state.loggedIn} />
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
                <LoginForm
                  updateUser={this.updateUser}
                />}
            />
            <Route
              path="/signup"
              render={() =>
                <Signup/>}
            />
          </div>
        }
      </div>
    );
  }
}

export default withRouter(App);

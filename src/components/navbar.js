import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { Route, Link, withRouter } from 'react-router-dom'
import logo from '../logo.svg';
import '../App.css';
import axios from 'axios'

class Navbar extends Component {
    constructor() {
        super()
        this.logout = this.logout.bind(this)
    }

    logout(event) {
        event.preventDefault()
        console.log('logging out')
        axios.post(process.env.REACT_APP_API_URL + '/v1/account/logout').then(response => {
          console.log(response.data)
          if (response.status === 200) {
            this.props.updateUser({
              loggedIn: false,
              username: null
            })
          }
        }).catch(error => {
            console.log('Logout error')
        })
        this.props.history.push("/login");
      }

    render() {
        const loggedIn = this.props.loggedIn;
        console.log('navbar render, props: ')
        console.log(this.props);

        return (
            <div>

                <header className="navbar App-header" id="nav-container">
                <h1 className="App-title">stan scanner</h1>
                    <div className="col-4" >
                        {loggedIn ? (
                            <section className="navbar-section">
                              <Link to="/" className="btn btn-link text-secondary">
                                <span className="text-secondary">home </span>
                              </Link>
                              <Link to="#" className="btn btn-link text-secondary" onClick={this.logout}>
                                <span className="text-secondary">logout</span>
                              </Link>

                            </section>
                        ) : (
                                <section className="navbar-section">
                                    <Link to="/login" className="btn btn-link text-secondary">
                                      <span className="text-secondary">login </span>
				                            </Link>
                                    <Link to="/signup" className="btn btn-link">
                                      <span className="text-secondary">sign up </span>
				                             </Link>
                                </section>
                            )}
                    </div>
                    {/*<div className="col-4 col-mr-auto">
                    <div id="top-filler"></div>
                        <img src={logo} className="App-logo" alt="logo" />

                    </div>*/}
                </header>
            </div>

        );

    }
}

export default withRouter(Navbar);

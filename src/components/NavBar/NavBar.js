import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import axios from 'axios'

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
  }

  logout(event) {
    event.preventDefault();
    axios.post(process.env.REACT_APP_API_URL + '/v1/account/logout').then(response => {
      if (response.status === 200) {
        this.props.updateUser({
          loggedIn: false,
          username: null
        })
      }
    }).catch(error => {
        console.log('Logout error');
    })
    this.props.history.push("/login");
  }

  render() {
    const loggedIn = this.props.loggedIn;
    return (
      <div>
        <header className="navbar App-header">
        <h1 className="App-title">stan scanner</h1>
          <div>
              {loggedIn && (
                <section className="navbar-section">
                  <Link to="#" onClick={this.logout}>
                    logout
                  </Link>
                </section>
              ) }
          </div>
        </header>
      </div>
    );
  }
}

export default withRouter(NavBar);

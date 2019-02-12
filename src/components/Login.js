import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import axios from 'axios'

axios.defaults.withCredentials = true;

class Login extends Component {
    constructor() {
        super()
        this.state = {
            redirectTo: null
        }
    }

    handleTwitterSignIn(){
      axios.get(process.env.REACT_APP_API_URL + '/v1/account/auth/twitter').then(response => {
        console.log(response);
      });
    }

    render() {
        if (this.state.redirectTo) {
            return <Redirect to={{ pathname: this.state.redirectTo }} />
        } else {
            return (
                <div id="login">
                    <p>find friends nearby who stan the same things as you!</p>
                    <div id="twitter">
                        <a href={process.env.REACT_APP_API_URL + '/v1/account/auth/twitter'}>~sign in with twitter~</a>
                    </div>
                    <p>your username stays hidden to other users until you both approve each other</p>
                </div>
            )
        }
    }
}

export default Login

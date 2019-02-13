import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import axios from 'axios'

axios.defaults.withCredentials = true;

class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {
			redirectTo: null
		}
	}

	render() {
		if (this.state.redirectTo) {
			return <Redirect to={{ pathname: this.state.redirectTo }} />
		} else {
			return (
				<div id="login">
					<div id="definition">
						<p><strong>stan</strong><br></br>
						<em>noun. informal.</em><br></br>
						an overzealous or obsessive fan of a particular celebrity.</p>
					</div>
					<div id="twitter">
							<a href={process.env.REACT_APP_API_URL + '/v1/account/auth/twitter'}>~sign in with twitter~</a>
					</div>
					<p>find friends nearby who stan the same things as you!</p>
					<p>your username stays hidden to other users until you both approve each other</p>
				</div>
			);
		}
	}
}

export default Login

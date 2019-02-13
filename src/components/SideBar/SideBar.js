import React, { Component } from 'react'
import axios from 'axios'

axios.defaults.withCredentials = true;

class SideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fandomValue: '',
      nameValue: '',
      displayName: props.displayName,
      redirectTo: null
    }
  }

  handleFandomClick(){
    this.props.updateFandoms(this.state.fandomValue);
  }

  handleFandomClick(event) {
    this.setState({fandomValue: event.target.value});
  }

  handleNameClick(){
    this.updateDisplayName(this.state.nameValue);
  }

  handleNameChange(event) {
    this.setState({nameValue: event.target.value});
  }

  // Update user's display name
  updateDisplayName(nameValue){
    this.setState({
      displayName: nameValue
    });
    axios.post(process.env.REACT_APP_API_URL + '/v1/account/updateDisplayName/', {
      name: nameValue
    }).then(response => {
      // add case to handle errors
    });
  }

  render() {
    const fandomsList = this.props.fandoms.map((fandom) => {
      return (
        <div className="fandomBox" key={fandom}>
          {fandom}
        </div>
        );
    });
    return (
      <div id="sideBar">
        <p>stan list <span role="img" aria-label="emoji">✨</span></p>
        <div className="fandomGrid">{fandomsList}</div>
        <br></br>
        <div id="addFandom">
          <label>
            <input type="text" value={this.state.fandomValue} onChange={this.handleFandomClick.bind(this)} />
          </label>
          <button onClick={this.handleFandomClick.bind(this)}>add to stan list</button>
        </div>
        <p id="displayName">display name: {this.state.displayName}</p>
        <div id="changeDisplayName">
          <label>
            <input type="text" placeholder={this.state.displayName} value={this.state.nameValue} onChange={this.handleNameChange.bind(this)} />
          </label>
          <button onClick={this.handleNameClick.bind(this)}>change display name</button>
        </div>
      </div>
    )
  }
}

export default SideBar

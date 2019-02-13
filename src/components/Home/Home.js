import React, { Component } from 'react'
import SideBar from '../SideBar/SideBar.js';
import axios from 'axios'

const DEFAULT_MILES_MAX = 100;
const MILES_MIN = 0;

axios.defaults.withCredentials = true;

// Calculate distance in meters between 2 sets of coordinates 
function haversineDistance(lat1, lon1, lat2, lon2) {
  function toRad(x) {
    return x * Math.PI / 180;
  }
  var R = 6371; // km
  var x1 = lat2 - lat1;
  var dLat = toRad(x1);
  var x2 = lon2 - lon1;
  var dLon = toRad(x2);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c * 1000;
  return d;
}

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      twitter: '',
      displayName: '',
      nameValue: '',
      stans: [],
      fandoms: [],
      distance: DEFAULT_MILES_MAX,
      distanceInput: DEFAULT_MILES_MAX,
      latitude: 0,
      longitude: 0,
    }
  }

  componentDidMount(){
    if(this.props.loggedIn){
      this.getUser();
      this.getLocation();
    }
  }

  // Get user data from API
  getUser() {
    axios.get(process.env.REACT_APP_API_URL + '/v1/account/data').then(response => {
      if (response.data.username) {
        this.setState({
          latitude: response.data.last_known_location.coordinates[1],
          longitude: response.data.last_known_location.coordinates[0],
          fandoms: response.data.fandoms,
          twitter: response.data.twitter,
          displayName: response.data.display_name
        });
        this.findStansNearby();
      } else {
        console.log("No user data saved in server session.");
      }
    })
  }

  // Get most current location
  getLocation() {
    if (navigator.geolocation) {
      // Runs when user's location changes
      navigator.geolocation.watchPosition((position) => {
        var distance = haversineDistance(this.state.latitude, this.state.longitude, position.coords.latitude, position.coords.longitude);
        
        // Only update user location upon initialization or when user has moved more than 10 meters from initial location
        if(distance > 10){          
          this.setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          // Send updated location to database
          axios.put(process.env.REACT_APP_API_URL + '/v1/account/updateLocation/' +
            position.coords.latitude + '/' + position.coords.longitude).then(response => {});
        }
      });
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
  }

  // Clear current array of stans and repopulate it based on response from API
  findStansNearby(){
    this.setState({
      stans: []
    }, () => {
      axios.get(process.env.REACT_APP_API_URL + '/v1/account/me/' + this.state.distance * 1.609344).then(response => {
        this.setState({
          stans: response.data
        });
      });
    });
  }

  // Approve another user to view current user's twitter username 
  approveFriend(stanUsername){
    axios.get(process.env.REACT_APP_API_URL + '/v1/account/approve/' + stanUsername).then(response => {
      // console.log(response.data);
    });
  }

  // Retrieve twitter username from mutually approved user and open their twitter profile in a new tab
  sayHi(userID){
    axios.get(process.env.REACT_APP_API_URL + '/v1/account/sayHi/' + userID).then(response => {
      window.open('http://twitter.com/' + response.data.twitter, '_blank');
    });
  }

  // Refresh search for other users nearby once user has released distance slider
  handleDistanceClick(){
    this.setState({
      distance: this.state.distanceInput
    }, () => {
      this.findStansNearby();
    })
  }

  // Display current value of slider while still being dragged
  handleDistanceChange(event){
    this.setState({distanceInput: event.target.value});
  }

  // Add new fandom to user's fandoms and refresh search for other users nearby based on similar fandoms
  updateFandoms(value){
    if(!this.state.fandoms.includes(value)){
      axios.put(process.env.REACT_APP_API_URL + '/v1/account/addFandom/' + value.toLowerCase()).then(response => {
          console.log(response);
          this.setState({
            fandoms: response.data.fandoms
          });
          this.findStansNearby();
      });
    }
  }

  render() {
    // Sort array of users by nearest to furthest
    function compare(a,b) {
      var distanceA = parseFloat(a.distance);
      var distanceB = parseFloat(b.distance);
      if (distanceA < distanceB)
        return -1;
      if (distanceA > distanceB)
        return 1;
      return 0;
    }

    var { stans, fandoms } = this.state;

    // Build grid of nearby users with similar fandoms
    var stansList = stans.sort(compare).map((stan) => {
      var stanFandoms = stan.fandoms.map(s => s.trim());
      stanFandoms = stanFandoms.join(", ");
      return (
        <div className="stanOutline" key={stan.username}>
          <div className="stanBox">
            <div className="stanDetails">
              <p className="stanUsername"><strong>{stan.display_name}</strong></p>
              <p className="stanDistance">{stan.distance} miles away</p>
              <div className="stanActions">
                {/* Only show option to approve another user if they are not already approved */}
                {!stan.following && 
                  <button onClick={() => {this.approveFriend(stan.username)}}><span role="img" aria-label="emoji">🙏</span> shoot ur shot</button>}
                {/* Show friendship as pending if current user has approved but other user has not */}
                {stan.following 
                  && !stan.mutuals && <p><span role="img" aria-label="emoji">😌</span> (pending)</p>}
                {/* Show link to other user's twitter profile once both users have mutually approved eachother */}
                {stan.mutuals 
                  && <button onClick={() => {this.sayHi(stan._id)}}><span role="img" aria-label="emoji">😗🤝</span> say hi !</button>}
              </div>
            </div>
            <p className="stanFandoms">{stanFandoms}</p>
          </div>
        </div>
      );
    })

    return (
      <div id="home">
        <SideBar 
          displayName={this.state.displayName}
          fandoms={this.state.fandoms} 
          findStansNearby={this.findStansNearby.bind(this)}
          updateFandoms={this.updateFandoms.bind(this)}
        />
        <div id="mainContent">
          <div id="distanceInput">
            <p>hey {this.state.twitter}! your fellow stans within {this.state.distanceInput} miles are:</p>
            <div id="distanceSlider">
              <p>
                {MILES_MIN}
                <input 
                  onMouseUp={this.handleDistanceClick.bind(this)} 
                  onChange={this.handleDistanceChange.bind(this)} 
                  defaultValue={DEFAULT_MILES_MAX} 
                  type="range" min={MILES_MIN} max={DEFAULT_MILES_MAX} step="5"/>
                {DEFAULT_MILES_MAX}
              </p>
            </div>
          </div>
          <div id="stanWindow">
            <div id="stanGrid">{stansList}</div>
          </div>
        </div>
        <div id="rightSideBar">
          {/* Placeholder for future features */}
        </div>
      </div>
    );
  }
}

export default Home

import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import axios from 'axios'

axios.defaults.withCredentials = true;

function haversineDistance(lat1, lon1, lat2, lon2) {
  function toRad(x) {
    return x * Math.PI / 180;
  }
  var R = 6371; // km
  var x1 = lat2 - lat1;
  var dLat = toRad(x1);
  var x2 = lon2 - lon1;
  var dLon = toRad(x2)
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
  Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c * 1000;
  return d;
}

class AddForm extends Component {
  constructor(props) {
    super(props);
    this.state = {value: this.props.value};
  }

  render(){
    return(
      <div>
        <label>
          <input type="text" value={this.props.value} onChange={this.props.handleChange} />
        </label>
        <button onClick={this.props.handleClick}> Add new fandom </button>
      </div>
    );
  }
}

class DistanceForm extends Component {
  constructor(props) {
    super(props);
    this.state = {distanceInput: this.props.distanceInput};
  }

  render(){
    return(
      <div>
        <label>
          <input type="text" value={this.props.distance} onChange={this.props.handleChange} />
        </label>
        <button onClick={this.props.handleClick}> Set radius distance </button>
      </div>
    );
  }
}

class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
          stans: [],
          fandoms: [],
          value: '',
          distance: '10000',
          latitude: 0,
          longitude: 0,
        }
    }

    componentDidMount(){
      this.getUser();
      this.getLocation();
    }

    getUser() {
      console.log("getting data");
      axios.get('http://localhost:3005/v1/account/data').then(response => {
        console.log('Get user response: ')
        console.log(response.data);
        console.log(response.data.username);
        if (response.data.username) {
          console.log('Get User: There is user data saved in the server session: ')

          this.setState({
            latitude: response.data.last_known_location.coordinates[1],
            longitude: response.data.last_known_location.coordinates[0],
            fandoms: response.data.fandoms
          });

          this.findStansNearby();
          console.log("KABAAAAANG");
        } else {
          console.log('Get user data: no user');
        }
      })
    }

    getLocation() {
      if (navigator.geolocation) {
          navigator.geolocation.watchPosition((position) => {
            var distance = haversineDistance(this.state.latitude, this.state.longitude, position.coords.latitude, position.coords.longitude);
            if(distance > 10){
              console.log("User moved " + distance + " meters");
              console.log("Latitude: " + position.coords.latitude +
                " Longitude: " + position.coords.longitude);
              this.setState({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
              axios.put('http://localhost:3005/v1/account/updateLocation/' +
                          position.coords.latitude + '/' + position.coords.longitude).then(response => {
                console.log(response);
                console.log(response.data.coordinates);
                console.log("KABOOOOM");
                this.findStansNearby();

              });
            }
          });
      } else {
          console.log("Geolocation is not supported by this browser.");
      }
    }



    findStansNearby(){
      this.setState({
        stans: []
      }, () => {
        axios.get('http://localhost:3005/v1/account/me/' + this.state.distance * 1.609344).then(response => {
          console.log("Response here!!");
          console.log(response);
          for (let stan of response.data) {
            axios.get('http://localhost:3005/v1/following/mutual/' + this.props.username + '/' + stan.username).then(res => {
              console.log(res);
              var stanObj = {};
              stanObj.stan = stan;
              stanObj.mutuals = res.data.mutuals;
              var stanStore = this.state.stans;
              stanStore.push(stanObj);
              this.setState({
                stans: stanStore
              });
            });
          }
        });
      });
    }

    sayHi(userID){
      axios.get('http://localhost:3005/v1/account/sayHi/' + userID).then(response => {
        window.open('http://twitter.com/' + response.data.twitter, '_blank');
      });
    }

    handleClick(){
       this.updateFandoms();
     }
     handleChange(event) {
       this.setState({value: event.target.value});
     }

     handleDistanceClick(){
       this.setState({
         distance: this.state.distanceInput
       }, () => {
         this.findStansNearby();
       })
      }
      handleDistanceChange(event){
        this.setState({distanceInput: event.target.value});
      }

     updateFandoms(){
       axios.put('http://localhost:3005/v1/account/addFandom/' + this.state.value).then(response => {
         console.log(response);
         this.setState({
           fandoms: response.data.fandoms
         });
         this.findStansNearby();
       });
     }


    render() {
        const imageStyle = {
            width: 400
        }
        const { stans, fandoms } = this.state;
        const fandomsList = fandoms.map((fandom) => {
          return (
            <li key={fandom}>
              {fandom}
            </li>
            );
        })
        var stansList = stans.map((stan) => {
          var fandoms = stan.stan.fandoms.map(s => s.trim());
          fandoms = fandoms.join(", ");
          return (
            <div className="stanOutline">
              <div className="stanBox">
                <p>{stan.stan.username}</p>
                <p>{stan.stan._id}</p>
                <p>{fandoms}</p>
                <p>Mutuals: {stan.mutuals.toString()}</p>
                <p>Distance: {stan.stan.distance}</p>
                {!stan.mutuals &&<button onClick={() => {this.approveMe(stan.id)}}>approve</button>}
                {stan.mutuals &&<button onClick={() => {this.sayHi(stan.stan._id)}}>say hi</button>}
                <button onClick={() => {this.ignoreMe(stan.id)}}>ignore</button>
              </div>
            </div>
            );
        })

        return (
            <div className="body">
              <div className="sideBar">
                <p>It's good to be home {this.props.username} and {this.props.userID}</p>
                <p>in {this.state.latitude}, {this.state.longitude}</p>
                <p>Your fandoms are:</p>
                <ul>{fandomsList}</ul>
              </div>
              <div className="mainContent">
                <AddForm handleClick={this.handleClick.bind(this)} handleChange={this.handleChange.bind(this)} value={this.state.value}/>
                <DistanceForm handleClick={this.handleDistanceClick.bind(this)} handleChange={this.handleDistanceChange.bind(this)} distanceInput={this.state.distanceInput}/>
                <p>Your fellow stans within {this.state.distance} miles are:</p>
                <div className="stanWindow">
                  <div className="stanGrid">{stansList}</div>
                </div>
              </div>
            </div>
        )


    }
}

export default Home

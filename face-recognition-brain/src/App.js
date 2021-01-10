import React, {Component} from 'react';
import Navigation from './Components/Navigation/Navigation';
import './App.css';
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Rank from './Components/Rank/Rank';
import SignIn from './Components/SignIn/SignIn';
import Register from './Components/Register/Register';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';

const particlesOptions={
    particles: {
      number:{
        value:100,
        density:{
          enable:true,
          value_area:800
        }
      }
    }
}

const app=new Clarifai.App({
  apiKey:'06d276f994644eb4af4df2c2611623d2'
});

const initialState={
    input:'',
    imageUrl:'',
    box:{},
    route: 'signin',
    isSignedIn:false,
    user:{
      id:'',
      name:'',
      email:'',
      entries:0,
      joined: ''

    }
}

class App extends Component {
  constructor(){
    super();
    this.state=initialState;
  }

  loadUser=(data)=>{
    this.setState({user : {
      id:data.id,
      name:data.name,
      email:data.email,
      entries:data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation=(data)=>{
    const clarifaiFace=data.outputs[0].data.regions[0].region_info.bounding_box;
    const image=document.getElementById('inputimage');
    const width=Number(image.width);
    const height=Number(image.height);
    return{
      leftCol:clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width-(clarifaiFace.right_col * width),
      bottomRow: height-(clarifaiFace.bottom_row * height)

    }
  }

  displayFacaeBox=(box)=>{
    this.setState({box: box});
  }

  onInputChange=(event)=>{
    this.setState({input:event.target.value});
  }

  onButtonSubmit=()=>{
    this.setState({imageUrl:this.state.input});
    app.models.predict(Clarifai.FACE_DETECT_MODEL,this.state.input)
    .then(response=>{
      if(response){
        fetch('http://localhost:3000/image',{
          method:'put',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                id:this.state.user.id
            })
        })
        .then(response=>response.json())
        .then(count=>{
          this.setState(Object.assign(this.state.user,{entries:count}))
        })
        .catch(console.log);
      }
      this.displayFacaeBox(this.calculateFaceLocation(response))})
      .catch(err=>console.log(err))
  }

 onRouteChange=(route)=>{
   if(route==='signout'){
     this.setState(initialState);
   }
   else if(route==='home'){
     this.setState({isSignedIn:true});
   }
   this.setState({route:route});
 }


  render(){
    const{isSignedIn,imageUrl,route,box} = this.state;
    return (
      <div className="App">
        <Particles className='particles'
          params={particlesOptions}
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        {route==='home'
        ?
          <div>
          <Logo />
          <Rank name={this.state.user.name} entries={this.state.user.entries}/>
          <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
          <FaceRecognition box={box} imageUrl={imageUrl}/>
          </div>
        :(
          route==='signin'
          ?
            <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          :
            <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
         )
        }
      </div>
    );
  }
}

export default App;

import React, { Component } from 'react';
import client from './feathers';
import {Rating,Progress,Card,Form,Container,Label, Modal, Icon,Button,Divider} from 'semantic-ui-react'
import './App.css';
let vremenska_linija

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notes: [],
      modalLogin: true,
      appActive: true,
      status: [],
      feeds: [],
      currentsongStopWords: [],
      currentsong: [],
      watchwords: [],
      page: 0,
      feedUrls: [],
      hasMoreItems: false,
      searchTerm:'',
      activeItemMenu:'feeds',
      email:'',
      password:'',
      modalOpen:false,
      modalcurrentsongStopWords:false,
      modalWatchWords:false,
      lt:0,
      newFeedCount:0,
      newFeedCountAppend:false,
      loadingFeeds:false,
      selectedId:'',
      selectedIdScroll:'',
    };


    this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
    this.next = this.next.bind(this);
    this.rating = this.rating.bind(this);
    this.trackProgress = this.trackProgress.bind(this);
    this.trackElapsedLoop = this.trackElapsedLoop.bind(this);
  }

  componentDidMount() {
Promise.all([client.authenticate()]).then(([auth]) => {





      }).catch(error => {console.log(error)})

      client.on('logout', () => this.logoutClear())
    client.on('authenticated', login => {
      this.setState({email:"login.user.email",modalLogin:false})
    });

    // get feedUrls
    setInterval( checkPageFocus.bind(this), 5000 );

    function checkPageFocus() {
      if (document.hasFocus()) {
        // console.log("focus");
        if (!this.state.appActive){
        console.log("setState focus",this.state.appActive);
        this.setState({appActive:true})
        // this.weHaveFocus()
      }
      } else {
        // console.log("focus lost");
        if (this.state.appActive){
          this.setState({appActive:false})
          document.title = "Noter zzZZZZZ";
          console.log("setState lost focus",this.state.appActive);
        }

      }
    }

    client.service('play').find({
      query: {
        command:'status'
      }
      }).then((notes) => {
        // let uniq = []
        // let currentsongData = []
        // for (var i = 0; i < notes.data.length; i++) {
        //   if (uniq.indexOf(notes.data[i].word) === -1) {
        //     uniq.push(notes.data[i].word)
        //     currentsongData.push(notes.data[i])
        //   }
        // }
        // // let unique = [...new Set(notes.data.map(item => item.word))];
        this.setState({status:notes.status})
        this.setState({currentsong:notes.currentsong})
        this.trackProgress()
    });

    client.service('played').on('created', currentsong => {
      console.log("currentsong",currentsong);
      client.service('play').find({
        query: {
          command:'status'
        }
        }).then((notes) => {
          this.setState({status:notes.status})
          this.setState({currentsong:notes.currentsong})
          this.trackProgress()
      });

    });


  }


  handleLoginClose = () => this.setState({ modalLogin: false })
  handleLoginOpen = () => this.setState({ modalLogin: true })
  handleLoginChange = (e, { name, value }) => this.setState({ [name]: value })

  handleLoginSubmit() {
    const { email,password } = this.state
    console.log(email,password);
    client.authenticate({
      strategy: 'local',
      email: email,
      password: password
    }).then((result) => {
      console.log('Authenticated!', result);
      this.setState({email:"w",password:'',modalLogin:false})
      window.location.reload()
    }).catch((error)=>{
      console.error('Error authenticating!', error);
    });
   //  const { name, email } = this.state
    //
   //  this.setState({ submittedName: name, submittedEmail: email })
   }
  next(event) {
    let command=event.currentTarget.dataset.command
    let query = {command:command}
    if (command==='random') {
      let status = this.state.status.random
      query = {command:command,state:status==='1'?0:1}
    }
    client.service('play').find({
      query: query
      }).then((notes) => {
        console.log("notes");
        console.log(notes);
        // let uniq = []
        // let currentsongData = []
        // for (var i = 0; i < notes.data.length; i++) {
        //   if (uniq.indexOf(notes.data[i].word) === -1) {
        //     uniq.push(notes.data[i].word)
        //     currentsongData.push(notes.data[i])
        //   }
        // }
        // // let unique = [...new Set(notes.data.map(item => item.word))];
        if (notes.currentsong) {
          this.setState({currentsong:notes.currentsong})
        }
        if (notes.status) {
          this.setState({status:notes.status})
        }
    });
   }
rating(event,data){
  let currentsong = this.state.currentsong

  let rating = data.rating
  currentsong.favorite = rating
  this.setState({currentsong:currentsong})
  if (rating>0) {
    client.service('favorite').create({
      file: this.state.currentsong.file
      }).then((notes) => {
        console.log(notes);
    });
  }else {
    client.service('favorite').remove(null,{
      query:{file: this.state.currentsong.file}
      }).then((notes) => {
        console.log(notes);
    });
  }

}
  logoutClear =() =>{
    this.setState({
      email: '',
      password: '',
    })
    localStorage.clear();
    window.location.reload()
  }

  trackProgress(){
    let trackDuration = parseInt(this.state.status.duration,10)
    let trackelapsed = parseInt(this.state.status.elapsed,10)
    let trackOnePercent = trackDuration / 100
    var positionIpercent = (trackelapsed / trackDuration) * 100
    // let c = 0
    // while (c < positionIpercent) {
    //   console.log(c);
    //   c++
    // }
    if (this.state.status.state==='play') {
        this.trackElapsedLoop(positionIpercent,trackOnePercent)
    }
    this.setState({curentTrackPercentage:Math.round(positionIpercent)})



    // this.setState({curentTrackPercentage:Math.round(positionIpercent)})
  }

  trackElapsedLoop(positionIpercent,trackOnePercent) {

  clearInterval(vremenska_linija)
   vremenska_linija = setTimeout(function() {
     positionIpercent++;
     if (positionIpercent < 100) {
       this.trackElapsedLoop(positionIpercent,trackOnePercent);

       this.setState({curentTrackPercentage:Math.round(positionIpercent)})

     }
   }.bind(this), trackOnePercent * 1000)
}

render() {
    // console.log(this.state);
    // <Menu
    // size='small'
    // widths={1}
    // fixed={"top"}
    // fluid={true}
    // inverted={true}
    // borderless={false}
    // >
    //
    //
    //   <Dropdown item text="Menu">
    //     <Dropdown.Menu>
    //         <Dropdown.Header>User {this.state.email}</Dropdown.Header>
    //           <Dropdown.Item onClick={this.state.email?() => client.logout():this.handleLoginOpen } >
    //             <Icon  name='log out' />{this.state.email?'logout':'login'}</Dropdown.Item>
    //     </Dropdown.Menu>
    //   </Dropdown>
    //
    // </Menu>

    // const loaderIcon = <Loader size="mini" active inverted inline/>
    return (

      <div className="App">


      <p>&nbsp;</p>
      <p>&nbsp;</p>
<Modal
  open={this.state.modalLogin}
  onClose={this.handleLoginClose}
  closeIcon='close'>
  <Modal.Header>Login</Modal.Header>
  <Modal.Content >
  <Form onSubmit={this.handleLoginSubmit}>
      <Form.Field>
        <label>First Name</label>
        <Form.Input placeholder='Name' name='email' value={this.state.email} onChange={this.handleLoginChange} />
      </Form.Field>
      <Form.Field>
        <label>Password</label>
        <Form.Input type="password" placeholder='Password' name='password' value={this.state.password} onChange={this.handleLoginChange} />
      </Form.Field>

      <Button type='submit'>Login</Button>
    </Form>
  </Modal.Content>
</Modal>



      <Container text>
      <Card fluid={true} className="disable_select">
        <Card.Content extra>
          <a onClick={this.next} data-command="previous">
            <Icon name='arrow circle left' />
             prev
          </a>
          &nbsp;
          <a>
            <Icon name='pause' />
             pause
          </a>
          &nbsp;
          <a onClick={this.next} data-command="next">
            <Icon name='arrow circle right'/>
             next
          </a>
          &nbsp;
          <Divider/>
          <a onClick={this.next} data-command="random">
            <Icon name='random' color={this.state.status.random==='1'?'red':'green'}/>
             random
          </a>
        </Card.Content>
        <Progress percent={this.state.curentTrackPercentage}  indicating/>
      </Card>


      <Card fluid={true}>
        <Card.Content>
          <Card.Header>
            {this.state.currentsong.Artist}
          </Card.Header>
          <Card.Meta>
            <span className='date'>
            <Icon name='time' />   {Math.round(this.state.currentsong.Time/60)} min.
            </span>
          </Card.Meta>
          <Card.Description>
          {this.state.currentsong.Title} <Rating rating={this.state.currentsong.favorite} onRate={this.rating}/>
          <Divider/>
        <Label><Icon name='user' /> {this.state.currentsong.Artist}</Label>
        <p/>
        <Label><Icon name='folder' /> {this.state.currentsong.Album}</Label>
        <p/>
        <Label><Icon name='tag' /> {this.state.currentsong.Genre}</Label>
        <p/>
        <Label><Icon name='file' /> {this.state.currentsong.file}</Label>
          </Card.Description>
        </Card.Content>
        <Card.Content extra>
          <a>
            <Icon name='play' />
             played 22 times.
          </a>
        </Card.Content>
      </Card>




      </Container>

      </div>
    );
  }
}

export default App;

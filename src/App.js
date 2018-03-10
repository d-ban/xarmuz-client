import React, { Component } from 'react';
import client from './feathers';
import {Dropdown,Loader,List,Input,Image,Rating,Progress,Card,Form,Container,Label, Modal, Icon,Button,Divider} from 'semantic-ui-react'
import './App.css';
let vremenska_linija
let searchLunar
var searchValCache =""
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storageSearchResult: [],
      favs: [],
      modalLogin: true,
      appActive: true,
      status: [],
      nextsong: [],
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
      loading:false,
      selectedId:'',
      storageSearchResultTotal:'',
      selectedIdScroll:'',
      favTotal:'',
    };


    this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
    this.next = this.next.bind(this);
    this.rating = this.rating.bind(this);
    this.trackProgress = this.trackProgress.bind(this);
    this.trackElapsedLoop = this.trackElapsedLoop.bind(this);
    this.searchKeyUp = this.searchKeyUp.bind(this);
    this.runMe = this.runMe.bind(this);
    this.getStatus = this.getStatus.bind(this);
    this.getFavs = this.getFavs.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
Promise.all([client.authenticate()]).then(([auth]) => {



  this.getStatus()


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
          this.getStatus()
        // this.weHaveFocus()
      }
      } else {
        // console.log("focus lost");
        if (this.state.appActive){
          this.setState({appActive:false})
          document.title = "Hey, come back!";
          console.log("setState lost focus",this.state.appActive);
        }

      }
    }



    client.service('played').on('created', currentsong => {
      console.log("currentsong",currentsong);
      client.service('play').find({
        query: {
          command:'status'
        }
        }).then((notes) => {
         this.getStatus()
      });

    });
    client.service('favorite').on('created', favs => {
      this.getFavs()

    });

    client.service('favorite').on('removed', favs => {
      this.getFavs()

    });
    client.service('favorite').on('patched', favs => {
      this.getFavs()

    });


  }


  handleLoginClose = () => this.setState({ modalLogin: false })
  handleLoginOpen = () => this.setState({ modalLogin: true })
  handleLoginChange = (e, { name, value }) => this.setState({ [name]: value })

  getStatus(){
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
        this.setState({nextsong:notes.nextsong})
        document.title = notes.currentsong.Title;
        this.trackProgress()
        // this.getFavs()
    });
  }
  getFavs(){
    this.setState({loading:true})
    client.service('favorite').find({
      query: {
        $limit: 20,
        $sort: {
          playCount: -1
        },
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
        // this.setState({status:notes.status})
        // this.setState({currentsong:notes.currentsong})
        this.setState({storageSearchResult:notes.data,loading:false})
        this.setState({storageSearchResultTotal:notes.total})
        console.log(notes);
        // this.trackProgress()
    });
  }
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
    }else if (command==='playNext') {
      let path=event.currentTarget.dataset.path
      query = {command:command,path:path}
    }
    // console.log(event.currentTarget.dataset);

    client.service('play').find({
      query: query
      }).then((notes) => {
        console.log("notes");
        console.log(notes);
        this.getStatus()
        // let uniq = []
        // let currentsongData = []
        // for (var i = 0; i < notes.data.length; i++) {
        //   if (uniq.indexOf(notes.data[i].word) === -1) {
        //     uniq.push(notes.data[i].word)
        //     currentsongData.push(notes.data[i])
        //   }
        // }
        // // let unique = [...new Set(notes.data.map(item => item.word))];
        // if (notes.currentsong) {
        //   this.setState({currentsong:notes.currentsong})
        // }
        // if (notes.status) {
        //   this.setState({status:notes.status})
        // }
        // if (notes.nextsong) {
        //   this.setState({nextsong:notes.nextsong})
        // }
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

runMe(searchQuery) {
  console.log(searchQuery);
  Promise.all([
    client.service('storage').find({
      query:{
      $search: searchQuery,
      $limit: 500,
      $sort: {
        updatedAt: -1
      },
    }})
  ]).then(([lunrSearchResponse]) => {
    clearTimeout(searchLunar)
    searchLunar = setTimeout(function(event) {
      console.log("lunrSearchResponse",lunrSearchResponse);
      this.setState({loading: false,storageSearchResult:lunrSearchResponse.data,storageSearchResultTotal:lunrSearchResponse.total})
      // localStorage.lunarData = JSON.stringify(lunrSearchResponse)
      // this.getMetaForLunar(lunrSearchResponse)
    }.bind(this), 500)
  })
  console.log("run");
}

searchKeyUp(event) {


  clearTimeout(searchLunar)
  let searchQuery = "kidor*";
  if (event) {
    searchQuery = event.currentTarget.value;
  } else {
    searchQuery = this.state.searchQuery
  }
  this.setState({
    searchQuery: searchQuery
  })

  // console.log(searchValCache, searchQuery);
  if (searchQuery.length >= 3) {

    if (searchQuery !== searchValCache) {
      if (!this.state.loading) {
        this.setState({
          loading: true,
          queue: [],
          movingTrough: 'search'
        })
      }
      searchLunar = setTimeout(function(event) {
        this.runMe(searchQuery)
      }.bind(this), 500)
      searchValCache = searchQuery
    }
    else {
      if (this.state.loading) {
        clearTimeout(searchLunar)
        this.setState({
          loading: false,
          // queue: []
        })
      }
    }
  } else {
    console.log(this.state.loading);
    if (this.state.loading) {
      clearTimeout(searchLunar)
      this.setState({
        loading: false
      })
    }
    // if (searchQuery.length===0 ) {
    //   this.queueShow(this.state.queueSkip)
    //   this.interactWithSearch('searchValueEmpty')
    // }
  }
}

changeVol(value){
    console.log(value);
    client.service('play').find({
      query: {
        command:'vol',
        state:value
      }
      }).then((notes) => {
        console.log("notes");
        console.log(notes);
    });
    let status = this.state.status
    status.volume= value
    this.setState({
      status: status,
      // queue: []
    })
}
handleChange = (e, { value }) => this.changeVol(value)


render() {
  const loaderIcon = <Loader size="mini" active inline/>
  const stateOptions = [
    { key: '20', value: '30', text: '30' },
    { key: '40', value: '40', text: '40' },
    { key: '50', value: '50', text: '50' },
    { key: '60', value: '60', text: '60' },
    { key: '70', value: '70', text: '70' },
    { key: '80', value: '80', text: '80' },
    { key: '90', value: '90', text: '90' },
    { key: '100', value: '100', text: '100' },
  ]
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



      <Container >

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
          <Dropdown value={this.state.status.volume} onChange={this.handleChange} compact placeholder='Vol' search selection basic options={stateOptions} />

          <Divider/>

        </Card.Content>
        <Progress percent={this.state.curentTrackPercentage}  indicating/>
      </Card>

      <Card fluid={true} className={''} >
        <Card.Content>
          <Card.Header>
            {this.state.currentsong.Artist}
          </Card.Header>
          <Card.Meta>
            <span className='date'>
            <Icon name='time' />   {Math.round(this.state.currentsong.Time/60)} min.
            </span>
            <Image style={{borderRadius:'10px'}} src={'http://x.me:3031/images?file='+this.state.currentsong.file} size='medium' floated={'right'}  />
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
        <p/>
        <Label><Icon name='tag' /> {this.state.currentsong.Comment}</Label>
          </Card.Description>
        </Card.Content>
        <Card.Content extra>

       <a onClick={this.next} data-command="random">
         <Icon name='random' color={this.state.status.random==='1'?'red':'green'}/>
          random
       </a>

         &nbsp;
          <a onClick={this.next} data-command="next">
            <Icon name='play' />
            {this.state.nextsong.Artist} - {this.state.nextsong.Title}

          </a>
        </Card.Content>
      </Card>



      <Card fluid={true}  >
        <Card.Content extra>

<Input loading={this.state.loading?true:false} icon='search' fluid inverted placeholder={'search'} ref={(input) => { this.textInput = input; }} onChange={this.searchKeyUp}/>
<a onClick={this.state.searchQuery?'':this.getFavs} data-command="next" className="disable_select">
  <Icon name='list' />
  {this.state.searchQuery?this.state.searchQuery:'Favorites'} {this.state.loading?loaderIcon:''}
</a>
<span>{this.state.storageSearchResultTotal?<Icon name='play' />:''}  {this.state.storageSearchResultTotal} </span>
        </Card.Content>

        <List bulleted className={''}>
        {this.state.storageSearchResult.map( (row1, index1) => (

          <List.Item key={index1}  >
          <Image className="disable_select" onClick={this.next} data-command="playNext" data-path={row1.file} src={'http://x.me:3031/images?file='+row1.file} avatar={true}  />
          &nbsp; {row1.Artist} - {row1.Title} <small>{row1.file} </small>
          </List.Item>

        ))}
        </List>

      </Card>





      </Container>

      </div>
    );
  }
}

export default App;

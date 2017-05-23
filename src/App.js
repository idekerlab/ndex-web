import React, { Component } from 'react'
import './App.css'

import Save from './containers/Save'

class App extends Component {

  constructor() {
    super()
    this.state = {
      component: 'loading',
      parameters: {},
      profiles: [],
      selectedProfile: {}
    }
    this.loadComponentConfig()
  }

  loadComponentConfig() {
    fetch('http://localhost:1234/cyndex2/v1/status')
      .then((blob) => blob.json())
      .then((resp) => {
        console.log(resp)
        if (resp.errors.length !== 0) {
          this.setState({
            component: 'error'
          })
        } else {
          this.setState({
            component: resp.data.widget,
            parameters: resp.data.parameters
          })
        }
      })
  }

  handleProfileSelect = (profile) => {
    this.setState({selectedProfile: profile})
  }

  handleProfileAdd = (profile) => {
    console.log("Called add")
    console.log(profile)
    this.state.profiles.push(profile)
    this.setState({
      profiles: this.state.profiles,
      selectedProfile: profile
    })
  }

  handleProfileDelete = (profile) => {
    this.setState({
      profiles: this.state.profiles.filter((p) => p !== profile)
    })
  }

  handleProfileLogout = () => {
    if (Object.keys(this.state.selectedProfile).length !== 0) {
      this.setState({
        selectedProfile: {},
      })
    }
  }

  render() {
    const components = {
      error: Error,
      loading: Loading,
      choose: Choose,
      save: Save
    }
    const profileActions = {
      handleProfileSelect: this.handleProfileSelect,
      handleProfileAdd: this.handleProfileAdd,
      handleProfileDelete:this.handleProfileDelete,
      handleProfileLogout: this.handleProfileLogout
    }
    const Component = components[this.state.component]
    return (
      <div className="App">
        <Component
          profiles={this.state.profiles}
          selectedProfile={this.state.selectedProfile}
          {...this.state.parameters}
          {...profileActions}
        />
      </div>
    )
  }

}

const Error = () => <div>AN ERROR OCCURED. PLEASE CLOSE THIS WINDOW AND TRY AGAIN.</div>

const Loading = () => <div>LOADING</div>

const Choose = () => <div>CHOOSE</div>

export default App

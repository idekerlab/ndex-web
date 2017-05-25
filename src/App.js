import React, { Component } from 'react'
import './App.css'

import Save from './containers/Save'
import Choose from './containers/Choose'

class App extends Component {

  constructor() {
    super()
    this.state = {
      component: 'loading',
      parameters: {},
      profiles: JSON.parse(window.localStorage.getItem('profiles')) || [],
      selectedProfile: JSON.parse(window.localStorage.getItem('selectedProfile')) || {},
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
    window.localStorage.setItem('selectedProfile', JSON.stringify(profile))
  }

  handleProfileAdd = (profile) => {
    console.log("Called add")
    console.log(profile)
    this.state.profiles.push(profile)
    this.setState({
      profiles: this.state.profiles,
      selectedProfile: profile
    })
    window.localStorage.setItem('profiles', JSON.stringify(this.state.profiles))
  }

  handleProfileDelete = (profile) => {
    const profiles = this.state.profiles.filter((p) => p !== profile)
    this.setState({ profiles })
    window.localStorage.setItem('profiles', JSON.stringify(profiles))
  }

  handleProfileLogout = () => {
    if (Object.keys(this.state.selectedProfile).length !== 0) {
      this.setState({
        selectedProfile: {},
      })
    }
    window.localStorage.setItem('selectedProfile', '{}')
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

export default App

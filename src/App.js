import React, { Component } from 'react'
import './App.css'

import Save from './containers/Save'
import Choose from './containers/Choose'

import Waiting from './components/Waiting'

class App extends Component {

  constructor() {
    super();
    let params = window.location.search;
		let currentSuid = "current"
    if (params !== undefined) {
        params.substr(1).split("&").forEach(function(part) {
            let item = part.split('=');
            if ( item[0] === 'cyrestport') {
                let restport = parseInt(item[1], 10);
                if (!isNaN(restport))
                    window.restPort = restport;
            } else if (item[0] === 'mode') {
                window.cyndexMode=item[1];
            } else if (item[0] === 'suid'){
							  currentSuid = item[1]
						}
        });
    }
    this.state = {
      component: 'loading',
			errors: [],
			suid: currentSuid,
      parameters: {},
      profiles: JSON.parse(window.localStorage.getItem('profiles')) || [],
      selectedProfile: JSON.parse(window.localStorage.getItem('selectedProfile')) || {},
    }
	}

  loadComponentConfig() {
    fetch('http://localhost:' + (window.restPort || '1234') + '/cyndex2/v1/status')
      .then((blob) => blob.json())
      .then((resp) => {
        if (resp.errors.length !== 0) {
					const errors = resp.errors.map((v) => {
						return v.message;
					});
          this.setState({
            component: 'error',
						errors: errors,
          })
        } else {
          resp.data.parameters['suid'] = this.state.suid
					this.setState({
            component:  window.cyndexMode || resp.data.widget,
            parameters: resp.data.parameters
          })
        }
      }).catch((exc) => {
      	this.setState({component: 'cyrestError'})
      })
  }

  handleProfileSelect = (profile) => {
    if (!profile.hasOwnProperty('userId')){
    	this.updateProfile(profile)
		}else{
			this.setState({selectedProfile: profile})
   		window.localStorage.setItem('selectedProfile', JSON.stringify(profile))
		}
	}

  handleProfileAdd = (profile) => {
    this.state.profiles.push(profile)
    this.setState({
      profiles: this.state.profiles,
      selectedProfile: profile
    })
    window.localStorage.setItem('profiles', JSON.stringify(this.state.profiles))
    window.localStorage.setItem('selectedProfile', JSON.stringify(profile))
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


	updateProfile(profile){
		const main = this
		if (profile.hasOwnProperty('serverAddress') && profile.hasOwnProperty('userName') && !profile.hasOwnProperty('userId')){
		    if ( profile.userName !== "") {
                fetch(profile.serverAddress + "/v2/user?valid=true", {
                    headers: new Headers({
                        "Authorization": 'Basic ' + btoa(profile.userName + ':' + profile.password)
                    })
                }).then((response) => {
                    if (!response.ok) {
                        throw Error()
                    }
                    return response.json()
                }).then((blob) => {
                    const newProfile = Object.assign(profile, {
                        userId: blob.externalId,
                        firstName: blob.firstName,
                        image: blob.image
                    })
                    const profiles = main.state.profiles.filter((p) => p !== profile)
                    profiles.push(newProfile)
                    main.setState({profiles, selectedProfile: newProfile})
                    window.localStorage.setItem('profiles', JSON.stringify(profiles))
                    window.localStorage.setItem('selectedProfile', JSON.stringify(newProfile))
                }).catch((error) => {
                    alert("Unable to update profile from NDEx. Try logging in again")
                    main.handleProfileLogout(profile)
                    main.handleProfileDelete(profile)
                })
            } else {

                const profiles = main.state.profiles.filter((p) => p !== profile)
                profiles.push(profile)
                main.setState({profiles, selectedProfile: profile})
                window.localStorage.setItem('profiles', JSON.stringify(profiles))
                window.localStorage.setItem('selectedProfile', JSON.stringify(profile))
            }
		}
	}

	componentDidMount(){
		if (this.state.selectedProfile.hasOwnProperty('userName') && this.state.selectedProfile.userName !=="" ){
			this.handleProfileSelect(this.state.selectedProfile)
		}
    this.loadComponentConfig()
	}

    render() {

        const components = {
            error: Error,
            loading: Loading,
            choose: Choose,
            save: Save,
            cyrestError: CyRESTError
        };
        const profileActions = {
            handleProfileSelect: this.handleProfileSelect,
            handleProfileAdd: this.handleProfileAdd,
            handleProfileDelete: this.handleProfileDelete,
            handleProfileLogout: this.handleProfileLogout
        }
        const Component = components[this.state.component]
        return (
            <div className="App">
                <Component
										errors={this.state.errors}
                    profiles={this.state.profiles}
                    selectedProfile={this.state.selectedProfile}
                    {...this.state.parameters}
                    {...profileActions}
                />
            </div>
        )
    }

}

const Error = (props) => <Waiting text={props.errors ? "Unable to connect to CyNDEx2 app. Errors:\n" + props.errors.join(". ") :
		"An unknown error has occurred. Please restart Cytoscape, reinstall the app, or contact the app developers."}/>

const Loading = () => <Waiting text="Loading... this shoudn't take long, please restart the application if nothing appears after a minute."/>

const CyRESTError = () => <Waiting text="Unable to connect to CyREST. Is Cytoscape Automation available? Restart Cytoscape and try again."/>

export default App;

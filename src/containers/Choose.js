import React, { Component } from 'react'
import './Choose.css'

import Navbar from '../components/Navbar'
import Profile from '../components/Profile'
import Browser from '../components/Browser'
import SearchBar from '../components/SearchBar'
import Header from '../components/Header'
import Waiting from '../components/Waiting'

const RESULT_COUNT = 400

class Choose extends Component {

  constructor(props) {
    super(props)
    this.state = {
      term: this.props.searchTerm,
      numNetworks: -1,
      searchMode: 'all',
			networks: [],
      loading: false,
		}
	}

  handleTermChange = (term) => {
    this.setState({ term, networks:[], numNetworks: -1 })
  }

  componentDidMount() {
    document.title = "Browse NDEx";
    this.handleSearch()
  }

	signedIn = () => {
		return typeof this.props.selectedProfile === 'object' && this.props.selectedProfile.hasOwnProperty('userId')
	}

  handleSearch = (mode, profile) => {
		profile = profile || this.props.selectedProfile
		mode = (mode === 'all' || mode === 'mine') ? mode : this.state.searchMode
		this.setState((old) => { return {networks: [], numNetworks: -1, searchMode: mode}})
		if (!this.signedIn() || mode === 'all'){
			this.handleSearchTerm(this.state.term, profile)
			return
		}else{
			this.handleGetMyNetworks(this.state.term, profile)
		}
	}

	handleSearchTerm = (term = "", profile) => {
    profile = profile || this.props.selectedProfile
		let headers = { 'Content-Type': 'application/json'}
    if (profile !== undefined && profile.hasOwnProperty('userName') && profile.hasOwnProperty('password')) {
      headers['Authorization'] = 'Basic ' + btoa(profile.userName + ':' + profile.password)
    }
		const address = profile.serverAddress || 'http://ndexbio.org'

    fetch(address + '/v2/search/network?size=' + RESULT_COUNT, {
      method: 'POST',
      body: JSON.stringify({ searchString: term }),
      headers: new Headers(headers),
    }).then((response) => {
      return response.json()
    }).then((blob) => {
      this.setState({numNetworks: blob.numFound})
      return blob.networks
    }).then((networks) => {
      this.populate(networks)
		}).catch((error) => {
      this.setState({networks : [], numNetworks: 0})
      alert("CyNDEx2 was unable to connect to the NDEx server. Check your connection and try again. If the problem persists, contact the NDEx team")
    })
  }

  handleDownloadNetwork(networkId) {
    this.setState({ loading: true })
    let {
      serverAddress,
      userName,
      password,
    } = this.props.selectedProfile
    if (serverAddress === undefined) {
      serverAddress = "http://ndexbio.org"
    }
    const payload = JSON.stringify({
      username: userName,
      password: password,
      serverUrl: serverAddress + '/v2',
      uuid: networkId
    })
    fetch('http://localhost:' + (window.restPort || '1234') + '/cyndex2/v1/networks', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
				'Content-Type': 'application/json'
      },
      body: payload
    })
      .then((resp) => {
				if (!resp.ok){
          throw new Error(resp.statusText)
        }
        return resp
      })
      .then((blob) => blob.json())
      .then((resp) => {
        this.setState({ loading: false })
			})
      .catch((error) => {
				alert("An error occurred while trying to import the network. Reopen the browser and try again.")
        this.setState({loading:false})
      })
  }

	populate = (networks) => {
		if (networks === undefined) {
			networks = []
		} else {
			networks = networks.map((network) => ({
					_id: network.externalId,
					name: network.name,
					description: (network.description || '').replace(/<(?:.|\n)*?>/gm, ''),
					owner: network.owner,
					visibility: network.visibility,
					nodes: network.nodeCount,
					edges: network.edgeCount,
					created: network.creationTime,
					modified: network.modificationTime,
			}))
		}
		this.setState({ networks })
	}

	componentWillReceiveProps(newProps){
		if (!newProps['selectedProfile']){
			this.handleSearch('all', {serverAddress: 'http://ndexbio.org'})
		}
	}

	handleSearchMode = (newMode) => {
		this.setState({searchMode: newMode})
		this.handleSearch(newMode)
	}

	handleGetMyNetworks = (term, profile) => {
		profile = profile || this.props.selectedProfile
    if (profile.serverAddress === undefined) {
      profile = { serverAddress: "http://ndexbio.org" }
    }

		let headers = { 'Content-Type': 'application/json'}
    if (profile.hasOwnProperty('userName') && profile.hasOwnProperty('password')) {
      headers['Authorization'] = 'Basic ' + btoa(profile.userName + ':' + profile.password)
    }
    fetch(profile.serverAddress + '/v2/user/' + profile.userId + '/networksummary', {
      method: 'GET',
      headers: new Headers(headers),
    }).then((response) => {
			return response.json()
    }).then((networks) => {
			this.setState({numNetworks: networks.length})
    	this.populate(networks)
		})
    .catch((error) => {
			this.setState({networks : [], numNetworks: 0})
      alert("Unable to retrieve your networks from the NDEx server. Check your connection and try again. ")
      })
	}

  render() {
    const {
      profiles,
      selectedProfile,
      handleProfileAdd,
      handleProfileSelect,
      handleProfileDelete,
      handleProfileLogout
    } = this.props
    const {
      term,
			searchMode,
      numNetworks,
      networks,
    } = this.state
    const header= searchMode === 'mine' ? "Browsing My Networks" : ('Search Results' + (term === '' ? '' : ' for ' + term))
    const subtitle = numNetworks >= 0 ? ((numNetworks > RESULT_COUNT ? "Showing " + RESULT_COUNT + " out of " : "") + numNetworks + " hits") : "Loading results..."
		return (
      <div className="Choose">
        { this.state.loading ? <Waiting text="Loading network from NDEx... Please wait."/> : null}
        <Navbar>
          <SearchBar
						searchMode={searchMode}
            term={term}
            handleTermChange={this.handleTermChange}
            handleSearch={this.handleSearch}
          />
          <Profile
            profiles={profiles}
            selectedProfile={selectedProfile}
            onProfileAdd={(p) => {
							handleProfileAdd(p)
							this.handleSearch(this.state.searchMode, p)
						}}
            onProfileSelect={(p) => {
							handleProfileSelect(p)
							this.handleSearch(this.state.searchMode, p)
						}}
            onProfileDelete={handleProfileDelete}
            onProfileLogout={() => {
							handleProfileLogout()
							this.handleSearch('all', {serverAddress: 'http://ndexbio.org'})
						}}
          />
        </Navbar>
        <Header
          title={header}
          subtitle={subtitle}
        />
        <Browser
					searchMode={searchMode}
					handleSearchMode={this.handleSearchMode}
					profileSelected={this.signedIn()}

					networks={networks}
          onNetworkDownload={(networkId) => this.handleDownloadNetwork(networkId)}
				/>
      </div>
    )
  }
}

export default Choose

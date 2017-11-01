import React, { Component } from 'react'
import './Choose.css'

import Navbar from '../components/Navbar'
import Profile from '../components/Profile'
import Browser from '../components/Browser'
import SearchBar from '../components/SearchBar'
import Header from '../components/Header'
import Waiting from '../components/Waiting'

function filter(items, term) {
	if (term !== "") {
		return items.filter((item) => {
			for (var key in item) {
				if (String(item[key]).toLowerCase().includes(term.toLowerCase())) {
					return true
				}
			}
			return false
		})
	}
	return items
}

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
		return this.props.selectedProfile.hasOwnProperty('userId')
	}

  handleSearch = (mode, address) => {

		mode = (mode === 'all' || mode === 'mine') ? mode : this.state.searchMode
		this.setState((old) => { return {networks: [], numNetworks: -1, searchMode: mode}})
		address = address || this.props.selectedProfile.serverAddress
		if (!this.signedIn() || mode === 'all'){
			this.handleSearchTerm(this.state.term, address)
			return
		}else{
			this.handleGetMyNetworks(this.state.term)
		}
	}

	handleSearchTerm = (term = "", address) => {
    let profile = this.props.selectedProfile
		let headers = { 'Content-Type': 'application/json'}
    if (Object.keys(profile).length !== 0) {
      headers['Authorization'] = 'Basic ' + btoa(profile.userName + ':' + profile.password)
    }
		address = address || profile.serverAddress

    if (address === undefined) {
      address = "http://ndexbio.org"
    }
    fetch(address + '/v2/search/network?size=200', {
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
      alert("There's something wrong with your connection and we could not contact NDEx. Please try again after the issue has been resolved.")
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
				alert("There's something wrong with your connection and we were unable to import the network.\nPlease try again after the issue has been resolved.")
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
			this.handleSearch('all', 'http://ndexbio.org')
		}
	}

	handleSearchMode = (newMode) => {
		this.setState({searchMode: newMode})
		this.handleSearch(newMode)
	}

	handleGetMyNetworks = (term) => {
		let profile = this.props.selectedProfile
    let headers = { 'Content-Type': 'application/json'}
    if (Object.keys(profile).length !== 0) {
      headers['Authorization'] = 'Basic ' + btoa(profile.userName + ':' + profile.password)
    }
    if (profile.serverAddress === undefined) {
      profile = { serverAddress: "http://ndexbio.org" }
    }
    fetch(profile.serverAddress + '/v2/user/' + profile.userId + '/networksummary', {
      method: 'GET',
      headers: new Headers(headers),
    }).then((response) => {
			return response.json()
    }).then((networks) => {
      networks = filter(networks, term)
			this.setState({numNetworks: networks.length})
    	this.populate(networks)
		})
    .catch((error) => {
			this.setState({networks : [], numNetworks: 0})
      alert("There's something wrong with your connection and we could not contact NDEx. Please try again after the issue has been resolved.")
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
    const headerSuffix = term ? "for " + term : ""
    const subtitle = numNetworks >= 0 ? ((numNetworks > 200 ? "Showing 200 out of " : "") + numNetworks + " hits") : "Loading results..."
		return (
      <div className="Choose">
        { this.state.loading ? <Waiting text="Loading network from NDEx... Please wait."/> : null}
        <Navbar>
          <SearchBar
						disabled={searchMode === 'mine'}
            term={term}
            handleTermChange={this.handleTermChange}
            handleSearch={this.handleSearch}
          />
          <Profile
            profiles={profiles}
            selectedProfile={selectedProfile}
            onProfileAdd={(p) => {
							handleProfileAdd(p)
							this.handleSearch(this.state.searchMode, p.serverAddress)
						}}
            onProfileSelect={(p) => {
							handleProfileSelect(p)
							this.handleSearch(this.state.searchMode, p.serverAddress)
						}}
            onProfileDelete={handleProfileDelete}
            onProfileLogout={() => {
							handleProfileLogout()
							this.handleSearch('all', 'http://ndexbio.org')
						}}
          />
        </Navbar>
        <Header
          title={"Search results " + headerSuffix}
          subtitle={subtitle}
        />
        <Browser
					searchMode={searchMode}
					handleSearchMode={this.handleSearchMode}
					profileSelected={selectedProfile.hasOwnProperty('userId')}

					networks={networks}
          onNetworkDownload={(networkId) => this.handleDownloadNetwork(networkId)}
				/>
      </div>
    )
  }
}

export default Choose

import React, { Component } from 'react'
import './Save.css'
import copy from 'copy-to-clipboard'
import Navbar from '../components/Navbar'
import Profile from '../components/Profile'
import Waiting from '../components/Waiting'


class Save extends Component {

  constructor(props) {
    super(props)
    const hydrate = (field) => this.props[field] || ''
    this.state = {
      name: hydrate('name'),
			uuid: hydrate('uuid'),
      author: hydrate('author'),
      organism: hydrate('organism'),
      disease: hydrate('disease'),
      tissue: hydrate('tissue'),
      rightsHolder: hydrate('rightsHolder'),
      version: hydrate('version'),
			reference: hydrate('reference'),
      description: hydrate('description'),
			saveType: 'network',
			saving: false,
			public: false,
			updatable: false,
			overwrite: false,
      success: false,
    }
		this.networkData = {}
  }

	checkPermissions = (profile, saveType) => {
		const main = this;
		saveType = saveType || this.state.saveType
		if (profile.userId && this.networkData[saveType] && this.networkData[saveType]['uuid']){
			const uuid = this.networkData[saveType]['uuid']
			const userId = profile.userId
			const ndexUrl = profile.serverAddress
			const headers = {
        	'Accept': 'application/json',
        	'Content-Type': 'application/json',
					'Authorization': 'Basic ' + btoa(profile.userName + ":" + profile.password)
      	}
			fetch(ndexUrl + '/v2/user/' + userId + '/permission?networkid=' + uuid, {
				method: 'GET',
      	headers: headers
			})
			.then((resp) => resp.json())
			.then((resp) => {
				main.setState({updatable: resp[uuid] === 'ADMIN' || resp[uuid] === 'WRITE'})
			}).catch((ex) => {
				main.setState({updatable: false})
			})
		} else {
				this.setState({updatable: false})
		}
	}

	componentWillReceiveProps(props) {
		this.checkPermissions(props.selectedProfile)
	}

	loadData(){
		const main = this;
		fetch('http://localhost:' + (window.restPort || '1234') + '/cyndex2/v1/networks/current')
		.then((resp) => resp.json())
		.then((resp) => {
			let newData = {
				"collection": resp['data']['currentRootNetwork']
			}
			resp['data']['members'].forEach((member) => {
				if (member['suid'] === resp['data']['currentNetworkSuid']){
					newData['network'] = member
				}
			})
			main.networkData = newData
		}).then(() => {
			main.getAttributes()
			main.checkPermissions(main.props.selectedProfile)
		})
	}

	componentWillMount(){
		this.loadData()
	}

  componentDidMount() {
    document.title = "Save to NDEx";
	}

  closeWindow() {
  	window.frame.setVisible(false);
	}

  onSave() {
    const {
      serverAddress,
      userName,
      password,
    } = this.props.selectedProfile
    let method = 'POST'
    if (this.state.overwrite) {
      method = 'PUT'
    }
    const metadata = {
      name: this.state.name,
      author: this.state.author,
      organism: this.state.organism,
      version: this.state.version,
			disease: this.state.disease,
      tissue: this.state.tissue,
      rightsHolder: this.state.rightsHolder,
      reference: this.state.reference,
      description: this.state.description,
    }
    const payload = JSON.stringify({
        username: userName,
        password: password,
        serverUrl: serverAddress + '/v2',
        metadata: metadata,
        isPublic: this.state.public,
		})

		const suid = this.networkData[this.state.saveType]['suid']

    if (userName === undefined || userName === "") {
      alert("You must be logged with your NDEx username to save a network.")
      return
    }
    this.setState({ saving: true })
    fetch('http://localhost:' + (window.restPort || '1234') + '/cyndex2/v1/networks/' + suid, {
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: payload
    })
      .then((blob) => blob.json())
      .then((resp) => {
        if ((resp.errors.length) !== 0) {
          alert("Error saving: " + resp.errors[0].message || "Unknown")
          this.setState({saving: false})
        } else {
          this.saveImage(resp.data.suid, resp.data.uuid)
        }
      })

			/*.catch((error) => {
				alert(error)
        alert("There's something wrong with your connection and we could not save your network to NDEx.")
        this.setState({saving: false})
      })*/
  }

  saveImage(networkId, uuid) {
    fetch('http://localhost:' + (window.restPort || '1234') + '/v1/networks/' + networkId + '/views/first.png')
    .then((png) => png.blob())
    .then((blob) => {
      fetch('http://v1.image-uploader.cytoscape.io/' + uuid, {
        method: 'POST',
        headers: {
          'Content-Type': 'image/png',
        },
        body: blob
        })
        .then((resp) => {
          if (!resp.ok){
            throw new Error(resp.statusText)
          }
          this.setState({saving: false, 'uuid':uuid, 'success': true})
      }).catch((error) => {
        alert("Your network was saved, but an image could not be generated... the old image will be used instead.")
        this.setState({saving: false, 'uuid':uuid, 'success': true})
      });
    }).catch((error) => {
      alert("Your network was saved, but an image could not be generated... the old image will be used instead.")
      this.setState({saving: false, 'uuid':uuid, 'success': true})
    })
  }

  handleChangeName(e) {
    this.setState({ name: e.target.value })
  }

  handleChangeOverwrite(e) {
    this.setState({ overwrite: !this.state.overwrite })
  }

  handleChangeVisibility(e) {
    this.setState({ public: !this.state.public })
  }


  handleFieldChange(field) {
    return (e) => {
      let newState = {
        [field]: e.target.value
      }
      this.setState(newState)
    }
  }

	getAttributes = (saveType) => {
		saveType = saveType || this.state.saveType
		if (!this.networkData.hasOwnProperty(saveType))
			return {}
		const net = this.networkData[saveType]
		this.setState({
			author: net['props']['author'] || '',
			organism: net['props']['organism'] || '',
			disease: net['props']['disease'] || '',
			tissue: net['props']['tissue'] || '',
			rightsHolder: net['props']['rightsHolder'] || '',
			version: net['props']['version'] || '',
			reference: net['props']['reference'] || '',
			description: net['props']['description'] || '',
			name: net['name'] || '',
			saveType: saveType,
		})
		this.checkPermissions(this.props.selectedProfile, saveType)
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

		const disableSave = !this.props.selectedProfile.hasOwnProperty('serverAddress') || (this.state.public && (!this.state.name || !this.state.description || !this.state.version))

		return (
      <div className="Save">
        {this.state.saving ? <Waiting text={"Saving network " + this.props.name + " to NDEx..."}/> : null}
        {this.state.success &&
          <div className="success-modal">
            <p id="success-modal-message" onClick={() => {
              copy(this.state.uuid);
              alert("UUID Copied")
              this.closeWindow()}
            }>Network saved with UUID {this.state.uuid}. Click to copy.</p>
            <p id="success-modal-close" onClick={() => this.closeWindow()}>Click to close this window.</p>
          </div>
        }
        <Navbar>
          <Profile
            profiles={profiles}
            selectedProfile={selectedProfile}
            onProfileAdd={handleProfileAdd}
            onProfileSelect={handleProfileSelect}
            onProfileDelete={handleProfileDelete}
            onProfileLogout={handleProfileLogout}
          />
        </Navbar>
        <div className="Save-entryfields">
          <div className="Save-left">
            <LabelField
              value={this.state.author}
              onChange={this.handleFieldChange('author')}
              label="Author"
            />
            <LabelField
              value={this.state.organism}
              onChange={this.handleFieldChange('organism')}
              label="Organism"
            />
            <LabelField
              value={this.state.disease}
              onChange={this.handleFieldChange('disease')}
              label="Disease"
            />
            <LabelField
              value={this.state.tissue}
              onChange={this.handleFieldChange('tissue')}
              label="Tissue"
            />
            <LabelField
              value={this.state.rightsHolder}
              onChange={this.handleFieldChange('rightsHolder')}
              label="Rights Holder"
            />
            <LabelField
              value={this.state.version}
              onChange={this.handleFieldChange('version')}
              label="Version"
							required={this.state.public}
            />
            <TextareaField
              value={this.state.reference}
              onChange={this.handleFieldChange('reference')}
              label="Reference"
            />
          </div>
          <div className="Save-right">
            <TextareaField
              value={this.state.description}
              onChange={this.handleFieldChange('description')}
              label="Description"
							required={this.state.public}
            />
            <div className="Save-visibility">
							<h3>Export</h3>
							<select  className="Save-dropdown" value={this.state.saveType} onChange={(e) => this.getAttributes(e.target.value)}>
								<option value="collection">Entire Collection</option>
								<option value="network">This Network</option>
							</select>
						</div>
						<div className="Save-visibility">
              <h3>Save as Public?</h3>
              <input
                 type="checkbox"
                 value={this.state.public}
                 onChange={(e) => this.handleChangeVisibility(e)}
              />
            </div>
            <div className="Save-visibility">
              <h3>Save as a New Network?</h3>
              {this.state.updatable ?
              <input
                 type="checkbox"
                 value={!this.state.overwrite}
                 defaultChecked={!this.state.overwrite}
                 onChange={(e) => this.handleChangeOverwrite(e)}
              /> :
              <input type="checkbox" defaultChecked={true} disabled/>}
            </div>

          </div>
        </div>
        <div className="Save-actionbar">
          <h5 className="Save-actionbar-label">
			{this.state.saveType.charAt(0).toUpperCase() + this.state.saveType.slice(1)} Name:
          </h5>
          <input
             type="text"
             placeholder="Network name..."
             value={this.state.name}
             onChange={(e) => this.handleChangeName(e)}
          />
          <button onClick={this.closeWindow}>
            Cancel
          </button>
          <button title={!this.props.selectedProfile.hasOwnProperty('serverAddress') ? 'Sign in to save a network' : this.state.public ? "Name, version, and description are required to save public networks" : ""} onClick={() => this.onSave()} disabled={disableSave}>
           Save
          </button>
        </div>
      </div>
    )
  }

}

const LabelField = ({label, value, onChange, required}) => (
  <div className="Save-labelfield">
    <label>{label.toUpperCase() + (required ? "*" : "")}</label>
    <input className={required === true ? "required" : ""} type="text" value={value} onChange={onChange} placeholder={label + "..."}/>
  </div>
)

const TextareaField = ({label, value, onChange, required}) => (
  <div className="Save-textareafield">
    <label>{label.toUpperCase() + (required ? "*" : "")}</label>
    <textarea className={required === true ? "required" : ""} value={value} onChange={onChange} placeholder={"Enter your " + label.toLowerCase() + " here..."}/>
  </div>
)

export default Save

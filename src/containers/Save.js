import React, { Component } from 'react'
import './Save.css'
import copy from 'copy-to-clipboard'
import Navbar from '../components/Navbar'
import Profile from '../components/Profile'
import Waiting from '../components/Waiting'
import ModalDialog from '../components/ModalDialog'

class Save extends Component {

  constructor(props) {
    super(props)
    const hydrate = (field) => this.props[field] || '';
    this.state = {
			currentSuid: hydrate('suid'),
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
			saveType: hydrate('saveType'),
			saving: false,
			public: false,
			updatable: false,
			overwrite: false,
      success: false,
			shareURL: null,
			errorMessage: null,
    };
    window.saver = this;
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
	};

	componentWillReceiveProps(props) {
		this.checkPermissions(props.selectedProfile)
	}

	loadData(){
		const main = this;
		let saveType = this.state.saveType;
		fetch('http://localhost:' + (window.restPort || '1234') + '/cyndex2/v1/networks/' + main.state.currentSuid)
		.then((resp) => resp.json())
		.then((resp) => {
			if (resp.errors.length > 0){
				const errs = resp['errors'].map((v) => v['message']);
				throw new Error(errs.join(". "));
			}else{
				let newData = {
					"collection": resp['data']['currentRootNetwork'],
					errorMessage: null,
					saveType: "collection",
				}
				saveType = "collection";
				resp['data']['members'].forEach((member) => {
					if (member['suid'] === resp['data']['currentNetworkSuid']){
						newData['network'] = member
						newData['saveType'] = 'network'
						saveType = 'network'
					}
				})
				main.networkData = newData
			}
		}).then(() => {
			main.getAttributes(saveType)
			main.checkPermissions(main.props.selectedProfile)
		}).catch((errs) => {
			let errorMessage = "Error loading network information. " + errs;
			main.setState({errorMessage})
		});
	}

	componentWillMount(){
		this.loadData()
	}

  componentDidMount() {
    document.title = "Save to NDEx";
	}

  closeWindow() {
		if (window.frame){
  		window.frame.setVisible(false);
		}
	}

  onSave() {
    const {
      serverAddress,
      userName,
      password,
    } = this.props.selectedProfile;

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
    };

    const payloadObj = {
        username: userName,
        password: password,
        serverUrl: serverAddress + '/v2',
        metadata: metadata
    };

    let method = 'POST';
    if (this.state.overwrite) {
          method = 'PUT'
    } else {
          payloadObj.isPublic = this.state.public;
    }
    const payload = JSON.stringify(payloadObj);

    const suid = this.networkData[this.state.saveType]['suid'];

    if (userName === undefined || userName === "") {
      alert("You must be logged with your NDEx username to save a network.")
      return
    }
    this.setState({ saving: true });
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
          //this.saveImage(resp.data.suid, resp.data.uuid)
					var shareURL = null;
					if (this.state.public){
						shareURL = this.props.selectedProfile.serverAddress + "/#/network/" + resp.data.uuid
					}
					this.setState({saving:false, shareURL: shareURL, uuid: resp.data.uuid, success: true})
        }
      })

  }

	toggleShareUrl = () => {
		let url = this.props.selectedProfile.serverAddress + "/#/network/" + this.state.uuid;
		const able = this.state.shareURL === null ? 'enable' : 'disable';
		if (!this.state.public){
			fetch( this.props.selectedProfile.serverAddress + "/v2/network/" + this.state.uuid + "/accesskey?action=" + able, {
				method: 'PUT',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': 'Basic ' + btoa(this.props.selectedProfile.userName + ":" + this.props.selectedProfile.password)
				},
			})
			.then(resp => {
				if (!resp.ok){
					alert("CyNDEx2 was unable to fetch the access key for your network.\nTo enable/disable the shared URL, please visit the NDEx website at " + this.props.selectedProfile.serverAddress +".")
				}
				return able === 'disable' ? null : resp.json()})
			.then(json => {
				if (!json){
					this.setState({shareURL: null})
				}else if (json.accessKey){
					url += "?accesskey=" + json.accessKey;
					this.setState({shareURL: url})
				}
			})
			.catch((e) => {
				console.log(e);
				alert("CyNDEx2 was unable to fetch the access key for your network.\nTo enable/disable the shared URL, please visit the NDEx website at " + this.props.selectedProfile.serverAddress +".")
			})
		}else{
			this.setState({shareURL: url})
		}
	};

  saveImage(networkId, uuid) {
    const newState = {saving: false, uuid: uuid, success: true}
		if (this.state.public){
			newState.shareURL = this.props.selectedProfile.serverAddress + "/#/network/" + uuid
		} else {
      this.setState(newState)
		  return
		}
		fetch('http://localhost:' + (window.restPort || '1234') + '/v1/networks/' + networkId + '/views/first.png')
    .then((png) => png.blob())
    .then((blob) => {
      fetch('http://v1.imaging.cytoscape.io/public/' + uuid, {
			// fetch('http://localhost:8080/public/' + uuid, {
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
					this.setState(newState)
      }).catch((error) => {
				console.log(error)
//        alert("Your network was saved, but CyNDEx2 was unable to upload a network image.")
        this.setState(newState)
      });
    }).catch((error) => {
				console.log(error)
//      alert("Your network was saved, but an image could not be generated... the old image will be used instead.")
      this.setState(newState)
    })
  }

  handleChangeName(e) {
    this.setState({ name: e.target.value })
  }

  handleChangeOverwrite(evt) {
    this.setState({ overwrite: evt.target.checked });
    if (evt.target.checked)
        this.setState( { public: false});
  }

  handleChangeVisibility(evt) {
    this.setState({ public: evt.target.checked })
  }


  handleFieldChange(field) {
    return (e) => {
      let newState = {
        [field]: e.target.value
      };
      this.setState(newState)
    }
  }

	getAttributes = (saveType) => {
		saveType = saveType || this.state.saveType;
		if (!this.networkData.hasOwnProperty(saveType))
			return {};
		const net = this.networkData[saveType];
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
		});
		this.checkPermissions(this.props.selectedProfile, saveType)
	};

  render() {
    const {
      profiles,
      selectedProfile,
      handleProfileAdd,
      handleProfileSelect,
      handleProfileDelete,
      handleProfileLogout
    } = this.props;

		const disableSave = !this.props.selectedProfile.hasOwnProperty('serverAddress') ||
             (this.state.public && (!this.state.overwrite) && (!this.state.name || !this.state.description || !this.state.version));

		const sharable = !this.state.public && this.state.shareURL !== null
		if (this.state.errorMessage !== null && this.state.errorMessage !== undefined){
			console.log(this.state.errorMessage)
			return <Waiting text={this.state.errorMessage}/>
		}
		return (
      <div className="Save">
        {this.state.saving ? <Waiting text={"Saving network " + this.props.name + " to NDEx..."}/> : null}
				<ModalDialog
					show={this.state.success}
					containerStyle={{width: '50%', minWidth: '400px'}}
					closeOnOuterClick={true}
					onClose={() => (this.closeWindow())}>
					<div className="SaveModal col-sm-12">
						<h2>Network successfully saved to NDEx!</h2>
						<h5 style={{textAlign: 'center'}}>UUID: {this.state.uuid}</h5>
			{this.state.public ?
					<div>
						<h4><strong>Network is publicly accessible</strong></h4>
						<h5>Share your network on NDEx with the link below:</h5>
							<input type="text" disabled className="form-control" onChange={() => {}} value={this.state.shareURL}/>
					</div>
				:
					<div>
						<h4><strong>Share With Others</strong></h4>
						<h5>Anyone with the link can view this network</h5>
						<div>
							<input type="text" className="form-control" onChange={() => {}} value={sharable && this.state.shareURL ? this.state.shareURL : "Not Enabled"}/>
						</div>
						<h5 className="ng-scope">
							<strong>Share URL Status:</strong>
							{sharable ?
							<span style={{color:"green"}}>Enabled</span>
							:
							<span style={{color:"red"}}>Disabled</span>
							}
						</h5>
						{!this.state.public && <button className="btn btn-default ng-binding" onClick={() => this.toggleShareUrl()}>
							{(sharable ? "Disable" : "Enable") + " Share URL"}
						</button>}
				</div>
			}
						<button id="copyButtonId" className="btn btn-default ng-isolate-scope" onClick={() => copy(this.state.shareURL)}>
							Copy URL
						</button>
						<button id="Save-back" className="btn btn-default" onClick={() => {
							this.setState({success: false, shareURL: null, saving: false})
						}}>Go Back</button>
					</div>
				</ModalDialog>
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
              <h3>SAVE AS PUBLIC?</h3>
              <input
                 type="checkbox"
                 value={this.state.public}
                 disabled = {this.state.overwrite}
                 onChange={(e) => this.handleChangeVisibility(e)}
              />

            </div>
            <div className="Save-visibility">
              <h3>UPDATE EXISTING NETWORK?</h3>
              {this.state.updatable ?
              <input
                 type="checkbox"
                 value={this.state.overwrite}
                 defaultChecked={this.state.overwrite}
                 onChange={(e) => this.handleChangeOverwrite(e)}
              /> :
              <input type="checkbox" defaultChecked={false} disabled/>}
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
);

const TextareaField = ({label, value, onChange, required}) => (
  <div className="Save-textareafield">
    <label>{label.toUpperCase() + (required ? "*" : "")}</label>
    <textarea className={required === true ? "required" : ""} value={value} onChange={onChange} placeholder={"Enter your " + label.toLowerCase() + " here..."}/>
  </div>
);

export default Save

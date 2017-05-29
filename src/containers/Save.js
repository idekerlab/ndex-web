import React, { Component } from 'react'
import './Save.css'

import Navbar from '../components/Navbar'
import Profile from '../components/Profile'

class Save extends Component {

  constructor(props) {
    super(props)
    const hydrate = (field) => this.props[field] || ''
    this.state = {
      name: this.props.name,
      author: hydrate('author'),
      organism: hydrate('organism'),
      disease: hydrate('disease'),
      tissue: hydrate('tissue'),
      rightsHolder: hydrate('rightsHolder'),
      rights: hydrate('rights'),
      references: hydrate('references'),
      description: hydrate('description'),
      uuid: hydrate('uuid'),
      public: false
    }
  }

  onSave() {
    const {
      serverAddress,
      userName,
      password,
    } = this.props.selectedProfile
    console.log(this.state)
    const payload = JSON.stringify({
        userId: userName,
        password: password,
        serverUrl: serverAddress + '/v2',
        uuid: this.state.uuid,
        metadata: this.state,
        isPublic: this.state.public,
     })
    console.log(payload.metadata)
    fetch('http://localhost:1234/cyndex2/v1/networks/current', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: payload
    })
      .then((blob) => blob.json())
      .then((resp) => {
        console.log("Save response")
        console.log(resp)
      })

  }
  
  handleChangeName(e) {
    this.setState({ name: e.target.value })
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

  render() {
    console.log(this.props)
    const {
      profiles,
      selectedProfile,
      handleProfileAdd,
      handleProfileSelect,
      handleProfileDelete,
      handleProfileLogout
    } = this.props
    console.log(handleProfileAdd)
    return (
      <div className="Save">
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
              label="Right's Holder"
            />
            <LabelField
               value={this.state.rights}
               onChange={this.handleFieldChange('rights')}
               label="Rights"
             />
            <TextareaField
              value={this.state.references}
              onChange={this.handleFieldChange('references')}
              label="References"
            />
          </div>
          <div className="Save-right">
            <TextareaField
              value={this.state.description}
              onChange={this.handleFieldChange('description')}
              label="Description"
            />
            <div className="Save-visibility">
              <h3>Save as Public?</h3>
              <input
                 type="checkbox"
                 value={this.state.public}
                 onChange={(e) => this.handleChangeVisibility(e)} />
            </div>
          </div>
        </div>
        <div className="Save-actionbar">
          <h5 className="Save-actionbar-label">
            Network Name:
          </h5>
          <input
             type="text"
             placeholder="Network name..."
             value={this.state.name}
             onChange={(e) => this.handleChangeName(e)}
          />
          <button>
            Cancel
          </button>
          <button onClick={() => this.onSave()}>
           Save
          </button>
        </div>
      </div>
    )
  }

}

const LabelField = ({label, value, onChange}) => (
  <div className="Save-labelfield">
    <label>{label.toUpperCase()}</label>
    <input type="text" value={value} onChange={onChange} placeholder={label + "..."}/>
  </div>
)

const TextareaField = ({label, value, onChange}) => (
  <div className="Save-textareafield">
    <label>{label.toUpperCase()}</label>
    <textarea value={value} onChange={onChange} placeholder={"Enter your " + label.toLowerCase() + " here..."}/>
  </div>
)

export default Save

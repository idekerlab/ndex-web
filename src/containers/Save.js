import React, { Component } from 'react'
import './Save.css'

import Navbar from '../components/Navbar'
import Profile from '../components/Profile'

class Save extends Component {

  constructor(props) {
    super(props)
    this.state = {
      name: this.hydrateFromProps('name')
    }
  }

  hydrateFromProps(field) {
    return this.props[field] || ''
  }

  onSave() {
    const {
      serverAddress,
      userName,
      password,
    } = this.props.selectedProfile
    fetch('http://localhost:1234/cyndex2/v1/networks/' + this.props.suid, {
      method: 'POST',
      body: JSON.stringify({
        userId: userName,
        password: password,
        serverUrl: serverAddress,
        uuid: '',
        metadata: {},
        isPublic: true,
      })
    })
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
            <LabelField label="Author"/>
            <LabelField label="Organism"/>
            <LabelField label="Disease"/>
            <LabelField label="Tissue"/>
            <LabelField label="Right's Holder"/>
            <LabelField label="Rights"/>
            <TextareaField label="References"/>
          </div>
          <div className="Save-right">
            <TextareaField label="Description"/>
          </div>
        </div>
        <div className="Save-actionbar">
          <input type="text" placeholder="Network name..."/>
          <button>Cancel</button>
          <button>Save</button>
        </div>
      </div>
    )
  }

}

const LabelField = ({label}) => (
  <div className="Save-labelfield">
    <label>{label.toUpperCase()}</label>
    <input type="text" placeholder={label + "..."}/>
  </div>
)

const TextareaField = ({label}) => (
  <div className="Save-textareafield">
    <label>{label.toUpperCase()}</label>
    <textarea placeholder={"Enter your " + label.toLowerCase() + " here..."}/>
  </div>
)

export default Save

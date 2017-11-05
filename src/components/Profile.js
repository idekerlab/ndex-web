import React, {Component} from 'react'
import './Profile.css'

import defaultProfilePic from '../default-profile.png' 
class Profile extends Component {

  constructor() {
    super()

    this.state = {
      pages: {
        "select": SelectProfile,
        "add"   : AddProfile
      },
      isOpen: false,
      activePage: 'select'
    }
    this.handlePageActivate = this.handlePageActivate.bind(this)
  }

  handlePageActivate(newActivePage) {
    this.setState({ activePage: newActivePage })
  }

  openDropdown() {
    this.setState({isOpen: true})
  }

  closeDropdown() {
    this.setState({isOpen: false})
  }

  render() {
    const { pages, activePage, isOpen } = this.state
    const {
      profiles, selectedProfile,
      onProfileAdd, onProfileSelect, onProfileDelete, onProfileLogout
    } = this.props
		return (
      <div className="Profile">
        <ProfileBadge
          onClick={() => this.openDropdown()}
          profile={selectedProfile}/>
        <ProfileDropdown
          isOpen={isOpen}
          ActivePage={pages[activePage]}
          onPageActivate={this.handlePageActivate}
          profile={selectedProfile}
          profiles={profiles}
          selectedProfile={selectedProfile}
          onProfileAdd={onProfileAdd}
          onProfileSelect={onProfileSelect}
          onProfileDelete={onProfileDelete}
          onProfileLogout={onProfileLogout}
        />
        {this.state.isOpen ? <div className="Profile-Backdrop" onClick={() => this.closeDropdown()}/> : null}
      </div>
    )
  }

}

const ProfileBadge = ({profile, onClick}) => (
	<div
    className="ProfileBadge"
    onMouseDown={onClick}
  >
    <img
      alt="ProfileBadge"
      src={profile.image || defaultProfilePic}
    />
    <div className="ProfileBadge-textblock">
      <h5>{profile.userName || 'Anonymous'}</h5>
      <h6>{typeof profile.serverAddress === 'string' ? profile.serverAddress.substr(7) : 'NDEx Public'}</h6>
    </div>
  </div>
)

const ProfileDropdown = ({ActivePage, isOpen, ...rest}) => (
  <div
    className={"ProfileDropdown " + (isOpen ? "isOpen" :  "")}
  >
    <ActivePage {...rest}/>
  </div>
)

const SelectProfile = ({profile, profiles, selectedProfile, onProfileSelect, onProfileDelete, onProfileLogout, onPageActivate}) => {
  const  profileButtons = (profiles.filter((profile) => { return !(profile.userName === selectedProfile.userName && profile.serverAddress === selectedProfile.serverAddress) } ))
              .map((profile, index) => ProfileButton(index, profile, onProfileSelect, onProfileDelete))
  const signOut = selectedProfile.serverAddress === undefined ? null : <DropdownAction
					key="signout"
					buttonId="back"
          label="Sign out"
          onClick={() => onProfileLogout()}
				/>
	return (
    <Dropdown
      title="Select Profile"
      content={profileButtons.length !== 0 ?
          <ul className="SelectProfile-list">{profileButtons}</ul> :
          <div className="SelectProfile-NoProfiles"><p>Signed out profiles will appear here</p></div>
      }
      actions={[
        <DropdownAction
          key="add"
					buttonId="addAccount"
					label="Add Acount"
          onClick={() => onPageActivate('add')}
        />,
      	signOut
			]}
    />
  )
}

const ProfileButton = (index, profile, onProfileSelect, onProfileDelete) => (
  <li
    className="ProfileButton"
    key={index}
  >
    <ProfileBadge
      profile={profile}
      onClick={() => onProfileSelect(profile)}
    />
    <button
      onMouseDown={() => onProfileDelete(profile)}
    >
      Delete
    </button>
  </li>
)

class AddProfile extends Component {

  constructor() {
    super()
    this.state = {
      failed: false,
      serverAddress: "",
      userName: "",
      password: "",
    }
  }

  handleFieldChange(field) {
    return (e) => {
      let newState = {
        [field]: e.target.value
      }
      this.setState(newState)
    };
  }

  verifyLogin() {
    const profile = Object.assign({}, this.state)
    const { onPageActivate, onProfileAdd } = this.props
		if (profile.serverAddress === '')
			profile.serverAddress = 'http://ndexbio.org'
		if (profile.serverAddress.lastIndexOf("http://", 0) !== 0) {
        profile.serverAddress = "http://" + profile.serverAddress
    }
		if (profile.serverAddress.endsWith('/'))
			profile.serverAddress = profile.serverAddress.slice(0, -1)

    const filtered = this.props.profiles.filter((p) => p.serverAddress === profile.serverAddress && p.userName === profile.userName)
    if (filtered.length !== 0) {
      this.setState({failed: true})
    } else if (profile.serverAddress === "" || profile.userName === "" || profile.password === "") {
      this.setState({failed: true})
    } else {
      fetch(profile.serverAddress + "/v2/user?valid=true", {
        headers: new Headers({
          "Authorization": 'Basic ' + btoa(profile.userName + ':' + profile.password)
        })
      }).then((response) => {
				if (!response.ok) {
          this.setState({failed: true})
        	throw Error()
				}
				return response.json()
    	}).then((blob) => {
        onPageActivate('select')
				const newProfile = Object.assign(profile, {userId: blob.externalId, firstName: blob.firstName, image: blob.image})
				onProfileAdd(newProfile)
			}).catch((error) => {
        this.setState({failed: true})
      })
    }
  }

  render() {
    const { onPageActivate } = this.props
    return (
      <Dropdown
        title="Add Profile"
        content={
          <div className="AddProfile-input">
            <p>Enter the address of an NDEx Server</p>
            <input
              placeholder="Server Address (default: http://ndexbio.org)"
              onChange={this.handleFieldChange("serverAddress")}
            />
            <p>Enter your NDEx username</p>
            <input
              placeholder="Username"
              onChange={this.handleFieldChange("userName")}
            />
            <p>Enter your password</p>
            <input
              placeholder="Password"
              type="password"
              onChange={this.handleFieldChange("password")}
            	onKeyPress={(event) => {
								if (event.charCode === 13)
									document.getElementById("addAccount").click()
							}}
						/>
            {!this.state.failed || <p className="AddProfile-fail">Credentials invalid or Profile exists! Try again.</p>}
          </div>
        }
        actions={[
          <DropdownAction
						key="add"
						buttonId="addAccount"
						label="Add Account"
            onClick={() => this.verifyLogin()}
          />,
          <DropdownAction
						key="remove"
						buttonId="back"
            label="Back"
            onClick={() => onPageActivate('select')}
          />
        ]}
      />
    )
  }

}

const Dropdown = ({title, content, actions}) => (
  <DropdownContent>
    <DropdownTitle title={title}/>
    <DropdownContent>
      {content}
    </DropdownContent>
    <DropdownActions>
      {actions}
    </DropdownActions>
  </DropdownContent>
)

const DropdownTitle = ({title}) => (
  <h5 className="ProfileDropdown-title">{title}</h5>
)

const DropdownContent = ({children}) => (
  <div className="ProfileDropdown-content">
    {children}
  </div>
)

const DropdownActions = ({children}) => (
  <div className="ProfileDropdown-actions">
    {children}
  </div>
)

const DropdownAction = ({label, onClick, buttonId}) => (
  <button onClick={onClick} id={buttonId}>{label}</button>
)

export default Profile

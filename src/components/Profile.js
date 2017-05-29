import React, {Component} from 'react'
import './Profile.css'

class Profile extends Component {

  constructor() {
    super()

    this.state = {
      pages: {
        "select": SelectProfile,
        "add"   : AddProfile
      },
      activePage: 'select'
    }
    this.handlePageActivate = this.handlePageActivate.bind(this)
  }

  handlePageActivate(newActivePage) {
    this.setState({ activePage: newActivePage })
  }

  render() {
    const { pages, activePage } = this.state
    const {
      profiles, selectedProfile,
      onProfileAdd, onProfileSelect, onProfileDelete, onProfileLogout
    } = this.props
    return (
      <div className="Profile">
        <ProfileBadge profile={selectedProfile}/>
        <ProfileDropdown
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
      </div>
    )
  }

}

const ProfileBadge = ({profile, onMouseDown}) => (
  <div
    className="ProfileBadge"
    onMouseDown={onMouseDown}
  >
    <img
      alt="ProfileBadge"
      src={profile.img || "http://bit.ly/2oLinub"}
    />
    <div className="ProfileBadge-textblock">
      <h5>{profile.serverName || 'NDEx Public'}</h5>
      <h6>{profile.userName || 'Anonymous'}</h6>
    </div>
  </div>
)

const ProfileDropdown = ({ActivePage, ...rest}) => (
  <div className="ProfileDropdown">
    <ActivePage {...rest}/>
  </div>
)

const SelectProfile = ({profile, profiles, selectedProfile, onProfileSelect, onProfileDelete, onProfileLogout, onPageActivate}) => (
  <Dropdown
    title="Select Profile"
    content={
      <ul className="SelectProfile-list">
        {
          (profiles.filter((profile) => profile.serverName !== selectedProfile.serverName && profile.userName !== selectedProfile.userName))
            .map((profile, index) => ProfileButton(index, profile, onProfileSelect, onProfileDelete))
        }
      </ul>
    }
    actions={[
      <DropdownAction
        label="Add Acount"
        onClick={() => onPageActivate('add')}
      />,
      <DropdownAction
        label="Sign out"
        onClick={() => onProfileLogout()}
      />
    ]}
  />
)

const ProfileButton = (index, profile, onProfileSelect, onProfileDelete) => (
  <li
    className="ProfileButton"
    key={index}
  >
    <ProfileBadge
      profile={profile}
      onMouseDown={() => onProfileSelect(profile)}
    />
    <button
      onMouseDown={() => {
        onProfileDelete(profile)
      }}
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
      serverName: "",
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
    const profile = this.state
    const { onPageActivate, onProfileAdd } = this.props
    if (profile.serverAddress.lastIndexOf("http://", 0) !== 0) {
        profile.serverAddress = "http://" + profile.serverAddress
    }
    if (profile.serverAddress === "" || profile.serverName === "") {
      this.setState({failed: true})
    } else {
      fetch(profile.serverAddress + "/v2/user?valid=true", {
        headers: new Headers({
          "Authorization": 'Basic ' + btoa(profile.userName + ':' + profile.password)
        })
      }).then((response) => {
        if (response.ok) {
          onPageActivate('select')
          onProfileAdd(profile)
        } else {
          this.setState({failed: true})
        }
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
            <p>Enter a server name</p>
            <input
              placeholder="Server Name"
              onChange={this.handleFieldChange("serverName")}
            />
            <p>Enter the address of an NDEx Server</p>
            <input
              placeholder="Server Address"
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
            />
            {!this.state.failed || <p className="AddProfile-fail">Address or credentials invalid! Try again.</p>}
          </div>
        }
        actions={[
          <DropdownAction
            label="Add Acount"
            onClick={() => this.verifyLogin()}
          />,
          <DropdownAction
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

const DropdownAction = ({label, onClick}) => (
  <button onClick={onClick}>{label}</button>
)

export default Profile

import React from "react";
import {inject, observer} from "mobx-react/index";
import PropTypes from "prop-types";
import Profile from "./Profile";
import {Link} from "react-router-dom";

@inject('rootStore')
@observer
class Profiles extends React.Component {
  static propTypes = {
    rootStore: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.select = null;

    if (this.profilesStore.state === 'idle') {
      this.profilesStore.fetchProfiles();
    }
  }

  /**@return RootStore*/
  get rootStore() {
    return this.props.rootStore;
  }

  /**@return OptionsStore*/
  get optionsStore() {
    return this.rootStore.options;
  }

  get profilesStore() {
    return this.props.rootStore.profiles;
  }

  handleSelect = () => {
    const rootStore = this.props.rootStore;
    const id = this.select.value;
    rootStore.profiles.setProfileId(id);
    rootStore.profiles.saveProfile();
  };

  refSelect = (element) => {
    this.select = element;
  };

  handleEditClick = (e) =>{
    if (this.profilesStore.state !== 'done') {
      e.preventDefault();
    }
  };

  render() {
    if (this.optionsStore.state !== 'done') {
      return `Loading options: ${this.optionsStore.state}`;
    }

    const profilesStore = this.profilesStore;

    let profileStore = null;
    let selectValue = null;
    const selectOptions = [];
    if (profilesStore.state === 'done') {
      profileStore = profilesStore.profile;
      if (profileStore) {
        selectValue = profileStore.id;
      }
      profilesStore.profiles.forEach(profile => {
        selectOptions.push(
          <option key={profile.id} value={profile.id}>{profile.name}</option>
        );
      });
    } else {
      selectValue = 'loading';
      selectOptions.push(
        <option key={'loading'} value="loading" disabled>Loading...</option>
      );
    }

    let profile = null;
    if (profileStore) {
      profile = (
        <Profile key={profileStore.id} profileStore={profileStore}/>
      );
    }

    return (
      <div className="parameter_box__left">
        <div className="parameter parameter-profile">
          <div className="profile_box">
            <select ref={this.refSelect} className="profile__select" value={selectValue} onChange={this.handleSelect}>
              {selectOptions}
            </select>
            <Link onClick={this.handleEditClick} to="/profileEditor" title={chrome.i18n.getMessage('manageProfiles')}
                  className="button-manage-profile"/>
          </div>
        </div>
        <div className="parameter parameter-tracker">
          {profile}
        </div>
      </div>
    );
  }
}

export default Profiles;
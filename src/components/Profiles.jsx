import React from "react";
import {observer, inject} from "mobx-react/index";
import PropTypes from "prop-types";
import RootStore from "../stores/RootStore";
import Profile from "./Profile";
import SearchStore from "../stores/SearchStore";
import {Link} from "react-router-dom";

@inject('rootStore')
@observer
class Profiles extends React.Component {
  constructor(props) {
    super(props);

    this.handleSelect = this.handleSelect.bind(this);
    this.refSelect = this.refSelect.bind(this);

    this.select = null;
  }

  componentDidMount() {
    if (this.props.rootStore.profiles.state === 'idle') {
      this.props.rootStore.profiles.fetchProfiles();
    }
  }

  handleSelect() {
    const rootStore = this.props.rootStore;
    const id = this.select.value;
    rootStore.profiles.setProfileId(id);
    rootStore.profiles.saveProfile();
  }

  refSelect(element) {
    this.select = element;
  }

  render() {
    const rootStore = this.props.rootStore;
    const profilesStore = rootStore.profiles;

    switch (profilesStore.state) {
      case 'pending': {
        return ('Loading...');
      }
      case 'error': {
        return ('Error');
      }
      case 'done': {
        const options = [];

        let activeProfile = null;
        profilesStore.profiles.forEach(profile => {
          if (!profilesStore.profileId || profilesStore.profileId === profile.id) {
            activeProfile = profile;
          }
          options.push(
            <option key={profile.id} value={profile.id}>{profile.name}</option>
          );
        });
        if (!activeProfile) {
          activeProfile = profilesStore.profiles[0];
        }

        return (
          <div className="parameter_box__left">
            <div className="parameter parameter-profile">
              <div className="profile_box">
                <select ref={this.refSelect} className="profile__select" defaultValue={activeProfile.id} onChange={this.handleSelect}>
                  {options}
                </select>
                <Link to="/profileEditor" title={chrome.i18n.getMessage('manageProfiles')}
                   className="button-manage-profile"/>
              </div>
            </div>
            <div className="parameter parameter-tracker">
              <Profile key={activeProfile.id} searchStore={this.props.searchStore} profileItem={activeProfile}/>
            </div>
          </div>
        );
      }
      default: {
        return ('Idle');
      }
    }
  }
}

Profiles.propTypes = null && {
  rootStore: PropTypes.instanceOf(RootStore),
  searchStore: PropTypes.instanceOf(SearchStore),
};

export default Profiles;
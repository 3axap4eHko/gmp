import React, { Component } from 'react';
import { string } from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import HeartIcon from 'material-ui/svg-icons/action/favorite';
import donate from '../donate';
import { $i } from '../browser';
import './DonateButton.css';

class DonateButton extends Component {
  static propTypes = {
    type: string
  };
  static defaultProps = {
    type: 'button'
  };

  render() {
    const { type } = this.props;

    if (type === 'icon') {
      return (
        <FloatingActionButton className="heartbeat" mini={true} secondary={true} onClick={donate}>
          <HeartIcon />
        </FloatingActionButton>
      );
    }
    return (
      <RaisedButton
        label={$i('button_donate')}
        className="heartbeat"
        secondary={true}
        onClick={donate}
      />
    );
  }
}

export default DonateButton;
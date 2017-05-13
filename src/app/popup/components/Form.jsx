import React, { Component } from 'react';
import { number, string, func, bool } from 'prop-types';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Subheader from 'material-ui/Subheader';
import RaisedButton from 'material-ui/RaisedButton';
import Slider from 'material-ui/Slider';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { range } from 'yyf/iterate';
import { format } from 'yyf/date';
import { fromBytesToBits, toComplexArrayRight } from 'yyf/cast';
import { Message, $i } from '../../commons/browser';

import { paramsSet, configSet } from '../redux/actions';

const Container = styled.section`
  display: flex;
  minWidth: 256px;
  padding: 0 20px 0 20px;
  flex-direction: column;
  flex: 1 0 auto;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: row;
  padding: 10px;
  flex: 1 0 auto;
  align-items: center;
  justify-content: space-between;
`;

import './Form.css';

const styles = {
  passwordSize: {
    height: 25,
    marginTop: -25
  }
};

function encodeBytes(bytes, alphabet) {
  const base = alphabet.length;
  const groupSize = Math.ceil(Math.log2(base));
  const bits = fromBytesToBits(bytes).join('');
  return toComplexArrayRight(bits, groupSize)
    .map(value => parseInt(value.join(''), 2))
    .map(idx => alphabet[idx % base]).join('');
}


class Form extends Component {
  static propTypes = {
    passwordLength: number.isRequired,
    url: string.isRequired,
    origin: string.isRequired,
    autoClear: number.isRequired,
    expiration: number.isRequired,
    username: string.isRequired,
    pin: string.isRequired,
    alphabet: string.isRequired,
    latitude: number.isRequired,
    longitude: number.isRequired,
    useGeo: bool.isRequired,

    configSet: func.isRequired,
    paramsSet: func.isRequired,
  };

  state = {
    copied: false,
    password: '',
  };

  onLengthChange = (event, passwordLength) => {
    const { configSet } = this.props;
    configSet({ passwordLength });
  };

  onUsernameChange = (event, username) => {
    const { paramsSet } = this.props;
    paramsSet({ username });
  };

  onPinChange = (event, pin) => {
    const { paramsSet } = this.props;
    paramsSet({ pin });
  };

  onUrlChange = (event, index, url) => {
    const { paramsSet } = this.props;
    paramsSet({ url });
  };

  onExpirationChange = (event, index, expiration) => {
    const { configSet } = this.props;
    configSet({ expiration });
  };

  onToggleGeo = (event, useGeo) => {
    const { paramsSet } = this.props;
    paramsSet({ useGeo });
  };

  onCopy = () => {
    this.setState({ copied: true });
    const password = findDOMNode(this.password);
    const range = document.createRange();
    range.selectNodeContents(password);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    try {
      document.execCommand('copy');
      window.getSelection().removeAllRanges();
      Message.send('clearClipboard', this.props.autoClear);
      setTimeout(() => window.close(), 1000);
    } catch (err) {
      // ignore
    }
  };

  componentWillReceiveProps(nextProps) {
    const { url, username, pin, passwordLength, expiration, latitude, longitude, alphabet } = nextProps;
    const timestamp = format(new Date(), '0YQMNDh'.substr(0, expiration));
    const params = [url, username, pin, passwordLength, timestamp, latitude, longitude];
    const buffer = new TextEncoder('utf-8').encode(params.join(':'));
    crypto.subtle.digest('SHA-512', buffer).then(hashBuffer => {
      const bytes = Array.from(new Uint8Array(hashBuffer));
      this.setState({ password: encodeBytes(bytes, alphabet).slice(-passwordLength) });
    });
  }

  componentWillMount() {
    const { paramsSet } = this.props;
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab] = []) => {
      const origin = new URL(tab.url).origin;
      paramsSet({ origin })
    });
  }

  render() {
    const { url, origin, username, pin, passwordLength, expiration, useGeo } = this.props;
    const { copied, password } = this.state;

    const urls = range(Math.max((origin.match(/\./g) || []).length, 0))
      .map(idx => {
        const uri = new URL(origin);
        uri.hostname = uri.hostname.split('.').slice(-(idx + 2)).join('.');
        return uri.origin;
      });

    return (
      <Container>
        <Subheader style={{ width: 200 }}>{$i('field_password_size')}: {passwordLength}</Subheader>
        <Slider
          value={passwordLength}
          max={32}
          min={6}
          step={1}
          style={styles.passwordSize}
          onChange={this.onLengthChange}
        />
        <SelectField
          floatingLabelText={$i('field_url')}
          value={url || origin}
          onChange={this.onUrlChange}
          fullWidth={true}
        >
          {urls.map(uri => <MenuItem key={uri} value={uri} primaryText={uri} />)}
        </SelectField>
        <SelectField
          floatingLabelText={$i('field_expiration')}
          value={expiration}
          onChange={this.onExpirationChange}
          fullWidth={true}
        >
          <MenuItem value={1} primaryText={$i('field_expiration_never')} />
          <MenuItem value={2} primaryText={$i('field_expiration_hourly')} />
          <MenuItem value={3} primaryText={$i('field_expiration_daily')} />
          <MenuItem value={4} primaryText={$i('field_expiration_weekly')} />
          <MenuItem value={5} primaryText={$i('field_expiration_monthly')} />
          <MenuItem value={6} primaryText={$i('field_expiration_quarterly')} />
          <MenuItem value={7} primaryText={$i('field_expiration_yearly')} />
        </SelectField>
        <TextField
          floatingLabelText={$i('field_username')}
          value={username}
          onChange={this.onUsernameChange}
          fullWidth={true}
        />
        <TextField
          floatingLabelText={$i('field_pin')}
          value={pin}
          onChange={this.onPinChange}
          fullWidth={true}
        />
        <TextField
          floatingLabelText={$i('field_password')}
          value={password}
          readOnly
          ref={password => this.password = password}
          inputStyle={{
            fontFamily: '"Roboto Mono", sans-serif',
          }}
          fullWidth={true}
        />
        <Actions>
          <RaisedButton
            label={copied ? $i('button_copied') : $i('button_copy')}
            primary={true}
            onClick={this.onCopy}
            className={(copied ? 'copied ' : '') + 'copy-btn'}
          />
          <Toggle
            label="Use GEO"
            labelPosition="right"
            style={{ maxWidth: 120 }}
            labelStyle={{ fontSize: 14 }}
            onToggle={this.onToggleGeo}
            toggled={useGeo}
          />
        </Actions>

      </Container>
    );
  }
}

function mapStateToProps({ params, config }) {
  return {
    ...params,
    ...config,
  };
}

const mapDispatchToProps = {
  paramsSet,
  configSet,
};

export default connect(mapStateToProps, mapDispatchToProps)(Form);
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import If from 'react-helpful/If';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import EmailIcon from 'material-ui/svg-icons/communication/mail-outline';
import LockIcon from 'material-ui/svg-icons/action/lock-outline';
import Paper from 'material-ui/Paper';
import Form from '../components/Form';
import Map from '../components/Map';

import DonateButton from '../../commons/React/DonateButton';

import '../../../css/global.css';
import '../../../css/roboto.css';
import '../../../css/roboto-mono.css';

const Container = styled.main`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  minWidth: 256px;
  height: auto;
`;

const Generator = styled.section`
  display: flex;
  flex: 1 1 auto;
  transition: 3s all;
  flex-direction: row-reverse;
`;

class App extends Component {
  static propTypes = {};

  render() {
    const { useGeo } = this.props;
    return (
      <Container>
        <AppBar
          title="GMP"
          iconElementLeft={<IconButton><LockIcon/></IconButton>}
          iconElementRight={<DonateButton />}
        />
        <Paper>
          <RaisedButton
            fullWidth={true}
            secondary={true}
            labelStyle={{fontSize: 9}}
            label="Try FREE OWA Pro for Exchange and Office365"
            href="https://chrome.google.com/webstore/detail/owa-pro/hldldpjjjagjfikfknadmnnmpbbhgihg"
            target="_owa"
            icon={<EmailIcon/>}
          />
        </Paper>
        <Generator>
          <Form />
          <If
            is={useGeo}
            render={Map}
          />
        </Generator>
      </Container>
    );
  }
}

function mapStateToProps({ params, config }) {
  return {
    ...params,
    ...config
  };
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(App);
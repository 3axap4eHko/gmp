import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { number } from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { paramsSet } from '../redux/actions';
import drawMap from '../../commons/drawMap';

import './Map.css';

const Container = styled.section`
  height: 500px;
  width: 440px;
`;

class Map extends Component {
  static propTypes = {
    latitude: number,
    longitude: number,
  };

  state = {
    latitude: 0,
    longitude: 0,
  };

  componentDidMount() {
    const { paramsSet } = this.props;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(geolocation => {
        const { latitude, longitude } = geolocation.coords;
        paramsSet({ latitude, longitude });
        drawMap(findDOMNode(this.map), latitude, longitude, (latitude, longitude) => paramsSet({
          latitude,
          longitude
        }));
        this.setState({ latitude, longitude });
      }, null, {});
    }
  }

  componentWillUnmount() {
    const { paramsSet } = this.props;
    paramsSet({ latitude: 0, longitude: 0 });
  }

  render() {
    const {} = this.props;
    return (
      <Container ref={map => this.map = map} />
    );
  }
}

function mapStateToProps({ params }) {
  return {
    latitude: params.latitude,
    longitude: params.longitude,
  }
}

const mapDispatchToProps = {
  paramsSet,
};

export default connect(mapStateToProps, mapDispatchToProps)(Map);

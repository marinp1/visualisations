import React from 'react';
import glamorous from 'glamorous';

import { BoxLayout } from './BoxLayout';

const Container = glamorous.div({
  marginTop: '3rem',
});

const Separator = glamorous.div({
  width: '100%',
  height: '0.1rem',
  background: '#333',
});

const WeatherObservations = () => (
  <Container className='container'>
    <div>
      <h4>Average temperatures for location</h4>
      <Separator/>
      <BoxLayout/>
    </div>
  </Container>
);

export default WeatherObservations;

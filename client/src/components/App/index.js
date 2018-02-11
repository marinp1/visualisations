/* global Plotly:true */

import React from 'react';

import { ToastContainer } from 'react-toastify';

import createPlotlyComponent from 'react-plotly.js/factory';
import WeatherObservations from '../WeatherObservations';

export const Plot = createPlotlyComponent(Plotly);

class App extends React.Component {
  render() {
    return (
      <div>
        <ToastContainer autoClose={3000}/>
        <WeatherObservations/>
      </div>
    );
  }
}

export default App;

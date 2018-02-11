import React from 'react';
import { toast } from 'react-toastify';

import { Plot } from '../App';
import SettingsComponent from './SettingsComponent';

function generateLayout(info) {

  const title = `Average temperatures in ${info.place}, Finland from ` +
    info.startDate + ' to ' + info.endDate;

  return {
    title,
    autosize: true,
    boxmode: 'group',
    yaxis: {
      title: 'Temperature (°C)'
    },
  }
}

export class BoxLayout extends React.Component {

  toastId = null;

  state = {
    data: require('./data.json'),
    layoutSettings: {
      place: 'Espoo',
      startDate: '2017-01-01',
      endDate: '2017-12-31',
    },
  };

  setDefaults = () => {
    this.setState({
      data: require('./data.json'),
      layoutSettings: {
        place: 'Espoo',
        startDate: '2017-01-01',
        endDate: '2017-12-31',
      },
    });
  }

  refreshData = async (startDate, endDate, place) => {

    this.toastId = toast('Fetching data...', { autoClose: false });

    const query = `?startDate=${startDate}&endDate=${endDate}&place=${place}`;
    const response = await fetch(`/api/observations${query}`);

    if (response.status !== 200) {
      toast.dismiss(this.toastId);
      this.toastId = toast.error('Error with fetching content!');
      this.setDefaults();
    } else {
      toast.dismiss(this.toastId);
      this.toastId = toast.success('Graph generated successfully!');

      const res = await response.text();
      this.setState({
        data: JSON.parse(res).data,
        layoutSettings: {
          place,
          startDate,
          endDate,
        }
      });
    }
  }

  render() {
    return (
      <div style={{width: '100%'}}>
        <SettingsComponent
          updateData={this.refreshData}
        />
        <Plot
          data={this.state.data}
          layout={generateLayout(this.state.layoutSettings)}
          style={{width: 'inherit', height: '60vh'}}
          useResizeHandler={true}
        />
      </div>
    );
  }
}

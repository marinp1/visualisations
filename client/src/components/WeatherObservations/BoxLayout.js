import React from 'react';
import { toast } from 'react-toastify';
import glamorous from 'glamorous';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faCheck from '@fortawesome/fontawesome-free-solid/faCheck';
import faTimes from '@fortawesome/fontawesome-free-solid/faTimes';
import faWarning from '@fortawesome/fontawesome-free-solid/faExclamationTriangle';
import faSpinner from '@fortawesome/fontawesome-free-solid/faSpinner';

import { Plot } from '../App';
import SettingsComponent from './SettingsComponent';

function generateLayout(info) {

  const title = `Average temperatures in ${info.place} from ` +
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

const TextContent = glamorous.span({
  marginLeft: '1rem',
});

const NotificationDiv = ({ iconName, text, spinning }) => (
  <div>
    <FontAwesomeIcon icon={ iconName } spin={ spinning }/>
    <TextContent>{text}</TextContent>
  </div>
);

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

    this.toastId = toast(
      <NotificationDiv
        iconName={faSpinner}
        text={`Fetching data for ${place}...`}
        spinning={true}
      />, { autoClose: false });

    const query = `?startDate=${startDate}&endDate=${endDate}&place=${place}`;
    const response = await fetch(`/api/observations${query}`);

    if (response.status !== 200) {
      const msg = await response.text();

      toast.update(this.toastId, {
        render:
          <NotificationDiv
            iconName={faTimes}
            text={`Error with fetching content: ${msg}`}
            spinning={false}
          />,
         type: toast.TYPE.ERROR,
         autoClose: 3000
       });

      this.setDefaults();
    } else {
      const res = await response.text();
      const missingDataPoints = JSON.parse(res).missingDataPoints;

      if (missingDataPoints > 0) {
        toast.update(this.toastId, {
          render:
            <NotificationDiv
              iconName={faWarning}
              text={`Graph generated with ${missingDataPoints} missing data points!`}
              spinning={false}
            />,
          type: toast.TYPE.WARNING,
          autoClose: 3000
        });
      } else {
        toast.update(this.toastId, {
           render:
             <NotificationDiv
              iconName={faCheck}
              text='Graph generated successfully!'
              spinning={false}
             />,
           type: toast.TYPE.SUCCESS,
           autoClose: 3000
         });
      }

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

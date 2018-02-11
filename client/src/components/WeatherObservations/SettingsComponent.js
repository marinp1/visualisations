import React from 'react';
import glamorous from 'glamorous';
import moment from 'moment';

const Container = glamorous.div({
  margin: '1rem 0 0 0',
});

const ContainerItem = glamorous.div({
  '& input': {
    width: '100%',
  }
});

const Button = glamorous.button({
  width: '100%',
});

const ErrorMessage = glamorous.p({
  textAlign: 'center',
  color: '#FF0000',
})

class SettingsComponent extends React.Component {

  state = {
    startDate: '2017-01-01',
    endDate: '2017-12-31',
    place: 'Espoo',
    formValid: true,
    formErrorMessage: '',
  }

  updateData() {
    this.props.updateData(
      this.state.startDate,
      this.state.endDate,
      this.state.place
    );
  }

  handleChangeStartDate(e) {

    this.setState({
      startDate: e.target.value
    });

    this.validateForm(this.state.place, e.target.value, this.state.endDate);

  }

  handleChangeEndDate(e) {

    this.setState({
      endDate: e.target.value
    });

    this.validateForm(this.state.place, this.state.startDate, e.target.value);
  }

  handlePlaceChange(e) {

    const newPlace = this.validatePlace(e.target.value);

    this.setState({
      place: newPlace,
    });

    this.validateForm(newPlace, this.state.startDate, this.state.endDate);
  }

  validatePlace(placename) {
    const validityRegex = RegExp("([a-zA-Z]|[åäöÅÄÖøØ])+");
    const placeMatch = placename.match(validityRegex);

    if (placeMatch !== null) {
      return placeMatch[0];
    } else {
      return '';
    }
  }

  validateForm(placename, startDate, endDate) {

    const now = moment().startOf('day');
    const start = moment(startDate).startOf('day');
    const end = moment(endDate).endOf('day');

    const isBeforeEnd = start.isBefore(end);
    const isBeforeNow = end.isBefore(now);

    const isNotEmpty = placename.trim().length > 0;

    const msgs = [];

    if (!isBeforeEnd || !isBeforeNow) {
      msgs.push('Start date must be before end date and both have to be in the past.');
    }

    if (!isNotEmpty) {
      msgs.push('Place name cannot be empty.');
    }

    this.setState({
      formValid: isBeforeEnd && isBeforeNow && isNotEmpty,
      formErrorMessage: msgs.join('\n'),
    });
  }

  render() {

    const buttonClass = !this.state.formValid ? 'button' : 'button-primary';

    return (
      <div>
        <Container className="row">
          <ContainerItem className="four columns">
            <label>Start date</label>
            <input type="date" value={ this.state.startDate }
              onChange={e => this.handleChangeStartDate(e)}/>
          </ContainerItem>
          <ContainerItem className="four columns">
            <label>End date</label>
            <input type="date" value={ this.state.endDate }
              onChange={e => this.handleChangeEndDate(e)}/>
          </ContainerItem>
          <ContainerItem className="four columns">
            <label>Place name</label>
            <input type="text" value={ this.state.place }
              onChange={e => this.handlePlaceChange(e)}
              required
            />
          </ContainerItem>
        </Container>
        {!this.state.formValid && <div className="row">
          <ErrorMessage>{this.state.formErrorMessage}</ErrorMessage>
        </div>}
        <div className="row">
          <Button className={buttonClass}
            disabled={!this.state.formValid}
            onClick={e => this.updateData()}
          >
            Refresh
          </Button>
        </div>
      </div>
    )
  }

}

export default SettingsComponent;

import React from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import AddCourses from './addCourses';
import distributeCourseAlgorithm from './distCourseAlgorithm';
import NotificationDialog from '../Timetable/notificationDialog';
import AddedCoursesList from './addedCoursesList';
import Actions from '../../../actions/timetableActions';

class PrefPanel extends React.Component {
  state = {
    notificationPanel: '',
  }

  onAcceptClick = () => {
    this.setState({
      notificationPanel: '',
    });
  }
  onCancelClick = () => {
    this.setState({
      notificationPanel: '',
    });
  }
  onClickCreate = () => {
    const coursesList = [];
    for (let i = 0; i < this.props.coursesList.length; i += 1) {
      coursesList.push(this.props.coursesList[i].CODE);
    }

    const timePref = document.querySelector('input[name="preferredTime"]:checked').value;

    axios.get('http://localhost:3005/api/submitCourses', { params: { courses: coursesList, timePref } }).then((response) => {
      const selectedSlots = distributeCourseAlgorithm(response.data, timePref);
      this.props.resetSlots();
      selectedSlots.objs.forEach((slotObj) => {
        this.props.setSlot(slotObj);
      });
      this.props.setOccupiedSlots(selectedSlots.occupiedSlots);
      this.setState({
        notificationPanel: <NotificationDialog onCancelClick={() => this.onCancelClick()} onAcceptClick={() => this.onAcceptClick()} errors={selectedSlots.status.errors} success={selectedSlots.status.success} />,
      });
    });
  }

  render() {
    return (
      <div className="preferencePanel" >
        <div className="heading"><span>Select Courses</span><span>Total credits: {this.props.totalCredits}</span></div>
        <AddCourses />
        <AddedCoursesList />

        <div className="heading sec">Theory class timings</div>

        <form className="timePreferenceOptions">

          <label className="container">Morning Theories
            <input type="radio" id="morning" name="preferredTime" defaultChecked value="morning" />
            <span className="checkmark" />
          </label>
          <label className="container">Evening Theories
            <input type="radio" id="evening" name="preferredTime" value="evening" />
            <span className="checkmark" />
          </label>

        </form>
        {this.state.notificationPanel}
        <button onClick={() => this.onClickCreate()} className="createButton" type="button">Create Timetable</button>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    coursesList: state.courseListReducer.courses,
    totalCredits: state.courseListReducer.totalCredits,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    setSlot: slotObj => dispatch(Actions.setSlot(slotObj)),
    resetSlots: () => dispatch(Actions.resetSlots()),
    setOccupiedSlots: list => dispatch(Actions.setOccupiedSlots(list)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PrefPanel);

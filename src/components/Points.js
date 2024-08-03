import React from 'react';
import PropTypes from 'prop-types';

const Points = ({ points }) => (
  <div className="points-container">
    <div>Points</div>
    <div className="points">
      {points.toString().padStart(4, '0')}
    </div>
  </div>
);

Points.propTypes = {
  points: PropTypes.number.isRequired,
};

export default Points;

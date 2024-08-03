import React from 'react';
import PropTypes from 'prop-types';
import './Box.css';

const Box = ({ color }) => (
  <div className={`box ${color}`} />
);

Box.propTypes = {
  color: PropTypes.string.isRequired,
};

export default Box;

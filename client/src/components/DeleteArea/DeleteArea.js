// DeleteArea.js
import React, { useState } from 'react';
import './DeleteArea.css';

const DeleteArea = ({ building, onConfirm, onCancel }) => {
  if (!building) return null; // nothing to show if no building is selected

  return (
    <div className="popup-overlay">
      <div className="popup-content delete-building">
        <h2>Delete Building</h2>
        <p>
          Are you sure you want to delete <strong>{building.name}</strong>?
        </p>

        <div className="delete-building__buttons">
          <button
            className="delete-building__button delete-building__button--cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="delete-building__button delete-building__button--delete"
            onClick={() => onConfirm(building)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteArea;
// src/pages/Profile.js
import React, { useState } from 'react';

function Profile() {
  const [fleetType, setFleetType] = useState('own'); // 'own' sau 'subcontractors'
  const [country, setCountry] = useState('');
  const [numberOfTrucks, setNumberOfTrucks] = useState('');
  const [ratePerKm, setRatePerKm] = useState('');

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Profile</h2>
      <div>
        <label>
          Fleet Type:
          <select value={fleetType} onChange={e => setFleetType(e.target.value)}>
            <option value="own">Camioanele mele</option>
            <option value="subcontractors">Subcontractori</option>
          </select>
        </label>
      </div>
      {fleetType === 'own' ? (
        <>
          <div>
            <label>
              Country:
              <input type="text" value={country} onChange={e => setCountry(e.target.value)} />
            </label>
          </div>
          <div>
            <label>
              Number of Trucks:
              <input type="number" value={numberOfTrucks} onChange={e => setNumberOfTrucks(e.target.value)} />
            </label>
          </div>
        </>
      ) : (
        <div>
          <label>
            Rate per km:
            <input type="number" value={ratePerKm} onChange={e => setRatePerKm(e.target.value)} />
          </label>
        </div>
      )}
      <button onClick={() => alert('Profile saved!')}>Save Profile</button>
    </div>
  );
}

export default Profile;

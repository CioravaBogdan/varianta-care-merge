import React from 'react';
import './ComparisonTable.css';

const ComparisonTable = ({ routes }) => {
  return (
    <div className="comparison-table">
      <table>
        <thead>
          <tr>
            <th>Route</th>
            <th>Distance (km)</th>
            <th>Time (hours)</th>
            <th>Estimated Cost (€)</th>
            <th>Toll Costs (€)</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route, index) => (
            <tr key={index}>
              <td>{route.name || `Route ${index + 1}`}</td>
              <td>{(route.distance / 1000).toFixed(2)}</td>
              <td>{(route.time / 3600).toFixed(2)}</td>
              <td>{route.estimatedCost?.toFixed(2) || 'N/A'}</td>
              <td>{route.tollCosts?.toFixed(2) || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
import React, { useState } from 'react';

function App() {
  const [prediction, setPrediction] = useState(null);

  const fetchPrediction = async () => {
    const response = await fetch('http://localhost:5000/api/predict', {
      method: 'POST',
    });
    const data = await response.json();
    setPrediction(data.prediction);
  };

  return (
    <div className="App">
      <h1>Predicción NBA</h1>
      <button onClick={fetchPrediction}>Hacer Predicción</button>
      {prediction && <p>{prediction}</p>}
    </div>
  );
}

export default App;

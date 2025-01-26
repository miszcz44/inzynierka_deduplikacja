import React from 'react';
import { Card, Placeholder } from 'react-bootstrap';

const Statistics = () => {
  return (
    <div>
      <h2>Statystyki</h2>

      <Card className="mb-3">
        <Card.Body>
          <Card.Title>Wykres podobieństw</Card.Title>
          <Placeholder as="div" animation="glow">
            <Placeholder xs={12} style={{ height: '200px', width: '100%' }} />
          </Placeholder>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title>Rozkład unikalnych i zduplikowanych rekordów</Card.Title>
          <Placeholder as="div" animation="glow">
            <Placeholder xs={12} style={{ height: '200px', width: '100%' }} />
          </Placeholder>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Statistics;

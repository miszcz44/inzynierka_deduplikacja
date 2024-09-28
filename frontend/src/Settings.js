// src/components/Settings.js

import React from 'react';
import { Card, Placeholder } from 'react-bootstrap';

const Settings = () => {
  return (
    <Card>
      <Card.Body>
        <Card.Title>Ustawienia Aplikacji</Card.Title>
        <Placeholder as="p" animation="glow">
          <Placeholder xs={6} /> <Placeholder xs={4} />
        </Placeholder>
        <Placeholder as="p" animation="glow">
          <Placeholder xs={8} />
        </Placeholder>
        <Placeholder as="p" animation="glow">
          <Placeholder xs={5} /> <Placeholder xs={7} />
        </Placeholder>
      </Card.Body>
    </Card>
  );
};

export default Settings;

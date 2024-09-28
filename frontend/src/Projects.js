// src/components/Projects.js

import React from 'react';
import { Card, Placeholder } from 'react-bootstrap';

const Projects = () => {
  return (
    <div>
      <h2>Projekty Deduplikacji</h2>
      {[1, 2, 3].map((project) => (
        <Card key={project} className="mb-3">
          <Card.Body>
            <Card.Title>
              <Placeholder as="p" animation="glow">
                <Placeholder xs={6} />
              </Placeholder>
            </Card.Title>
            <Card.Text>
              <Placeholder as="p" animation="glow">
                <Placeholder xs={7} /> <Placeholder xs={4} />{' '}
                <Placeholder xs={4} />
              </Placeholder>
            </Card.Text>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default Projects;

import React, { useState } from 'react';
import { Navbar, Container, Row, Col, ListGroup, Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  const handleCreateProject = async (e) => {
  e.preventDefault();
  const form = e.target;
  const title = form.elements['projectTitle'].value;
  const description = form.elements['projectDescription'].value;

    if (file) {
    const fileExtension = file.name.split('.').pop();
    if (fileExtension !== 'csv' && fileExtension !== 'json') {
      setError('Plik musi być w formacie CSV lub JSON.');
      return;
    }
  }

  const projectData = new FormData();
  projectData.append('title', title);
  projectData.append('description', description);
  projectData.append('file', file);

  const token = localStorage.getItem('token');
  try {
    const response = await fetch('http://localhost:8000/api/projects', {
      method: 'POST',
      headers: {
            Authorization: `Bearer ${token}`,
          },
      body: projectData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail.message || 'Failed to create project');
    }

    const data = await response.json();
    console.log('Project Created:', data);

    navigate(`/projects/${data.id}`);
    setShowModal(false);
  } catch (error) {
    console.error(error);
    setError(error.message);
  }
};

  const handleProjectsClick = () => {
    navigate('/projects');
  };

  return (
    <div>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>Dashboard Deduplikacji</Navbar.Brand>
        </Container>
      </Navbar>

      <Container fluid className="mt-4">
        <Row>
          <Col md={3}>
            <ListGroup>
              <ListGroup.Item action onClick={handleShowModal}>
                Nowy Projekt
              </ListGroup.Item>
              <ListGroup.Item action onClick={handleProjectsClick}>
                Projekty
              </ListGroup.Item>
              <ListGroup.Item action>
                Statystyki
              </ListGroup.Item>
              <ListGroup.Item action>
                Ustawienia
              </ListGroup.Item>
            </ListGroup>
          </Col>

          <Col md={9}>
            <div className="text-center">
              <h4>Wybierz projekt lub utwórz nowy projekt.</h4>
            </div>
          </Col>
        </Row>
      </Container>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Utwórz Nowy Projekt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateProject}>
            <Form.Group className="mb-3" controlId="projectTitle">
              <Form.Label>Nazwa Projektu</Form.Label>
              <Form.Control type="text" placeholder="Wprowadź nazwę projektu" required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="projectDescription">
              <Form.Label>Opis (opcjonalnie)</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Krótki opis projektu" />
            </Form.Group>
                        <Form.Group className="mb-3" controlId="dataFile">
              <Form.Label>Plik danych (CSV/JSON)</Form.Label>
              <Form.Control
                type="file"
                accept=".csv,.json"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </Form.Group>
            {error && <div className="text-danger">{error}</div>}
            <Button variant="primary" type="submit">
              Twórz Projekt
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Dashboard;

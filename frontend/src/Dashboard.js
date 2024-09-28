import React, { useState } from 'react';
import { Navbar, Container, Row, Col, ListGroup, Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  const handleCreateProject = (e) => {
    e.preventDefault();
    const form = e.target;
    const title = form.elements['projectTitle'].value;
    const description = form.elements['projectDescription'].value;

    const projectId = Math.random().toString(36).substr(2, 9);

    setShowModal(false);

    navigate(`/project/${projectId}`);
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
              <ListGroup.Item action>
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

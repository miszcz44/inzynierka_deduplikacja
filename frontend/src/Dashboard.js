import React, { useState } from 'react';
import { Navbar, Container, Row, Col, ListGroup, Modal, Button, Form, Grid} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './css/Dashboard.css';

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
        setError('The file must be in CSV or JSON format.');
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

  const handleStatisticsClick = () => {
    navigate('/statistics');
  };

  return (
    <div className="vh-100 d-flex flex-column">
      <Navbar bg="dark" variant="dark" className="navbar">
        <Container>
          <Navbar.Brand className="navbar-brand">Deduplication Dashboard</Navbar.Brand>
        </Container>
      </Navbar>
      <Row className="no-margin">
          <div className="text-center">
            <p className="p-margin">Choose a project or create a new one.</p>
          </div>
      </Row> 
      <Row className="flex-grow-1 no-margin">
        <Col className="d-flex justify-content-center align-items-center">
          <div className="div-button" onClick={handleShowModal}> 
            <div className="button-title">
              <img src="./images/plus.png" alt="Icon" className="icon" />
              <div className="title-text">
                <p>New Project</p>
              </div>
            </div> 
            <div className="button-desc">
              <div className="text-center">
                <p>Create a new project</p>
              </div>
            </div>
          </div>
        </Col>
        <Col className="d-flex justify-content-center align-items-center">
          <div className="div-button" onClick={handleProjectsClick}> 
            <div className="button-title">
              <img src="./images/files.png" alt="Icon" className="icon" />
              <div className="title-text">
                <p>User Projects</p>
              </div>
            </div>
            <div className="button-desc">
              <div className="text-center">
                <p>View your created projects</p>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <Row className="flex-grow-1 no-margin">
        <Col className="d-flex justify-content-center align-items-center">
          <div className="div-button" onClick={handleStatisticsClick}>
            <div className="button-title">
              <img src="./images/stats.png" alt="Icon" className="icon" />
              <div className="title-text">
                <p>Statistics</p>
              </div>
            </div>
            <div className="button-desc">
              <div className="text-center">
                <p>View the statistics of your workflows</p>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateProject}>
            <Form.Group className="mb-3" controlId="projectTitle">
              <Form.Label>Project Title</Form.Label>
              <Form.Control type="text" placeholder="Wprowadź nazwę projektu" required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="projectDescription">
              <Form.Label>Description (optional)</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Krótki opis projektu" />
            </Form.Group>
                        <Form.Group className="mb-3" controlId="dataFile">
              <Form.Label>Data File (CSV/JSON)</Form.Label>
              <Form.Control
                type="file"
                accept=".csv,.json"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </Form.Group>
            {error && <div className="text-danger">{error}</div>}
            <Button variant="primary" type="submit">
              Create Project
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Dashboard;

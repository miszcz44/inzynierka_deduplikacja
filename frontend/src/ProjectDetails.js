import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ListGroup, Alert, Form, Modal } from 'react-bootstrap';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [workflows, setWorkflows] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkflowTitle, setNewWorkflowTitle] = useState('');
  const [workflowError, setWorkflowError] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [newTitle, setNewTitle] = useState('');


  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        handleError(response.status);
        return;
      }

      const data = await response.json();
      setProjectData(data);
      setTitle(data.title);
      setDescription(data.description);
      setWorkflows(data.workflows)
    } catch (err) {
      setError('Wystąpił błąd podczas komunikacji z serwerem.');
    } finally {
      setLoading(false);
    }
  };

  const handleError = (status) => {
    if (status === 403) {
      navigate('/dashboard', { state: { message: 'Nie masz uprawnień do wyświetlenia tego projektu.' } });
    } else if (status === 404) {
      navigate('/dashboard', { state: { message: 'Projekt o podanym identyfikatorze nie istnieje.' } });
    } else {
      setError('Wystąpił błąd podczas pobierania danych projektu.');
    }
  };

  const handleUpdate = async () => {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);

    const response = await fetch(`http://localhost:8000/api/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 403 || response.status === 404) {
        handleError(response.status);
      } else if (response.status === 400) {
        const { message } = await response.json();
        setError(message);
      } else {
        setError('Wystąpił błąd podczas aktualizacji projektu.');
      }
      return;
    }

    await fetchProjectDetails();

    setIsEditing(false);
  } catch (err) {
    setError('Wystąpił błąd podczas komunikacji z serwerem.');
  }
};

  const handleCreateWorkflow = async () => {
    if (!newWorkflowTitle) {
      setWorkflowError('Tytuł workflow nie może być pusty.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', newWorkflowTitle);

      const response = await fetch(`http://localhost:8000/api/workflows/${projectId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 403 || response.status === 404) {
          handleError(response.status);
        } else if (response.status === 400) {
          const { detail } = await response.json();
          setWorkflowError(detail.message);
        } else {
          setWorkflowError('Wystąpił błąd podczas tworzenia workflow.');
        }
        return;
      }

      const newWorkflow = await response.json();
      navigate(`/projects/${projectId}/workflow/${newWorkflow.id}`);

    } catch (err) {
      setWorkflowError('Wystąpił błąd podczas komunikacji z serwerem.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Czy na pewno chcesz usunąć ten projekt?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/projects/${projectId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          handleError(response.status);
          return;
        }

        navigate('/dashboard', { state: { message: 'Projekt został usunięty pomyślnie.' } });
      } catch (err) {
        setError('Wystąpił błąd podczas komunikacji z serwerem.');
      }
    }
  };

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  const handleOpenUpdateModal = (workflow) => {
    setSelectedWorkflow(workflow);
    setNewTitle(workflow.title);
    setShowUpdateModal(true);
  };

  const handleUpdateWorkflow = async () => {
    if (!newTitle.trim()) {
      setError('Title cannot be empty');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', newTitle);
      const response = await fetch(`http://localhost:8000/api/workflows/${selectedWorkflow.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const { message } = await response.json();
        setError(message || 'Error updating workflow');
        return;
      }

      setShowUpdateModal(false);

      await fetchProjectDetails();

    } catch (err) {
      setError('Failed to update workflow');
    }
  };

  const handleDeleteWorkflow = async (workflowId) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/workflows/${workflowId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setError('Error deleting workflow');
          return;
        }

        await fetchProjectDetails();

      } catch (err) {
        setError('Failed to delete workflow');
      }
    }
  };

  return (
    <Container fluid className="mt-4">
      {error && <Alert variant="danger" className="text-center">{error}</Alert>}
      <h2 className="text-center mb-4">Szczegóły projektu: {projectData !== null ? projectData.title : 'd'}</h2>

      <Row className="mb-4">
        <Col md={8} className="mx-auto">
          <Card>
            <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
              Informacje o projekcie
              <div>
                <Button
                  size="sm"
                  variant="dark"
                  onClick={() => setIsEditing(true)}
                  className="me-2 "
                  style={{ transition: 'background-color 0.3s ease' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#343a40'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}
                >
                  Edytuj
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleDelete}
                  className="mt-2 "
                  style={{ transition: 'background-color 0.3s ease' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#627577'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}
                >
                  Usuń
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {isEditing ? (
    <Form>
      <Form.Group className="mb-3" controlId="projectTitle">
        <Form.Label>Tytuł</Form.Label>
        <Form.Control
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          isInvalid={!title && isEditing}
        />
        <Form.Control.Feedback type="invalid">
          Tytuł nie może być pusty.
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="projectDescription">
        <Form.Label>Opis</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Form.Group>

      <Button
        variant="primary"
        onClick={handleUpdate}
        className="me-2"
        disabled={!title}
      >
        Zapisz
      </Button>

      <Button
        variant="secondary"
        onClick={() => setIsEditing(false)}
        className="mt-2"
      >
        Anuluj
      </Button>
    </Form>
              ) : (
                <>
                  <Card.Text>
                    <strong>Tytuł:</strong> {projectData.title}
                  </Card.Text>
                  <Card.Text>
                    <strong>Opis:</strong> {projectData.description}
                  </Card.Text>
                  <Card.Text>
                    <strong>Plik:</strong> {projectData.filename}
                  </Card.Text>
                  <Card.Text>
                    <strong>Data utworzenia:</strong> {projectData.date_created.slice(0, 19).replace('T', ' ')}
                  </Card.Text>
                  <Card.Text>
                    <strong>Data aktualizacji:</strong> {projectData.date_updated.slice(0, 19).replace('T', ' ')}
                  </Card.Text>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={8} className="mx-auto">
          <Card>
            <Card.Header as="h5">Workflowy</Card.Header>
            <Card.Body>
              <ListGroup>
                {workflows.map((workflow) => (
                  <ListGroup.Item key={workflow.id} className="d-flex justify-content-between align-items-center">
                    <span>
                      {workflow.title}{" "}
                      <Link to={`/projects/${projectId}/workflow/${workflow.id}`}>
                        Zobacz wyniki
                      </Link>
                    </span>

                    <div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="me-2 mb-2"
                        onClick={() => handleOpenUpdateModal(workflow)}
                      >
                        Update
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <Button
                variant="primary"
                className="mt-3"
                onClick={() => setShowCreateModal(true)}
              >
                Utwórz nowy workflow
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Workflow Title</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                isInvalid={!newTitle.trim()}
              />
              <Form.Control.Feedback type="invalid">
                Title cannot be empty.
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleUpdateWorkflow}>
            Save Changes
          </Button>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Utwórz nowy workflow</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {workflowError && <Alert variant="danger">{workflowError}</Alert>}
          <Form>
            <Form.Group controlId="workflowTitle">
              <Form.Label>Tytuł workflow</Form.Label>
              <Form.Control
                type="text"
                value={newWorkflowTitle}
                onChange={(e) => setNewWorkflowTitle(e.target.value)}
                isInvalid={!newWorkflowTitle}
              />
              <Form.Control.Feedback type="invalid">
                Tytuł workflow nie może być pusty.
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCreateWorkflow}>
            Utwórz
          </Button>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Anuluj
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProjectDetails;

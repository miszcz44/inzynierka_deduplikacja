import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ListGroup, Alert, Form } from 'react-bootstrap';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);


  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/projects/${projectId}`, {
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
        setFile(data.filename);
      } catch (err) {
        setError('Wystąpił błąd podczas komunikacji z serwerem.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

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
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch(`/projects/${projectId}`, {
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

      navigate('/dashboard', { state: { message: 'Projekt został zaktualizowany pomyślnie.' } });
    } catch (err) {
      setError('Wystąpił błąd podczas komunikacji z serwerem.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Czy na pewno chcesz usunąć ten projekt?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/projects/${projectId}`, {
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

    const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const validTypes = ['application/json', 'text/csv'];

    if (selectedFile) {
      if (!validTypes.includes(selectedFile.type)) {
        setFileError('Wybierz plik w formacie CSV lub JSON.');
        setFile(null);
      } else {
        setFileError('');
        setFile(selectedFile);
        setSelectedFile(selectedFile);
      }
    } else {
      setFileError('Plik jest wymagany.');
      setSelectedFile(null);
    }
  };

  if (loading) {
    return <div>Ładowanie...</div>;
  }

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

      <Form.Group className="mb-3" controlId="dataFile">
        <Form.Label>Plik danych (CSV/JSON)</Form.Label>
        <Form.Control
          type="file"
          accept=".csv,.json"
          onChange={handleFileChange}
          isInvalid={!!fileError || !selectedFile}
        />
        <Form.Control.Feedback type="invalid">
          {fileError || 'Proszę wybrać plik.'}
        </Form.Control.Feedback>
      </Form.Group>

      <Button
        variant="primary"
        onClick={handleUpdate}
        className="me-2"
        disabled={!title || !selectedFile}
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
                    <strong>Tytuł:</strong> {projectData !== null ? projectData.title : 'd'}
                  </Card.Text>
                  <Card.Text>
                    <strong>Opis:</strong> {projectData !== null ? projectData.description : 'd'}
                  </Card.Text>
                  <Card.Text>
                    <strong>Plik:</strong> {projectData !== null ? projectData.filename : 'd'}
                  </Card.Text>
                  <Card.Text>
                    <strong>Data utworzenia:</strong> {projectData !== null ? projectData.dateCreated : 'd'}
                  </Card.Text>
                  <Card.Text>
                    <strong>Data aktualizacji:</strong> {projectData !== null ? projectData.dateUpdated : 'd'}
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
                <ListGroup.Item>
                  Workflow 1 <Link to={`/projects/${projectId}/workflow/1`}>Zobacz wyniki</Link>
                </ListGroup.Item>
                <ListGroup.Item>
                  Workflow 2 <Link to={`/projects/${projectId}/workflow/2`}>Zobacz wyniki</Link>
                </ListGroup.Item>
              </ListGroup>
              <Link to={`/projects/${projectId}/workflow/new`}>
                <Button variant="primary" className="mt-3">Utwórz nowy workflow</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProjectDetails;

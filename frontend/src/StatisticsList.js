import React, { useEffect, useState } from 'react';
import { Navbar, Container, Row, Col, Button, Form } from 'react-bootstrap';
import ReactPaginate from 'react-paginate';
import './css/StatisticsList.css';
import { BackButton, HomeButton } from './Buttons';

const StatisticsList = () => {
  const [statistics, setStatistics] = useState([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const statsPerPage = 4;

  useEffect(() => {
    const fetchStatistics = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch('http://localhost:8000/api/workflows/get/statistics-list', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        setStatistics(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStatistics();
  }, []);

  const pagesVisited = pageNumber * statsPerPage;

  const filteredStatistics = statistics.filter((stat) => {
    const term = searchTerm.toLowerCase();
    return (
      stat.title.toLowerCase().includes(term) ||
      stat.project_name.toLowerCase().includes(term) ||
      stat.workflow_name.toLowerCase().includes(term) ||
      stat.filename.toLowerCase().includes(term)
    );
  });

  const pageCount = Math.ceil(filteredStatistics.length / statsPerPage);

  const handlePageClick = (event) => {
    setPageNumber(event.selected);
  };

  const currentStats = filteredStatistics.slice(
    pagesVisited,
    pagesVisited + statsPerPage
  );

  return (
    <div className="statistics-vh-100 d-flex flex-column statistics-list-container">
      <Navbar bg="dark" variant="dark" className="statistics-navbar">
        <Container>
          <Navbar.Brand className="statistics-navbar-brand">Statistics List</Navbar.Brand>
        </Container>
      </Navbar>

      {/* Search Bar */}
      <Row className="statistics-search-row">
        <Col className="d-flex justify-content-end">
          <Form.Control
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="statistics-search-input"
          />
        </Col>
      </Row>

      {/* Statistics List */}
      <Row className="flex-grow-1 statistics-no-margin">
        <Col className="d-flex flex-wrap justify-content-around align-items-center">
          {currentStats.length > 0 ? (
            currentStats.map((stat, index) => (
              <div key={index} className="statistics-div-statistic">
                <h5 className="statistics-stat-title">{stat.title}</h5>
                <div><strong>Project Name:</strong> {stat.project_name}</div>
                <div><strong>Workflow Name:</strong> {stat.workflow_name}</div>
                <div><strong>Filename:</strong> {stat.filename}</div>
                <hr />
                {stat.statistics.map((statDetail, i) => (
                  <div key={i} className="statistics-stat-detail">
                    <div><strong>Detected Duplicates:</strong> {statDetail['Detected duplicates']}</div>
                    <div><strong>Duplicate Percentage:</strong> {statDetail['Duplicate percentage']}%</div>
                    <div><strong>Average Similarity per Block:</strong> {statDetail['Average similarity per block']}</div>
                    <div><strong>Row Count After Deduplication:</strong> {statDetail['Row count after deduplication']}</div>
                    <div><strong>Row Count Before Deduplication:</strong> {statDetail['Row count before deduplication']}</div>
                  </div>
                ))}
                <Button variant="primary" href={`/statistics/${index}`}>DETAILS</Button>
              </div>
            ))
          ) : (
            <div className="text-center">No results found.</div>
          )}
        </Col>
      </Row>

      {/* Buttons Row */}
      <Row className="statistics-buttons-row statistics-no-margin">
        <Col className="d-flex justify-content-around">
          <BackButton />
          <HomeButton />
        </Col>
      </Row>

      {/* Pagination Row */}
      <Row className="statistics-pagination-row statistics-no-margin">
        <Col className="d-flex justify-content-center align-items-center">
          <ReactPaginate
            previousLabel={'Previous'}
            nextLabel={'Next'}
            breakLabel={'...'}
            pageCount={pageCount}
            onPageChange={handlePageClick}
            containerClassName={'statistics-pagination'}
            previousLinkClassName={'statistics-pagination__link'}
            nextLinkClassName={'statistics-pagination__link'}
            disabledClassName={'statistics-pagination__link--disabled'}
            activeClassName={'statistics-pagination__link--active'}
          />
        </Col>
      </Row>
    </div>
  );
};

export default StatisticsList;

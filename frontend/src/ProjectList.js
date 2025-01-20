import React, { useEffect, useState } from 'react';
import { useTable, useSortBy } from 'react-table';
import { Navbar, Container, Row, Col, Button } from 'react-bootstrap';
import ReactPaginate from 'react-paginate';
import './css/ProjectList.css';
import { BackButton, HomeButton } from './Buttons';
import Loading from './Loading';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(true);
  const projectsPerPage = 4;

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');

      try {
        const response = await fetch('http://localhost:8000/api/projects/', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
      setLoading(false);
    };

    fetchProjects();
  }, []);

  const formatDate = (dateString) => {
    return dateString.slice(0, 19).replace('T', ' ');
  };

  const pagesVisited = pageNumber * projectsPerPage;
  const pageCount = Math.ceil(projects.length / projectsPerPage);

  const handlePageClick = (event) => {
    setPageNumber(event.selected);
  };


  const columns = React.useMemo(
    () => [
      { Header: 'ID', accessor: 'id' },
      { Header: 'Title', accessor: 'title' },
      { Header: 'Description', accessor: 'description' },
      { Header: 'Date Created', accessor: 'date_created', Cell: ({ value }) => formatDate(value) },
      { Header: 'Date Updated', accessor: 'date_updated', Cell: ({ value }) => formatDate(value) },
      { Header: 'Number of Workflows', accessor: 'workflows', Cell: ({ value }) => value.length },
      { Header: 'Actions', accessor: 'actions', Cell: ({ row }) => <a href={`/projects/${row.original.id}`}>DETAILS</a> },
    ],
    []
  );

  const currentProjects = projects.slice(
    pagesVisited,
    pagesVisited + projectsPerPage
  );

  /*
  const displayProjects = React.useMemo(
    () => projects.slice(pagesVisited, pagesVisited + projectsPerPage),
    [projects, pagesVisited, projectsPerPage]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    { columns, data: displayProjects },
    useSortBy
  );*/

  return (
    <div className="vh-100 d-flex flex-column project-list-container">
      {/*
      <div className="project-list-container">
        <h1>Your Projects</h1>
        <table {...getTableProps()} className="project-table">
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render('Header')}
                    <span>
                      {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        <ReactPaginate
          previousLabel={'Previous'}
          nextLabel={'Next'}
          breakLabel={'...'}
          pageCount={pageCount}
          onPageChange={handlePageClick}
          containerClassName={'pagination'}
          previousLinkClassName={'pagination__link'}
          nextLinkClassName={'pagination__link'}
          disabledClassName={'pagination__link--disabled'}
          activeClassName={'pagination__link--active'}
        />
      </div>*/}

      {loading ? (
        <Loading />
      ) : (<></>)}

      <Navbar bg="dark" variant="dark" className="navbar">
        <Container>
          <Navbar.Brand className="navbar-brand">Your Projects</Navbar.Brand>
        </Container>
      </Navbar>

      <Row className="project-row flex-grow-1 no-margin">
        <Col className="d-flex flex-wrap justify-content-around align-items-center">
          {currentProjects.map((project, index) => (
            <div className="div-project">
              <div className="project-title">{project.title}</div>
              <div className="project-description">{project.description}</div>
              <hr />
              <div className="project-date">Created: {formatDate(project.date_created)}</div>
              <div className="project-date">Modified: {formatDate(project.date_updated)}</div>
              <div className="project-workflows">Number of Workflows: {project.workflows.length}</div>
              <div className="project-id">Project ID: {project.id}</div>
              <Button variant="primary" href={`/projects/${project.id}`}>DETAILS</Button>
            </div>
          ))}
          {/*currentEntries.map((entry, index) => (
            <div key={index} className="div-entry">
              {entry}
            </div>
          ))*/}
        </Col>
      </Row>

      <Row className="pagination-row no-margin">
        <Col className="d-flex justify-content-center align-items-center">
          <ReactPaginate
            previousLabel={'Previous'}
            nextLabel={'Next'}
            breakLabel={'...'}
            pageCount={pageCount}
            onPageChange={handlePageClick}
            containerClassName={'pagination'}
            previousLinkClassName={'pagination__link'}
            nextLinkClassName={'pagination__link'}
            disabledClassName={'pagination__link--disabled'}
            activeClassName={'pagination__link--active'}
          />
        </Col>
      </Row>

      <BackButton/>
      <HomeButton/>
    </div>
    
    
  );
};

export default ProjectList;

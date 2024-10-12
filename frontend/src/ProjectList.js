import React, { useEffect, useState } from 'react';
import { useTable, useSortBy } from 'react-table';
import ReactPaginate from 'react-paginate';
import './css/ProjectList.css';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [pageNumber, setPageNumber] = useState(0);
  const projectsPerPage = 5;

  useEffect(() => {
    const fetchProjects = async () => {
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
    { Header: '# of Workflows', accessor: 'workflows', Cell: ({ value }) => value.length },
    { Header: 'Actions', accessor: 'actions', Cell: ({ row }) => <a href={`/projects/${row.original.id}`}>DETAILS</a> },
  ],
  []
);

    const displayProjects = React.useMemo(
      () => projects.slice(pagesVisited, pagesVisited + projectsPerPage),
      [projects, pagesVisited, projectsPerPage]
    );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    { columns, data: displayProjects },
    useSortBy
  );

  return (
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
    </div>
  );
};

export default ProjectList;

import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import axios from "axios";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { TextField, Button, Chip } from "@mui/material";
import { UploadFile } from "@mui/icons-material";
import Papa from "papaparse";
import ReportDialog from "../Components/ReportDialog";

const columns = [
  { id: "nic", label: "NIC", minWidth: 170, align: "center" },
  { id: "birthday", label: "Birthday", minWidth: 100, align: "center" },
  {
    id: "gender",
    label: "Gender",
    minWidth: 170,
    align: "center",
  },
  {
    id: "age",
    label: "Age",
    minWidth: 170,
    align: "center",
  },
];

function Records() {
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [nicFilter, setNicFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:3001/nic/getAllRecords").then((response) => {
      setRecords(response.data);
      setFilteredRecords(response.data);
    });
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    const newFiles = Array.from(files).map((file) => file.name);

    setUploadedFiles((prevFiles) => [...prevFiles, ...newFiles]);

    Array.from(files).forEach((file) => {
      Papa.parse(file, {
        header: false, // Set to false to ignore column headers
        complete: (results) => {
          const data = results.data.map((item) => {
            return { nic: item[0] }; // Assuming the first column has the NIC
          });
          console.log("Formatted data:", data);

          // Send formatted data to the API
          axios
            .post("http://localhost:3001/nic/getRecordsByFile", data)
            .then((response) => {
              setFilteredRecords(() => [...response.data]);
              console.log(response.data);
            })
            .catch((error) => {
              console.error("Error uploading data:", error);
            });
        },
      });
    });
  };

  const handleNicFilterChange = (event) => {
    const value = event.target.value;
    setNicFilter(value);

    if (value === "") {
      setFilteredRecords(records);
    } else {
      const filtered = records.filter((record) => record.nic.includes(value));
      setFilteredRecords(filtered);
    }
  };

  const handleDelete = (index) => () => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    handleNicFilterChange({ target: { value: "" } });
  };

  const handleReports = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col items-center w-screen h-screen">
      <Navbar />

      <div className="flex mt-10 space-x-2">
        <TextField
          id="outlined-basic"
          label="Search by NIC"
          variant="outlined"
          type="number"
          size="small"
          value={nicFilter}
          onChange={handleNicFilterChange}
        />
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <input
              accept=".csv"
              style={{ display: "none" }}
              id="raised-button-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="raised-button-file">
              <Button
                variant="contained"
                component="span"
                startIcon={<UploadFile />}
              >
                Search by Files
              </Button>
            </label>
          </div>
          {uploadedFiles.map((file, index) => (
            <Chip key={index} label={file} onDelete={handleDelete(index)} />
          ))}
          <Button variant="contained" color="primary" onClick={handleReports}>
            Generate Report
          </Button>
        </div>
      </div>
      <div className="flex flex-col w-2/3 h-full m-4">
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      sx={{ bgcolor: "lightblue" }}
                      key={column.id}
                      align={column.align}
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={row.nic}
                      >
                        {columns.map((column) => {
                          const value = row[column.id];
                          return (
                            <TableCell key={column.id} align={column.align}>
                              {value}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={filteredRecords.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </div>

      {/* Dialog Component */}
      <ReportDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        filteredRecords={filteredRecords}
      />
    </div>
  );
}

export default Records;

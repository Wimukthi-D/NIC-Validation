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
import MenuItem from "@mui/material/MenuItem";

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
  const [genderFilter, setGenderFilter] = useState("");

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
              const combinedRecords = [...records, ...response.data];
              setRecords(combinedRecords); // Update the records state with the new data

              // Apply existing filters
              const nicFiltered = applyNicFilter(combinedRecords, nicFilter);
              const genderFiltered = applyGenderFilter(
                nicFiltered,
                genderFilter
              );

              setFilteredRecords(genderFiltered);
              console.log(response.data);
            })
            .catch((error) => {
              console.error("Error uploading data:", error);
            });
        },
      });
    });
  };

  const applyNicFilter = (data, filter) => {
    if (filter === "") return data;
    return data.filter(
      (record) =>
        record.nic.toLowerCase().includes(filter) ||
        record.age.toString().includes(filter) ||
        record.birthday.toLowerCase().includes(filter)
    );
  };

  const applyGenderFilter = (data, filter) => {
    if (filter === "") return data;
    return data.filter((record) => record.gender.toLowerCase() === filter);
  };

  const handleNicFilterChange = (event) => {
    const value = event.target.value.toLowerCase();
    setNicFilter(value);

    const nicFiltered = applyNicFilter(records, value);
    const genderFiltered = applyGenderFilter(nicFiltered, genderFilter);

    setFilteredRecords(genderFiltered);
  };

  const handleGenderFilterChange = (event) => {
    const gender = event.target.value.toLowerCase(); // Convert to lowercase for consistency
    setGenderFilter(gender);

    const nicFiltered = applyNicFilter(records, nicFilter);
    const genderFiltered = applyGenderFilter(nicFiltered, gender);

    setFilteredRecords(genderFiltered);
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

      <div className="flex mt-10 w-2/3 justify-center space-x-2">
        <div className="flex w-1/2 gap-4">
          <TextField
            id="gender-filter"
            label="Gender"
            variant="outlined"
            size="small"
            select
            value={genderFilter}
            fullWidth
            onChange={handleGenderFilterChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
          </TextField>
          <TextField
            id="outlined-basic"
            label="Search"
            variant="outlined"
            size="small"
            value={nicFilter}
            fullWidth
            onChange={handleNicFilterChange}
          />
        </div>

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

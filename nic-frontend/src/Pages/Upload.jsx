import React, { useState } from "react";
import Navbar from "../Components/Navbar";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import { UploadFile, Delete } from "@mui/icons-material";
import Papa from "papaparse";
import dayjs from "dayjs";
import axios from "axios";

function Upload() {
  const [files, setFiles] = useState([]);
  const [data, setData] = useState([]);

  const handleFileChange = (event, index) => {
    const selectedFile = event.target.files[0];
    const updatedFiles = [...files];
    updatedFiles[index] = selectedFile;
    setFiles(updatedFiles);
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    const updatedData = data.filter((_, i) => i !== index);
    setData(updatedData);
  };

  const extractNicInfo = (nic) => {
    if (!nic || (nic.length !== 10 && nic.length !== 12)) {
      return { birthday: "Invalid NIC", gender: "N/A", age: "N/A" };
    }

    let birthYear, dayOfYear, gender, age;
    const currentYear = dayjs().year();

    if (nic.length === 10) {
      // Old format: XXXXXXXXXV
      birthYear = parseInt(nic.substring(0, 2), 10) + 1900;
      dayOfYear = parseInt(nic.substring(2, 5), 10);
      gender = dayOfYear > 500 ? "Female" : "Male";
      dayOfYear = dayOfYear > 500 ? dayOfYear - 500 : dayOfYear;
    } else if (nic.length === 12) {
      // New format: YYYYXXXXXXXXX
      birthYear = parseInt(nic.substring(0, 4), 10);
      dayOfYear = parseInt(nic.substring(4, 7), 10);
      gender = dayOfYear > 500 ? "Female" : "Male";
      dayOfYear = dayOfYear > 500 ? dayOfYear - 500 : dayOfYear;
    }

    const birthDate = dayjs(`${birthYear}-01-01`).add(dayOfYear - 1, "day");
    age = currentYear - birthDate.year();

    return {
      birthday: birthDate.format("YYYY-MM-DD"),
      gender,
      age,
    };
  };

  const handleUpload = () => {
    let combinedData = [];

    files.forEach((file, fileIndex) => {
      Papa.parse(file, {
        header: false,
        complete: (result) => {
          const extractedData = result.data.map((row) => {
            const nic = row[0];
            const { birthday, gender, age } = extractNicInfo(nic);
            return { nic, birthday, gender, age };
          });

          combinedData = [...combinedData, ...extractedData];

          // Only update the state after the last file is processed
          if (fileIndex === files.length - 1) {
            setData(combinedData);
          }
        },
      });
    });
  };

  console.log(data);

  const handleSubmit = () => {
    fetch("https://localhost:8080/api/nic/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),

    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error("Error:", error));
  };

  const handleSubmit2 = () => {
    axios.post("https://localhost:8080/api/nic/save", data)
    .then((response) => console.log(response))
  }

  return (
    <div className="flex flex-col w-screen h-screen">
      <Navbar />
      <div className="flex w-full h-full">
        <div className="flex flex-col w-1/3 h-full p-4 space-y-4">
          {files.map((file, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                accept=".csv"
                style={{ display: "none" }}
                id={`raised-button-file-${index}`}
                type="file"
                onChange={(e) => handleFileChange(e, index)}
              />
              <label htmlFor={`raised-button-file-${index}`}>
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadFile />}
                >
                  {file ? file.name : "Upload CSV File"}
                </Button>
              </label>
              {file && (
                <IconButton
                  onClick={() => handleRemoveFile(index)}
                  color="secondary"
                >
                  <Delete />
                </IconButton>
              )}
            </div>
          ))}
          {files.length < 4 && (
            <div className="flex items-center space-x-2">
              <input
                accept=".csv"
                style={{ display: "none" }}
                id={`raised-button-file-${files.length}`}
                type="file"
                onChange={(e) => handleFileChange(e, files.length)}
              />
              <label htmlFor={`raised-button-file-${files.length}`}>
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<UploadFile />}
                >
                  Upload CSV File
                </Button>
              </label>
            </div>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={files.length === 0}
          >
            Submit
          </Button>
        </div>
        <div className="flex flex-col w-2/3  h-full p-4">
          <div className="flex flex-col h-full">
            <div className="flex justify-end mr-10 mb-4 gap-4">
              <Button
                variant="contained"
                color="error"
                onClick={() => setData([])}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </div>
            <TableContainer
              component={Paper}
              className="flex h-full w-full border"
            >
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>NIC</TableCell>
                    <TableCell>Birthday</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>Age</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.nic}</TableCell>
                      <TableCell>{row.birthday}</TableCell>
                      <TableCell>{row.gender}</TableCell>
                      <TableCell>{row.age}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload;

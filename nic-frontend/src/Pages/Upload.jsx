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
import Swal from "sweetalert2";

function Upload() {
  const [files, setFiles] = useState([]);
  const [data, setData] = useState({});

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);

    selectedFiles.forEach((file) => {
      Papa.parse(file, {
        complete: (result) => {
          setData((prevData) => ({
            ...prevData,
            [file.name]: result.data,
          }));
        },
        header: true,
      });
    });

    setFiles([...files, ...selectedFiles]);
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);

    const fileName = files[index].name;
    const updatedData = { ...data };
    delete updatedData[fileName];
    setData(updatedData);
  };

  const handleUpload = () => {
    const combinedData = files.map((file) => ({
      fileName: file.name,
      data: data[file.name],
    }));

    try {
      axios
        .post("http://localhost:3001/nic/validate", combinedData)
        .then((response) => {
          console.log(response);
        });

      Swal.fire({
        icon: "success",
        title: "Data has been saved successfully",
        showConfirmButton: false,
        timer: 1500,
      });

      setData({});
      setFiles([]);
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "An error occurred",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen">
      <Navbar />
      <div className="flex w-full h-full">
        <div className="flex flex-col w-1/3 items-center h-full p-4 space-y-4">
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
          <div className="flex items-center space-x-2">
            <input
              accept=".csv"
              style={{ display: "none" }}
              id="raised-button-file"
              type="file"
              onChange={handleFileChange}
              multiple
            />
            <label htmlFor="raised-button-file">
              <Button
                variant="contained"
                component="span"
                startIcon={<UploadFile />}
              >
                Upload CSV Files
              </Button>
            </label>
          </div>
          <div className="flex w1/2">
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={files.length === 0}
            >
              Submit
            </Button>
          </div>
        </div>
        <div className="flex flex-col w-2/3 h-full p-4"></div>
      </div>
    </div>
  );
}

export default Upload;

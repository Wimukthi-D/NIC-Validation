import React, { useState } from "react";
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
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { UploadFile, Delete } from "@mui/icons-material";
import Papa from "papaparse";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import axios from "axios";
import Swal from "sweetalert2";
import { useDropzone } from "react-dropzone";

function Upload({ onResponse }) {
  const [files, setFiles] = useState([]);
  const [data, setData] = useState({});
  const [savedRecords, setSavedRecords] = useState([]);
  const [uploadComplete, setUploadComplete] = useState(false);

  const onDrop = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {
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

    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

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

    axios
      .post("http://localhost:3001/nic/validate", combinedData)
      .then((response) => {
        onResponse(response.status);
        setSavedRecords(response.data.result);
        setUploadComplete(true); // Hide the upload section
        setData([]);
        setFiles([]);
      })
      .catch((error) => {
        console.log(error);
        Swal.fire({
          icon: "error",
          title: "An error occurred",
          showConfirmButton: false,
          timer: 1500,
          zindex: 99999,
        });
      });
  };

  return (
    <Box
      className="flex flex-col w-full h-full"
      sx={{ p: 4, bgcolor: "lightcyan" }}
    >
      <Box className="flex w-full justify-items-center ">
        {!uploadComplete && (
          <Box className="flex flex-col w-full items-center p-4 space-y-4 my-20">
            <Box
              {...getRootProps()}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed gray",
                borderRadius: "12px",
                px: 4,
                py: 15,
                cursor: "pointer",
                bgcolor: "lightblue",
              }}
            >
              <input {...getInputProps()} accept=".csv" />
              <Typography variant="h6" color="textSecondary">
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileUploadIcon sx={{ fontSize: "8rem", color: "#607d8b" }} />
                </Box>
                Drop or Click here to upload files
              </Typography>
            </Box>

            {files.map((file, index) => (
              <Box
                key={index}
                className="flex items-center space-x-2"
                sx={{ mt: 2 }}
              >
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadFile />}
                  sx={{ textTransform: "none" }}
                >
                  {file.name}
                </Button>
                <IconButton
                  onClick={() => handleRemoveFile(index)}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </Box>
            ))}

            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={files.length === 0}
              sx={{ mt: 4, width: "50%" }}
            >
              Submit
            </Button>
          </Box>
        )}

        {uploadComplete && (
          <Box className="flex flex-col w-full">
            {savedRecords.map((fileData, index) => (
              <Box
                key={index}
                className="flex-col w-full p-4"
                sx={{
                  mb: 4,
                  border: 1,
                  borderRadius: 2,
                  borderColor: "lightgray",
                  bgcolor: "white",
                }}
              >
                <Typography variant="h6" color="textPrimary" sx={{ mb: 2 }}>
                  {fileData.fileName}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer component={Paper} sx={{ mb: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "lightblue" }}>
                        <TableCell>NIC</TableCell>
                        <TableCell>Birthday</TableCell>
                        <TableCell>Gender</TableCell>
                        <TableCell>Age</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fileData.records.map((record, idx) => (
                        <TableRow key={idx}>
                          <TableCell
                            sx={{
                              color: !record.isValid ? "#ff1744" : "inherit",
                            }}
                          >
                            {record.nic}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: !record.isValid ? "#ff1744" : "inherit",
                            }}
                          >
                            {record.birthday}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: !record.isValid ? "#ff1744" : "inherit",
                            }}
                          >
                            {record.gender}
                          </TableCell>
                          <TableCell>{record.age}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Upload;

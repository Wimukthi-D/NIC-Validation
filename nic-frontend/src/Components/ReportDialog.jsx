import React, { useEffect, useRef } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import DownloadIcon from "@mui/icons-material/Download";
import * as XLSX from "xlsx";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title);

const ReportDialog = ({ open, onClose, filteredRecords }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.chartInstance.destroy();
      }
    };
  }, []);

  const handleDownloadCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      filteredRecords
        .map((e) => `${e.nic},${e.birthday},${e.gender},${e.age}`)
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "filtered_data.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleDownloadPDF = async () => {
    const doc = new jsPDF();
    doc.text("Filtered Records", 10, 10);

    const chartCanvas = chartRef.current.$context.chart.canvas;
    const chartImage = chartCanvas.toDataURL("image/png");

    doc.addImage(chartImage, "PNG", 10, 20, 180, 100);

    doc.autoTable({
      startY: 130,
      head: [["NIC", "Birthday", "Gender", "Age"]],
      body: filteredRecords.map((row) => [
        row.nic,
        row.birthday,
        row.gender,
        row.age,
      ]),
    });

    doc.save("filtered_data.pdf");
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredRecords);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Records");
    XLSX.writeFile(workbook, "filtered_data.xlsx");
  };

  // Group records by decade
  const groupedByDecade = filteredRecords.reduce((acc, record) => {
    const decade =
      Math.floor(new Date(record.birthday).getFullYear() / 10) * 10;
    if (!acc[decade]) {
      acc[decade] = 0;
    }
    acc[decade]++;
    return acc;
  }, {});

  // Prepare chart data
  const chartData = {
    labels: Object.keys(groupedByDecade),
    datasets: [
      {
        label: "Number of Records",
        data: Object.values(groupedByDecade),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Filtered Data Report
        <IconButton
          aria-label="close"
          onClick={onClose}
          style={{ position: "absolute", right: 8, top: 8, color: "grey" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <div>
          <Bar ref={chartRef} data={chartData} />
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">NIC</TableCell>
              <TableCell align="center">Birthday</TableCell>
              <TableCell align="center">Gender</TableCell>
              <TableCell align="center">Age</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.map((record, index) => (
              <TableRow key={index}>
                <TableCell align="center">{record.nic}</TableCell>
                <TableCell align="center">{record.birthday}</TableCell>
                <TableCell align="center">{record.gender}</TableCell>
                <TableCell align="center">{record.age}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDownloadCSV} variant="contained">
          <DownloadIcon /> CSV
        </Button>
        <Button onClick={handleDownloadPDF} variant="contained">
          <DownloadIcon /> PDF
        </Button>
        <Button onClick={handleDownloadExcel} variant="contained">
          <DownloadIcon /> Excel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDialog;

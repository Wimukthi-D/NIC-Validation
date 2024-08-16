import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import axios from "axios";
import BarChart from "../Components/BarChart";
import PieChart from "../Components/PieChart";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";

function Dashboard() {
  const [totalCount, setTotalCount] = useState(0);
  const [genderCount, setGenderCount] = useState({
    male: 0,
    female: 0,
  });
  const [recordsByYear, setRecordsByYear] = useState({});

  useEffect(() => {
    axios.get("http://localhost:3001/nic/getRecordCount").then((response) => {
      setGenderCount({
        male: response.data.male,
        female: response.data.female,
      });
      setTotalCount(response.data.male + response.data.female);
    });
  }, []);

  return (
    <div className="flex flex-col w-screen h-screen">
      <Navbar />

      <div className="flex m-4 h-1/4">
        <Grid container alignItems="center" spacing={3}>
          <Grid item xs={12} sm={6}>
            <Card
              variant="outlined"
              sx={{ backgroundColor: "#f5f5f5", padding: "16px" }}
            >
              <CardContent>
                <Typography variant="h6" color="textPrimary">
                  Total Number of Records
                </Typography>
                <Typography variant="h4" color="primary">
                  {totalCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card
              variant="outlined"
              sx={{ backgroundColor: "#e0f7fa", padding: "16px" }}
            >
              <CardContent>
                <Typography variant="h6" color="textPrimary">
                  Male
                </Typography>
                <Typography variant="h4" color="secondary">
                  {genderCount.male}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card
              variant="outlined"
              sx={{ backgroundColor: "#fce4ec", padding: "16px" }}
            >
              <CardContent>
                <Typography variant="h6" color="textPrimary">
                  Female
                </Typography>
                <Typography variant="h4" color="secondary">
                  {genderCount.female}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
      <div className="flex w-screen h-3/4">
        <div className="flex w-2/3">
          <BarChart />
        </div>
        <div className="flex w-1/3">
          <PieChart />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

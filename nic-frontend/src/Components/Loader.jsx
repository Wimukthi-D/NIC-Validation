import * as React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

export default function CircularIndeterminate() {
  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen m-56">
      <CircularProgress />
    </div>
  );
}

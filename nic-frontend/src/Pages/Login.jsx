import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  CssBaseline,
  Avatar,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const Login = () => {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [open, setOpen] = useState(false);
  const [showpassword, setShowpassword] = useState(false);
  const [errors, setErrors] = useState({});

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handlepasswordVisibility = () => {
    setShowpassword(!showpassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "firstName" || name === "lastName") {
      newValue = newValue.slice(0, 20); // Limit to 20 characters for Address
      newValue = newValue.replace(/[0-9]/g, ""); // Allow only alphabets
    } else if (name === "email") {
      newValue = newValue.slice(0, 50); // Limit to 50 characters for email
    }
    setUserData({ ...userData, [name]: newValue });
    setErrors({ ...errors, [name]: "" }); // Clear the error when input changes
  };

  const handleClose = () => {
    setOpen(false);
    setUserData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    });
    setErrors({});
    setShowpassword(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const data = {
      email: email,
      password: password,
    };

    try {
      const response = await axios.post(
        "http://localhost:8080/api/users/auth",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Success:", response.data);
    } catch (error) {
      if (error.response) {
        console.error("Error response:", error.response.data);
      } else if (error.request) {
        console.error("Error request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/users",
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Success:", response.data);
      handleClose();
    } catch (error) {
      if (error.response) {
        console.error("Error response:", error.response.data);
        setErrors(error.response.data);
      } else if (error.request) {
        console.error("Error request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-500">
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          p: 10,
          scale: "20%",
          transformOrigin: "top left",
        }}
      ></Box>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Container
          component="main"
          maxWidth="xs"
          sx={{ bgcolor: "rgba(255, 255, 255, 0.1)", borderRadius: 2, p: 2 }}
          style={{ backdropFilter: "blur(10px)" }}
        >
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography
              component="h1"
              sx={{ color: "white", scale: "150%", py: 2 }}
            >
              Login
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 1, mb: 5 }}
            >
              <TextField
                margin="normal"
                variant="outlined"
                required
                fullWidth
                id="email"
                label="email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setemail(e.target.value)}
                InputProps={{
                  style: {
                    color: "white",
                  },
                  sx: {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.4)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.8)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.8)",
                    },
                  },
                }}
                InputLabelProps={{
                  style: { color: "rgba(255, 255, 255, 0.5)" },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setpassword(e.target.value)}
                InputProps={{
                  style: {
                    color: "white",
                  },
                  sx: {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.4)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.8)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.8)",
                    },
                  },
                }}
                InputLabelProps={{
                  style: { color: "rgba(255, 255, 255, 0.5)" },
                }}
              />
              <Box
                sx={{ display: "flex", justifyContent: "center", gap: "20px" }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  onClick={handleSubmit}
                  sx={{ mt: 3, mb: 2, width: "40%", borderRadius: 3 }}
                >
                  Sign In
                </Button>
                <Button
                  type="register"
                  variant="contained"
                  color="secondary"
                  onClick={setOpen}
                  sx={{ mt: 3, mb: 2, width: "40%", borderRadius: 3 }}
                >
                  Sign Up
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
      <Dialog
        open={open}
        aria-labelledby="form-dialog-title"
        disableEscapeKeyDown={true}
        BackdropProps={{
          style: { backdropFilter: "blur(5px)" },
          invisible: true, // This will prevent backdrop click
        }}
      >
        <DialogTitle
          id="form-dialog-title"
          className="text-center font-extrabold"
        >
          User Registration
        </DialogTitle>
        <div className="mb-3">
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleChange}
                  fullWidth
                  error={Boolean(errors.firstName)}
                  helperText={errors.firstName}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleChange}
                  fullWidth
                  error={Boolean(errors.lastName)}
                  helperText={errors.lastName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="email"
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  fullWidth
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="password"
                  type={showpassword ? "text" : "password"}
                  name="password"
                  value={userData.password}
                  onChange={handleChange}
                  fullWidth
                  error={Boolean(errors.password)}
                  helperText={errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handlepasswordVisibility}>
                          {showpassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
        </div>
        <DialogActions className=" mb-4">
          <div className="flex w-full justify-center">
            <div className="mx-5 flex w-1/2">
              <Button
                onClick={handleAddUser}
                variant="contained"
                fullWidth
                color="success"
              >
                Register
              </Button>
            </div>

            <div className="mx-5 w-1/2">
              <Button
                onClick={handleClose}
                fullWidth
                variant="contained"
                color="error"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Login;

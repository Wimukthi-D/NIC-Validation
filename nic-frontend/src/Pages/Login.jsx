import React, { useState, useRef } from "react";
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
  Link,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Swal from "sweetalert2";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [openForgotPassword, setOpenForgotPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [otpdialog, setOtpDialog] = useState(false);
  const [otp, setOtp] = useState("");
  const [userOtp, setUserOtp] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", ""]);
  const [attempts, setAttempts] = useState(0);
  const otpRefs = useRef([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [NewPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userData, setUserData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
    password: "",
  });

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleResetPassword = async () => {
    if (NewPassword === confirmPassword) {
      try {
        const data = {
          email: email,
          password: NewPassword,
        };
        console.log("Request Data:", data);
        const response = await axios.post(
          "http://localhost:3001/user/reset-pw",
          data
        );

        console.log("Success:", response.data);
        setOpenDialog(false);
        setEmail("");
        setNewPassword("");
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
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;

    if (value.length <= 1) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);

      const combinedOtp = newOtpValues.join("");
      setUserOtp(combinedOtp);

      if (value && index < otpRefs.current.length - 1) {
        otpRefs.current[index + 1].focus();
      }
    }

    setErrors({ otp: "" });
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "firstname" || name === "lastname") {
      newValue = newValue.slice(0, 20); // Limit to 20 characters
      newValue = newValue.replace(/[0-9]/g, ""); // Allow only alphabets
    } else if (name === "email") {
      newValue = newValue.slice(0, 50); // Limit to 50 characters
    }
    setUserData({ ...userData, [name]: newValue });
    setErrors({ ...errors, [name]: "" }); // Clear the error when input changes
  };

  const validateForm = () => {
    let formErrors = {};
    if (!username) formErrors.username = "Username is required";
    if (!password) formErrors.password = "Password is required";
    if (userData.firstname && userData.firstname.length < 3)
      formErrors.firstname = "First Name must be at least 3 characters";
    if (userData.lastname && userData.lastname.length < 3)
      formErrors.lastname = "Last Name must be at least 3 characters";
    if (userData.email && !/\S+@\S+\.\S+/.test(userData.email))
      formErrors.email = "Email is not valid";
    if (userData.password && userData.password.length < 6)
      formErrors.password = "Password must be at least 6 characters";

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const data = {
      username: username,
      password: password,
    };
    console.log("Request Data:", data);
    try {
      const response = await axios.post(
        "http://localhost:3001/user/login",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 304) {
        Swal.fire({
          icon: "warning",
          title: "Received 304 Not Modified response",
          showConfirmButton: false,
          timer: 1500,
        });
      } else if (response.status === 404) {
        Swal.fire({
          icon: "error",
          title: "Service not found",
          showConfirmButton: false,
          timer: 1500,
        });
      } else if (response.status === 400) {
        Swal.fire({
          icon: "error",
          title: "Bad Request",
          text: response.data,
          showConfirmButton: false,
          timer: 1500,
        });
      } else if (response.status === 500) {
        Swal.fire({
          icon: "error",
          title: "Internal Server Error",
          showConfirmButton: false,
          timer: 1500,
        });
      } else if (response.status === 401) {
        Swal.fire({
          icon: "error",
          title: "Authentication Error",
          text: "Invalid username or password",
          showConfirmButton: false,
          timer: 1500,
        });
      }
      console.log("Success:", response.data);
      const token = response.data.token;
      localStorage.setItem("token", JSON.stringify({ token }));
    } catch (error) {
      if (error.response) {
        Swal.fire({
          icon: "error",
          title: error.response.data.error,
          showConfirmButton: false,
          timer: 1500,
        });
        console.error("Error response:", error.response.data);
      } else if (error.request) {
        console.error("Error request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
    }
  };

  const handleAddUser = async () => {
    if (!validateForm()) return;

    console.log(userData);
    try {
      const response = await axios.post(
        "http://localhost:3001/user/register",
        userData
      );

      if (response.status === 200) {
        console.log("Success:", response.data);

        Swal.fire({
          icon: "success",
          title: "User registered successfully",
          showConfirmButton: false,
          timer: 1500,
        });

        handleClose();
      }
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
  const handleForgotPassword = async () => {
    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: "Email is not valid" });
      return;
    } else {
      const OTP = Math.floor(1000 + Math.random() * 9000);
      console.log(OTP);
      setOtp(OTP);

      try {
        const response = await axios.post(
          "http://localhost:3001/user/submit-email",
          {
            email: email,
            otp: OTP,
          }
        );
        console.log(response);
        Swal.fire({
          icon: "success",
          title: "OTP sent successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        if (response.status === 200) {
          setOtpDialog(true);
        }
      } catch (error) {
        console.error("Error submitting email:", error);

        Swal.fire({
          icon: "error",
          title: error.response.data.error,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    }

    console.log(email);
    handleCloseForgotPassword();
  };

  const handleClose = () => {
    setOpen(false);
    setUserData({
      firstname: "",
      lastname: "",
      email: "",
      username: "",
      password: "",
    });
    setErrors({});
    setShowPassword(false);
  };

  const handleCloseForgotPassword = () => {
    setOpenForgotPassword(false);
    setErrors({});
  };

  const handleOtp = async () => {
    console.log("Entered OTP:", userOtp);
    console.log("Expected OTP:", otp);

    if (userOtp.length < 4) {
      setErrors({ otp: "OTP is required" });
      return;
    } else if (userOtp === otp.toString()) {
      handleCloseOtp();
      setOpenDialog(true);
      console.log("OTP verified successfully");
    } else if (userOtp !== otp.toString() && attempts < 3) {
      setErrors({
        otp: "Incorrect Passcode. " + (3 - attempts) + " attempts left",
      });
      setAttempts(attempts + 1);
    } else {
      Swal.fire({
        icon: "error",
        title: "You have exceeded the maximum number of attempts",
        showConfirmButton: false,
        timer: 2000,
      });
      setUserOtp("");
      setOtpValues(["", "", "", ""]);
      setAttempts(0);
      handleCloseOtp();
    }
  };

  const handleCloseOtp = () => {
    setOtpDialog(false);
    setOtp("");
    setUserOtp("");
    setErrors({});
  };

  const handleCancelReset = () => {
    setOtp("");
    setOpenDialog(false);
    setErrors({});
    setEmail("");
  };

  const handleCancelOtp = () => {
    setOtp("");
    setOtpDialog(false);
    setErrors({});
    setEmail("");
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
              Welcome Back!
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
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={Boolean(errors.username)}
                helperText={errors.username}
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
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={Boolean(errors.password)}
                helperText={errors.password}
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
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handlePasswordVisibility}>
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
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
                  sx={{ mt: 3, mb: 2, width: "40%", borderRadius: 3 }}
                >
                  Sign In
                </Button>
                <Button
                  type="button"
                  variant="contained"
                  color="secondary"
                  onClick={() => setOpen(true)}
                  sx={{ mt: 3, mb: 2, width: "40%", borderRadius: 3 }}
                >
                  Sign Up
                </Button>
              </Box>
              <Link
                onClick={() => setOpenForgotPassword(true)}
                variant="body2"
                sx={{ color: "white", textAlign: "center" }}
              >
                Forgot password?
              </Link>
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
                  name="firstname"
                  value={userData.firstname}
                  onChange={handleChange}
                  fullWidth
                  error={Boolean(errors.firstname)}
                  helperText={errors.firstname}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Last Name"
                  name="lastname"
                  value={userData.lastname}
                  onChange={handleChange}
                  fullWidth
                  error={Boolean(errors.lastname)}
                  helperText={errors.lastname}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
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
                  label="Username"
                  name="username"
                  value={userData.username}
                  onChange={handleChange}
                  fullWidth
                  error={Boolean(errors.username)}
                  helperText={errors.username}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={userData.password}
                  onChange={handleChange}
                  fullWidth
                  error={Boolean(errors.password)}
                  helperText={errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handlePasswordVisibility}>
                          {showPassword ? <Visibility /> : <VisibilityOff />}
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
      <Dialog
        open={openForgotPassword}
        aria-labelledby="form-dialog-title"
        disableEscapeKeyDown={true}
        fullWidth={true}
        BackdropProps={{
          style: { backdropFilter: "blur(5px)" },
          invisible: true, // This will prevent backdrop click
        }}
      >
        <DialogTitle
          id="form-dialog-title"
          className="text-center font-extrabold"
        >
          Reset your password
        </DialogTitle>
        <div className="mb-3">
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                />
              </Grid>
            </Grid>
          </DialogContent>
        </div>
        <DialogActions className=" mb-4">
          <div className="flex w-full justify-center">
            <div className="mx-5 flex w-1/2">
              <Button
                onClick={handleForgotPassword}
                variant="contained"
                fullWidth
                color="success"
              >
                Submit
              </Button>
            </div>

            <div className="mx-5 w-1/2">
              <Button
                onClick={handleCloseForgotPassword}
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
      <Dialog
        open={otpdialog}
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
          Enter OTP to reset password
        </DialogTitle>
        <div className="mb-3">
          <DialogContent>
            <Grid container spacing={2}>
              {otpValues.map((value, index) => (
                <Grid item xs={3} key={index}>
                  <TextField
                    type="text"
                    inputProps={{
                      maxLength: 1,
                      style: { textAlign: "center" },
                    }}
                    value={value}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    inputRef={(ref) => (otpRefs.current[index] = ref)}
                    error={Boolean(errors.otp)}
                    helperText={index === 0 && errors.otp}
                    fullWidth
                  />
                </Grid>
              ))}
            </Grid>
          </DialogContent>
        </div>
        <DialogActions className=" mb-4">
          <div className="flex w-full justify-center">
            <div className="mx-5 flex w-1/2">
              <Button
                onClick={handleOtp}
                variant="contained"
                fullWidth
                color="success"
              >
                Submit
              </Button>
            </div>

            <div className="mx-5 w-1/2">
              <Button
                onClick={handleCancelOtp}
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

      <Dialog
        open={openDialog}
        aria-labelledby="form-dialog-title"
        disableEscapeKeyDown={true}
        fullWidth={true}
        BackdropProps={{
          style: { backdropFilter: "blur(5px)" },
          invisible: true, // This will prevent backdrop click
        }}
      >
        <DialogTitle
          id="form-dialog-title"
          className="text-center font-extrabold"
        >
          Enter New Password
        </DialogTitle>
        <div className="mb-3">
          <DialogContent>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={NewPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} style={{ marginTop: "16px" }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    error={confirmPassword && NewPassword !== confirmPassword}
                    helperText={
                      confirmPassword && NewPassword !== confirmPassword
                        ? "Passwords do not match"
                        : ""
                    }
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
        </div>
        <DialogActions className=" mb-4">
          <div className="flex w-full justify-center">
            <div className="mx-5 flex w-1/2">
              <Button
                onClick={handleResetPassword}
                variant="contained"
                fullWidth
                color="success"
              >
                Reset Password
              </Button>
            </div>

            <div className="mx-5 w-1/2">
              <Button
                onClick={handleCancelReset}
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

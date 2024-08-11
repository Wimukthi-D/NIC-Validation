package net.wimukthi.nic.Controller;

import lombok.AllArgsConstructor;
import net.wimukthi.nic.Service.UserService;
import net.wimukthi.nic.dto.LoginDto;
import net.wimukthi.nic.dto.UserDto;
import net.wimukthi.nic.payloadresponse.LoginMessage;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/users")
public class UserController {
    private UserService userService;

    //-----------Add User------
    @PostMapping
    public ResponseEntity<UserDto>  createUser(@RequestBody UserDto userDto) {
        System.out.println("Received: " + userDto);
        UserDto savedUser = userService.createUser(userDto);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    //----------Get user by id--------
    @GetMapping("{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable("id") Long userId) {
        UserDto userDto = userService.getUserById(userId);
        return ResponseEntity.ok(userDto);
    }

    //---------Get all users-----
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    //-----------Login--------
    @PostMapping(path = "/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginDto loginDto) {
        LoginMessage loginMessage = userService.loginUser(loginDto);
        return ResponseEntity.ok(loginMessage);
    }



}

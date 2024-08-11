package net.wimukthi.nic.Service;

import net.wimukthi.nic.dto.LoginDto;
import net.wimukthi.nic.dto.UserDto;
import net.wimukthi.nic.payloadresponse.LoginMessage;

import java.util.List;

public interface UserService {
    UserDto createUser(UserDto userDto);

    UserDto getUserById(Long userId);

    List<UserDto> getAllUsers();

    LoginMessage loginUser(LoginDto loginDto);
}

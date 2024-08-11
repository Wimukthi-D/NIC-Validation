package net.wimukthi.nic.Service.impl;

import lombok.AllArgsConstructor;
import net.wimukthi.nic.Entity.User;
import net.wimukthi.nic.Mapper.UserMapper;
import net.wimukthi.nic.Repository.UserRepository;
import net.wimukthi.nic.Service.UserService;
import net.wimukthi.nic.dto.LoginDto;
import net.wimukthi.nic.dto.UserDto;
import net.wimukthi.nic.payloadresponse.LoginMessage;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {

    private UserRepository userRepository;
    @Override
    public UserDto createUser(UserDto userDto) {

        User user = UserMapper.mapToUser(userDto);
        User savedUser = userRepository.save(user);
        return UserMapper.mapToUserDto(savedUser);
    }

    @Override
    public UserDto getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found" + userId));
        return UserMapper.mapToUserDto(user);
    }

    @Override
    public List<UserDto> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map((user) -> UserMapper.mapToUserDto(user))
                .collect(Collectors.toList());
    }

    @Override
    public LoginMessage loginUser(LoginDto loginDto) {
        String msg = "";
        User users = userRepository.findByUsername(loginDto.getUsername());
        if (users != null) {
            String password = loginDto.getPassword();
            String enteredPassword = users.getPassword();
            Boolean isPasswordCorrect = password.equals(enteredPassword);
            if (isPasswordCorrect) {
                Optional<User> user = userRepository.findOneByUsernameAndPassword(loginDto.getUsername(), password);
                if (user.isPresent()) {
                    return new LoginMessage("Login Success",true);
                }
                else {
                    return new LoginMessage("Login Failed",false);
                }
            }
            else {
                return new LoginMessage("Password Not Match",false);
            }
        }
        else
        {
            return new LoginMessage("Username Do Not Found",false);
        }
    }
}

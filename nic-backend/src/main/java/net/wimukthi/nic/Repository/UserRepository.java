package net.wimukthi.nic.Repository;

import net.wimukthi.nic.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findOneByUsernameAndPassword(String username, String password);

    User findByUsername(String username);
}

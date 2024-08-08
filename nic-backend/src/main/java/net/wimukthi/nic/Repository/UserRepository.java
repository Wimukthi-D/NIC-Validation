package net.wimukthi.nic.Repository;

import net.wimukthi.nic.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}

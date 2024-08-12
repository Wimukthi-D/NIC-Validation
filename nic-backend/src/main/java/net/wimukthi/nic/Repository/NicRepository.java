package net.wimukthi.nic.Repository;

import net.wimukthi.nic.Entity.Nic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NicRepository extends JpaRepository<Nic, Long> {
}

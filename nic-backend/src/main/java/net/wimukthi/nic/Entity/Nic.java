package net.wimukthi.nic.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Nics")
public class Nic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "NIC", nullable = false, unique = true)
    private String NIC;

    @Column(name = "date_of_birth")
    private Date birthdate;

    @Column(name = "Age")
    private  Integer age;

    @Column(name = "Gender")
    private  String gender;

}

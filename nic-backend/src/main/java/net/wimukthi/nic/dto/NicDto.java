package net.wimukthi.nic.dto;

import lombok.*;

import java.sql.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class NicDto {

    private String  nic;
    private Date birthday;
    private Integer age;
    private String gender;
}

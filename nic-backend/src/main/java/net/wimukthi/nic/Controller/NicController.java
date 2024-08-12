package net.wimukthi.nic.Controller;


import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import net.wimukthi.nic.Service.NicService;
import net.wimukthi.nic.dto.NicDto;
import net.wimukthi.nic.dto.UserDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@RestController

@RequestMapping("/api/nic")
public class NicController {
    @Autowired
    private NicService nicService;


    //-------Save NIC--------
    @PostMapping(path = "/save")
    public String saveNic(@RequestBody List<NicDto> nicDtos) {

        try {
            for(NicDto nicDto : nicDtos) {
                nicService.saveNic(nicDto);
                //System.out.println(nicDto.toString());
            }
            return "saved!";

        }catch (Exception e) {
            return "save failed!";
        }
    }
}

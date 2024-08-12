package net.wimukthi.nic.Service.impl;

import net.wimukthi.nic.Entity.Nic;
import net.wimukthi.nic.Repository.NicRepository;
import net.wimukthi.nic.Service.NicService;
import net.wimukthi.nic.dto.NicDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service

public class NicServiceImpl implements NicService {

    @Autowired
    private NicRepository NicRepository;

    @Override
    public String saveNic(NicDto nicDto) {

        Nic newNic = new Nic();

        try {

            newNic.setAge(nicDto.getAge());
            newNic.setBirthdate(nicDto.getBirthday());
            newNic.setGender(nicDto.getGender());
            newNic.setNIC(nicDto.getNic());

            return "save successfully";
        }catch (Exception e){
            return "save failed!";
        }



//        System.out.println("service page");
//        Nic nic = NicMapper.maptoNic(nicDto);
//        Nic savedNic = NicRepository.save(nic);

    }
}

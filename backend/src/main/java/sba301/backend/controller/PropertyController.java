package sba301.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import sba301.backend.constants.ApiPath;
import sba301.backend.service.PropertyService;

@RestController
@RequestMapping(ApiPath.PROPERTY)
@RequiredArgsConstructor
@Slf4j
public class PropertyController {
    PropertyService propertyService;

}

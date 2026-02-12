package com.finarg.realestate.client;

import com.finarg.realestate.dto.ScrapedPropertyDTO;
import com.finarg.realestate.enums.OperationType;
import com.finarg.realestate.enums.PropertyType;

import java.util.List;

public interface PropertyClient {

    String getPortalName();

    List<ScrapedPropertyDTO> scrapeProperties(
        String cityCode,
        String neighborhoodCode,
        PropertyType propertyType,
        OperationType operationType
    );

    boolean isAvailableForCity(String cityCode);
}

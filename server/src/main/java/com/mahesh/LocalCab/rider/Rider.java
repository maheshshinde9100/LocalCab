package com.mahesh.LocalCab.rider;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "riders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rider {

    @Id
    private String id;

    private String fullName;

    @Indexed(unique = true)
    private String phoneNumber;

    private String passwordHash;

    private String email;

    private String village;
    private String taluka;
    private String district;
    private String state;
    private String pincode;

    private Double latitude;
    private Double longitude;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}

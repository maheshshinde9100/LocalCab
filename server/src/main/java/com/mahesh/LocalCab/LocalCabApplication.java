package com.mahesh.LocalCab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class LocalCabApplication {

	public static void main(String[] args) {
		SpringApplication.run(LocalCabApplication.class, args);
	}

}

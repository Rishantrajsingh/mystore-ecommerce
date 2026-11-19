package com.example.demo.controller;

import com.example.demo.dto.ChangePasswordDTO;
import com.example.demo.dto.CustomerLoginDTO;
import com.example.demo.dto.CustomerLoginResponseDTO;
import com.example.demo.dto.CustomerRegisterDTO;
import com.example.demo.dto.CustomerResponseDTO;
import com.example.demo.dto.CustomerUpdateDTO;
import com.example.demo.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping("/register")
    public CustomerResponseDTO registerCustomer(@Valid @RequestBody CustomerRegisterDTO dto) {
        return customerService.registerCustomer(dto);
    }

    @PostMapping("/login")
    public CustomerLoginResponseDTO loginCustomer(
            @Valid @RequestBody CustomerLoginDTO dto
    ) {
        return customerService.loginCustomer(dto);
    }

    @GetMapping("/profile")
    public CustomerResponseDTO getCustomerProfile(Authentication authentication) {

        String email = authentication.getName();

        return customerService.getCustomerProfile(email);
    }

    @PutMapping("/profile")
    public CustomerResponseDTO updateCustomerProfile(
            Authentication authentication,
            @Valid @RequestBody CustomerUpdateDTO dto) {

        String email = authentication.getName();

        return customerService.updateCustomerProfile(email, dto);
    }

    @PutMapping("/change-password")
    public String changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordDTO dto
    ) {
        String email = authentication.getName();

        return customerService.changePassword(email, dto);
    }



    // Admin: Get all customers
    @GetMapping("/all")
    public List<CustomerResponseDTO> getAllCustomers() {
        return customerService.getAllCustomers();
    }

    // Admin: Get customer by ID
    @GetMapping("/{id}")
    public CustomerResponseDTO getCustomerById(@PathVariable String id) {
        return customerService.getCustomerById(id);
    }

    // Admin: Delete customer
    @DeleteMapping("/{id}")
    public String deleteCustomer(@PathVariable String id) {
        return customerService.deleteCustomer(id);
    }

}

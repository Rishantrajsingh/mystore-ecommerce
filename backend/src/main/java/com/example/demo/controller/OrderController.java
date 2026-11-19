package com.example.demo.controller;

import com.example.demo.model.Customer;
import com.example.demo.model.Order;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.service.OrderService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;
    private final CustomerRepository customerRepository;

    public OrderController(
            OrderService orderService,
            CustomerRepository customerRepository
    ) {
        this.orderService = orderService;
        this.customerRepository = customerRepository;
    }

    private String getCustomerId(Authentication authentication) {

        Customer customer = customerRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Customer not found"
                ));

        return customer.getId();
    }

    @PostMapping("/checkout")
    public Order checkout(Authentication authentication) {

        String customerId = getCustomerId(authentication);

        return orderService.checkout(customerId);
    }

    @GetMapping
    public List<Order> getAllOrders(Authentication authentication) {

        String customerId = getCustomerId(authentication);

        return orderService.getMyOrders(customerId);
    }

    @GetMapping("/{id}")
    public Order getOrderById(
            @PathVariable String id,
            Authentication authentication
    ) {

        String customerId = getCustomerId(authentication);

        return orderService.getMyOrderById(customerId, id);
    }

    @PutMapping("/{id}/cancel")
    public String cancelOrder(
            @PathVariable String id,
            Authentication authentication
    ) {

        String customerId = getCustomerId(authentication);

        return orderService.cancelMyOrder(customerId, id);
    }

    @PutMapping("/{id}/status")
    public Order updateOrderStatus(
            @PathVariable String id,
            @RequestParam String status
    ) {
        return orderService.updateOrderStatus(id, status);
    }

    @GetMapping("/admin")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/admin/{id}")
    public Order getAdminOrderById(@PathVariable String id) {
        return orderService.getOrderById(id);
    }


}
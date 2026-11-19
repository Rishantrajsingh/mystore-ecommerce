package com.example.demo.controller;

import com.example.demo.dto.ProductRequestDTO;
import com.example.demo.dto.PurchaseRequestDTO;
import com.example.demo.model.Product;
import com.example.demo.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping("/add-product")
    public Product addProduct(@Valid @RequestBody ProductRequestDTO dto) {
        Product product = new Product(null, dto.getName(), dto.getPrice(), dto.getCategory(), dto.getStock());
        return productService.addProduct(product);
    }

    @GetMapping("/all-products")
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/products/{id}")
    public Product getProductById(@PathVariable String id) {
        return productService.getProductById(id);
    }

    @PutMapping("/products/{id}")
    public Product updateProduct(
            @PathVariable String id,
            @RequestBody Product product
    ) {
        return productService.updateProduct(id, product);
    }

    @DeleteMapping("/products/{id}")
    public String deleteProductById(@PathVariable String id) {
        return productService.deleteProduct(id);
    }

    @GetMapping("/products/search")
    public List<Product> searchProducts(@RequestParam String name) {
        return productService.searchByName(name);
    }

    @GetMapping("/products/page")
    public Page<Product> getProductsByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return productService.getProductsByPage(page, size);
    }

    @GetMapping("/products/sort")
    public List<Product> getProductsSortedByPrice(
            @RequestParam(defaultValue = "desc") String direction
    ) {
        return productService.getProductSortedByPrice(direction);
    }

    @GetMapping("/products/page-sorted")
    public Page<Product> getProductsSortedByPriceInPages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        return productService.getProductsSortedByPriceInPages(page, size, direction);
    }

    @GetMapping("/products/filter")
    public List<Product> getProductByPriceRange(
            @RequestParam double minPrice,
            @RequestParam double maxPrice) {
        return productService.getProductByPriceRange(minPrice, maxPrice);
    }

    @GetMapping("/products/category")
    public List<Product> getProductByCategory(@RequestParam String category) {
        return productService.getProductByCategory(category);
    }

    @PostMapping("/products/{id}/purchase")
    public Product purchaseProduct(@PathVariable String id, @Valid @RequestBody PurchaseRequestDTO dto) {
        return productService.purchaseProduct(id, dto.getQuantity());
    }

    @GetMapping("/products/low-stock")
    public List<Product> getLowStockProducts(@RequestParam(defaultValue = "5") int stock) {
        return productService.getLowStockProducts(stock);
    }

    @PatchMapping("/products/{id}/restock")
    public Product updateStocksByProductId(@PathVariable String id, @RequestParam int quantity) {
        return productService.updateStocksByProductId(id, quantity);
    }

}

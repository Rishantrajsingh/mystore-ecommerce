package com.example.demo.service;

import com.example.demo.model.Product;
import com.example.demo.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // add product
    public Product addProduct(Product product) {

        if (productRepository.existsByNameIgnoreCase(product.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Product already exists: " + product.getName());
        }
        return productRepository.save(product);
    }

    // get all products
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // get product by id
    public Product getProductById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product not found " + id
                ));
    }

    // update product
    public Product updateProduct(String id, Product updateProduct) {
        Product product = getProductById(id);

        product.setName(updateProduct.getName());
        product.setPrice(updateProduct.getPrice());
        product.setCategory(updateProduct.getCategory());
        product.setStock(updateProduct.getStock());

        return productRepository.save(product);
    }

    // delete product
    public String deleteProduct(String id) {
        Product product = getProductById(id);
        productRepository.delete(product);

        return "Product deleted successfully";
    }

    // search by name
    public List<Product> searchByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    // pagination
    public Page<Product> getProductsByPage(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findAll(pageable);
    }

    // sorting by price
    public List<Product> getProductSortedByPrice(String direction) {
        Sort sort;

        if (direction.equalsIgnoreCase("asc")) {
            sort = Sort.by(Sort.Direction.ASC, "price");
        } else {
            sort = Sort.by(Sort.Direction.DESC, "price");
        }

        return productRepository.findAll(sort);
    }

    // sorting + pagination
    public Page<Product> getProductsSortedByPriceInPages(int page, int size, String direction) {
        Pageable pageable;

        if (direction.equalsIgnoreCase("asc")) {
            pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "price")) ;
        } else {
            pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "price")) ;
        }

        return productRepository.findAll(pageable);
    }

    // products by price range
    public List<Product> getProductByPriceRange(double minPrice, double maxPrice) {
        if (minPrice > maxPrice) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Minimum price cannot be greater than maximum price");
        } else if (minPrice < 0 || maxPrice < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price cannot be negative");
        }
        return productRepository.findByPriceBetween(minPrice, maxPrice);
    }

    // product by category
    public List<Product> getProductByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    // purchase product
    public Product purchaseProduct(String id, int quantity) {

        Product product = getProductById(id);

        if (quantity <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be greater than zero");
        }

        if (product.getStock() < quantity) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient stock available");
        }

        product.setStock(product.getStock() - quantity);

        return productRepository.save(product);
    }

    public List<Product> getLowStockProducts(int stock) {
        return productRepository.findByStockLessThanEqual(stock);
    }

    public Product updateStocksByProductId(String id, int quantity) {

        Product product = getProductById(id);

        if (quantity <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be greater than zero");
        }

        product.setStock(product.getStock() + quantity);

        return productRepository.save(product);
    }


}

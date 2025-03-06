
import { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:8000/products";

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState("most_viewed");
    const [sort, setSort] = useState("desc");
    const [priceRange, setPriceRange] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchProducts();
    }, [category, sort, priceRange, page]);



    const fetchProducts = async () => {
        try {
            const { data } = await axios.get(API_URL, {
                params: {
                    category,
                    sort,
                    maxPrice: priceRange,
                    page,
                },
            });


            if (data.products && data.products.length > 0) {
                setProducts(data.products);
            } else {
                setProducts([]);
            }

            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };




    return (
        <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
            <Container className="text-center">
                <h1 className="mb-4 fw-bold">🛒 Product Listing</h1>

                {/* Filters Section */}
                <Form className="mb-4 p-3 shadow-sm bg-light rounded">
                    <Row className="g-3">
                        <Col md={4}>
                            <Form.Select onChange={(e) => setCategory(e.target.value)} className="form-select-lg">
                                <option value="most_viewed">🔥 Most Viewed</option>
                                <option value="most_popular">⭐ Most Popular</option>
                                <option value="most_reviewed">💬 Most Reviewed</option>
                            </Form.Select>
                        </Col>
                        <Col md={4}>
                            <Form.Select onChange={(e) => setSort(e.target.value)} className="form-select-lg">
                                <option value="desc">⬇️ Newest First</option>
                                <option value="asc">⬆️ Oldest First</option>
                            </Form.Select>
                        </Col>
                        <Col md={4}>
                            <Form.Control
                                type="number"
                                placeholder="💰 Max Price"
                                className="form-control-lg"
                                onChange={(e) => setPriceRange(e.target.value)}
                            />
                        </Col>
                    </Row>
                </Form>

                {/* Product List */}
                <Row className="justify-content-center">
                    {products && products.length > 0 ? (
                        products.map((product) => (
                            <Col key={product._id} md={4} className="mb-4">
                                <Card className="shadow-sm border-0 product-card">

                                    <Card.Body className="text-center">
                                        <Card.Title className="fw-bold">{product.name}</Card.Title>
                                        <Card.Text className="text-muted">
                                            Price: <strong>${product.price}</strong>
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    ) : (
                        <Col>
                            <p>No products found.</p>
                        </Col>
                    )}
                </Row>

                {/* Pagination Controls */}
                <div className="d-flex justify-content-between align-items-center mt-4">
                    <Button variant="outline-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
                        ⬅️ Previous
                    </Button>
                    <span className="fw-bold">Page {page} of {totalPages}</span>
                    <Button variant="outline-secondary" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                        Next ➡️
                    </Button>
                </div>

                {/* Add Product Button */}
                <div className="text-center mt-4">
                    <Link to="/add-product">
                        <Button variant="success" size="lg">➕ Add Product</Button>
                    </Link>
                </div>
            </Container>

            <style>{`
        .product-card {
          transition: transform 0.2s, box-shadow 0.3s;
        }
        .product-card:hover {
          transform: scale(1.05);
          box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
        }
        .product-image {
          height: 220px;
          object-fit: cover;
        }
        body, html {
          height: 100%;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
        </div>
    );
};

export default HomePage;

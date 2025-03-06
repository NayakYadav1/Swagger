
import { useState } from "react";
import axios from "axios";
import { Container, Form, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000/products";

const AddProduct = () => {
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "most_viewed",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await axios.post(API_URL, formData);
            navigate("/");
        } catch (error) {
            console.error("Error adding product:", error);
            setError("Failed to add product. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
            <Container className="text-center">
                <Card className="shadow-lg border-0 p-4 bg-white mx-auto text-center custom-card">
                    <h2 className="mb-4 fw-bold text-primary">➕ Add New Product</h2>

                    {error && <p className="text-danger">{error}</p>}

                    <Form onSubmit={handleSubmit} className="text-start">
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">📌 Product Name</Form.Label>
                            <Form.Control
                                name="name"
                                placeholder="Enter product name"
                                onChange={handleChange}
                                required
                                className="form-control-lg"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">💰 Price</Form.Label>
                            <Form.Control
                                name="price"
                                type="number"
                                placeholder="Enter price"
                                onChange={handleChange}
                                required
                                className="form-control-lg"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">📂 Category</Form.Label>
                            <Form.Select
                                name="category"
                                onChange={handleChange}
                                className="form-select-lg"
                            >
                                <option value="most_viewed">🔥 Most Viewed</option>
                                <option value="most_popular">⭐ Most Popular</option>
                                <option value="most_reviewed">💬 Most Reviewed</option>
                            </Form.Select>
                        </Form.Group>

                        <div className="d-flex justify-content-between mt-4">
                            <Button
                                variant="secondary"
                                size="lg"
                                onClick={() => navigate("/")}
                                disabled={loading}
                            >
                                🔙 Cancel
                            </Button>

                            <Button
                                type="submit"
                                variant="success"
                                size="lg"
                                disabled={loading}
                                className="fw-bold"
                            >
                                {loading ? "Adding..." : "✅ Add Product"}
                            </Button>
                        </div>
                    </Form>
                </Card>
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

export default AddProduct;

import { useState, useEffect } from 'react';
import axios from 'axios';
import './ClientPanel.css';

function ClientPanel() {
  const [products, setProducts] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchPrice, setSearchPrice] = useState('');
  const [error, setError] = useState('');

  // Загрузка продуктов
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProducts(response.data);
      } catch (err) {
        setError('Failed to fetch products');
      }
    };
    fetchProducts();
  }, []);

  // Фильтрация продуктов по поиску
  const filteredProducts = products.filter(
    (product) =>
      product.nomenclature_name.toLowerCase().includes(searchName.toLowerCase()) &&
      (searchPrice === '' || product.price.toString().includes(searchPrice))
  );

  return (
    <div className="client-panel">
      <h2 className="client-panel__title">Client Panel</h2>

      {/* Поиск */}
      <div className="client-panel__search-container">
        <h3 className="client-panel__subtitle">Search Products</h3>
        <div className="client-panel__search">
          <input
            type="text"
            placeholder="Search by Nomenclature"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="client-panel__input client-panel__input--search"
          />
          <input
            type="number"
            placeholder="Search by Price"
            value={searchPrice}
            onChange={(e) => setSearchPrice(e.target.value)}
            step="0.01"
            className="client-panel__input client-panel__input--search"
          />
        </div>
      </div>

      {/* Список продуктов */}
      <div className="client-panel__product-list">
        <h3 className="client-panel__subtitle">Product List</h3>
        {filteredProducts.length === 0 ? (
          <p className="client-panel__no-results">No products found</p>
        ) : (
          <table className="client-panel__table">
            <thead>
              <tr>
                <th>Nomenclature</th>
                <th>Price</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="client-panel__table-row">
                  <td>{product.nomenclature_name || 'Unknown'}</td>
                  <td>${product.price}</td>
                  <td>{product.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {error && <p className="client-panel__error">{error}</p>}
      </div>
    </div>
  );
}

export default ClientPanel;
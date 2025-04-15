import { useState, useEffect } from 'react';
import axios from 'axios';
import './ManagerPanel.css';

function ManagerPanel() {
  const [products, setProducts] = useState([]);
  const [nomenclatures, setNomenclatures] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [nomenclatureName, setNomenclatureName] = useState('');
  const [nomenclatureId, setNomenclatureId] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchPrice, setSearchPrice] = useState('');
  const [error, setError] = useState('');

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, nomenclaturesResponse, organizationsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/products', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get('http://localhost:5000/api/nomenclatures', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get('http://localhost:5000/api/organizations', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);
        setProducts(productsResponse.data);
        setNomenclatures(nomenclaturesResponse.data);
        setOrganizations(organizationsResponse.data);
      } catch (err) {
        setError('Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  // Добавление номенклатуры
  const handleNomenclatureSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:5000/api/nomenclatures',
        { name: nomenclatureName },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setNomenclatures([...nomenclatures, { id: response.data.id, name: nomenclatureName }]);
      setNomenclatureName('');
    } catch (err) {
      setError('Failed to add nomenclature');
    }
  };

  // Добавление продукта
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:5000/api/products',
        { nomenclatureId, price, quantity, organizationId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setProducts([
        ...products,
        {
          id: response.data.id,
          nomenclature_id: nomenclatureId,
          nomenclature_name:
            nomenclatures.find((n) => n.id === parseInt(nomenclatureId))?.name || 'Unknown',
          price,
          quantity,
          organization_id: organizationId,
          organization_name:
            organizations.find((org) => org.id === parseInt(organizationId))?.name || 'Unknown',
        },
      ]);
      setNomenclatureId('');
      setPrice('');
      setQuantity('');
      setOrganizationId('');
    } catch (err) {
      setError('Failed to add product');
    }
  };

  // Фильтрация продуктов по поиску
  const filteredProducts = products.filter(
    (product) =>
      product.nomenclature_name.toLowerCase().includes(searchName.toLowerCase()) &&
      (searchPrice === '' || product.price.toString().includes(searchPrice))
  );

  return (
    <div className="manager-panel">
      <h2 className="manager-panel__title">Manager Panel</h2>

      {/* Форма добавления номенклатуры */}
      <div className="manager-panel__form-container">
        <h3 className="manager-panel__subtitle">Add Nomenclature</h3>
        <form onSubmit={handleNomenclatureSubmit} className="manager-panel__form">
          <input
            type="text"
            placeholder="Nomenclature Name"
            value={nomenclatureName}
            onChange={(e) => setNomenclatureName(e.target.value)}
            required
            className="manager-panel__input"
          />
          <button type="submit" className="manager-panel__button">
            Add Nomenclature
          </button>
        </form>
      </div>

      {/* Форма добавления продукта */}
      <div className="manager-panel__form-container">
        <h3 className="manager-panel__subtitle">Add Product</h3>
        <form onSubmit={handleProductSubmit} className="manager-panel__form">
          <select
            value={nomenclatureId}
            onChange={(e) => setNomenclatureId(e.target.value)}
            required
            className="manager-panel__select"
          >
            <option value="">Select Nomenclature</option>
            {nomenclatures.map((nomenclature) => (
              <option key={nomenclature.id} value={nomenclature.id}>
                {nomenclature.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            step="0.01"
            className="manager-panel__input"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className="manager-panel__input"
          />
          <select
            value={organizationId}
            onChange={(e) => setOrganizationId(e.target.value)}
            required
            className="manager-panel__select"
          >
            <option value="">Select Organization</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
          <button type="submit" className="manager-panel__button">
            Add Product
          </button>
        </form>
        {error && <p className="manager-panel__error">{error}</p>}
      </div>

      {/* Поиск */}
      <div className="manager-panel__search-container">
        <h3 className="manager-panel__subtitle">Search Products</h3>
        <div className="manager-panel__search">
          <input
            type="text"
            placeholder="Search by Nomenclature"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="manager-panel__input manager-panel__input--search"
          />
          <input
            type="number"
            placeholder="Search by Price"
            value={searchPrice}
            onChange={(e) => setSearchPrice(e.target.value)}
            step="0.01"
            className="manager-panel__input manager-panel__input--search"
          />
        </div>
      </div>

      {/* Список продуктов */}
      <div className="manager-panel__product-list">
        <h3 className="manager-panel__subtitle">Product List</h3>
        {filteredProducts.length === 0 ? (
          <p className="manager-panel__no-results">No products found</p>
        ) : (
          <table className="manager-panel__table">
            <thead>
              <tr>
                <th>Nomenclature</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Organization</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="manager-panel__table-row">
                  <td>{product.nomenclature_name || 'Unknown'}</td>
                  <td>${product.price}</td>
                  <td>{product.quantity}</td>
                  <td>{product.organization_name || 'Unknown'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ManagerPanel;
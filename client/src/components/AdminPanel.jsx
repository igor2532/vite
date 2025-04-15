import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';

function AdminPanel() {
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [unp, setUnp] = useState('');
  const [address, setAddress] = useState('');
  const [searchName, setSearchName] = useState('');
  const [editOrgId, setEditOrgId] = useState(null);
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    fullName: '',
    position: '',
    role: 'client',
    organizationId: '',
  });
  const [editUserId, setEditUserId] = useState(null);
  const [error, setError] = useState('');

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgResponse, userResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/organizations', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get('http://localhost:5000/api/auth/users', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);
        setOrganizations(orgResponse.data);
        setUsers(userResponse.data);
      } catch (err) {
        setError('Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  // Drag & Drop
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('index', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, dropIndex) => {
    const dragIndex = e.dataTransfer.getData('index');
    const newOrganizations = [...organizations];
    const [draggedOrg] = newOrganizations.splice(dragIndex, 1);
    newOrganizations.splice(dropIndex, 0, draggedOrg);
    const updatedOrder = newOrganizations.map((org, index) => ({
      id: org.id,
      display_order: index + 1,
    }));
    setOrganizations(newOrganizations);
    try {
      await axios.post(
        'http://localhost:5000/api/organizations/reorder',
        { order: updatedOrder },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
    } catch (err) {
      setError('Failed to reorder organizations');
    }
  };

  // Создание/редактирование организации
  const handleOrgSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editOrgId) {
        await axios.put(
          `http://localhost:5000/api/organizations/${editOrgId}`,
          { name, unp, address },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setOrganizations(
          organizations.map((org) =>
            org.id === editOrgId ? { ...org, name, unp, address } : org
          )
        );
      } else {
        const response = await axios.post(
          'http://localhost:5000/api/organizations',
          { name, unp, address },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setOrganizations([...organizations, { id: response.data.id, name, unp, address }]);
      }
      setName('');
      setUnp('');
      setAddress('');
      setEditOrgId(null);
    } catch (err) {
      setError('Failed to save organization');
    }
  };

  // Удаление организации
  const handleOrgDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/organizations/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setOrganizations(organizations.filter((org) => org.id !== id));
    } catch (err) {
      setError('Failed to delete organization');
    }
  };

  // Редактирование организации
  const handleOrgEdit = (org) => {
    setEditOrgId(org.id);
    setName(org.name);
    setUnp(org.unp || '');
    setAddress(org.address || '');
  };

  // Создание/редактирование пользователя
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editUserId) {
        const updateData = { ...userForm };
        if (!updateData.password) delete updateData.password; // Не обновляем пароль, если он пустой
        await axios.put(
          `http://localhost:5000/api/auth/users/${editUserId}`,
          updateData,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setUsers(
          users.map((user) =>
            user.id === editUserId ? { ...user, ...updateData } : user
          )
        );
      } else {
        const response = await axios.post(
          'http://localhost:5000/api/auth/register',
          userForm,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setUsers([
          ...users,
          {
            id: response.data.id,
            email: userForm.email,
            full_name: userForm.fullName,
            position: userForm.position,
            role: userForm.role,
            organization_id: userForm.organizationId,
            organization_name: organizations.find(
              (org) => org.id === parseInt(userForm.organizationId)
            )?.name,
          },
        ]);
      }
      setUserForm({
        email: '',
        password: '',
        fullName: '',
        position: '',
        role: 'client',
        organizationId: '',
      });
      setEditUserId(null);
    } catch (err) {
      setError('Failed to save user');
    }
  };

  // Удаление пользователя
  const handleUserDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUsers(users.filter((user) => user.id !== id));
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  // Редактирование пользователя
  const handleUserEdit = (user) => {
    setEditUserId(user.id);
    setUserForm({
      email: user.email,
      password: '',
      fullName: user.full_name || '',
      position: user.position || '',
      role: user.role,
      organizationId: user.organization_id || '',
    });
  };

  // Фильтрация организаций
  const filteredOrganizations = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchName.toLowerCase())
  );

  return (
    <div className="admin-panel">
      <h2 className="admin-panel__title">Admin Panel</h2>

      {/* Форма организации */}
      <div className="admin-panel__form-container">
        <h3 className="admin-panel__subtitle">
          {editOrgId ? 'Edit Organization' : 'Create Organization'}
        </h3>
        <form onSubmit={handleOrgSubmit} className="admin-panel__form">
          <input
            type="text"
            placeholder="Organization Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="admin-panel__input"
          />
          <input
            type="text"
            placeholder="UNP"
            value={unp}
            onChange={(e) => setUnp(e.target.value)}
            className="admin-panel__input"
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="admin-panel__input"
          />
          <button type="submit" className="admin-panel__button">
            {editOrgId ? 'Update' : 'Create'}
          </button>
          {editOrgId && (
            <button
              type="button"
              className="admin-panel__button admin-panel__button--cancel"
              onClick={() => {
                setEditOrgId(null);
                setName('');
                setUnp('');
                setAddress('');
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* Поиск организаций */}
      <div className="admin-panel__search-container">
        <h3 className="admin-panel__subtitle">Search Organizations</h3>
        <input
          type="text"
          placeholder="Search by Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="admin-panel__input admin-panel__input--search"
        />
      </div>

      {/* Список организаций */}
      <div className="admin-panel__org-list">
        <h3 className="admin-panel__subtitle">Organization List</h3>
        {filteredOrganizations.length === 0 ? (
          <p className="admin-panel__no-results">No organizations found</p>
        ) : (
          <ul className="admin-panel__org-ul">
            {filteredOrganizations.map((org, index) => (
              <li
                key={org.id}
                className="admin-panel__org-item"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <span>
                  {org.name} (UNP: {org.unp || 'N/A'}, Address: {org.address || 'N/A'})
                </span>
                <div className="admin-panel__org-actions">
                  <button
                    className="admin-panel__button admin-panel__button--edit"
                    onClick={() => handleOrgEdit(org)}
                  >
                    Edit
                  </button>
                  <button
                    className="admin-panel__button admin-panel__button--delete"
                    onClick={() => handleOrgDelete(org.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Форма пользователя */}
      <div className="admin-panel__form-container">
        <h3 className="admin-panel__subtitle">
          {editUserId ? 'Edit User' : 'Create User'}
        </h3>
        <form onSubmit={handleUserSubmit} className="admin-panel__form">
          <input
            type="email"
            placeholder="Email"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            required
            className="admin-panel__input"
          />
          <input
            type="password"
            placeholder={editUserId ? 'New Password (optional)' : 'Password'}
            value={userForm.password}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
            className="admin-panel__input"
            required={!editUserId}
          />
          <input
            type="text"
            placeholder="Full Name"
            value={userForm.fullName}
            onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
            className="admin-panel__input"
          />
          <input
            type="text"
            placeholder="Position"
            value={userForm.position}
            onChange={(e) => setUserForm({ ...userForm, position: e.target.value })}
            className="admin-panel__input"
          />
          <select
            value={userForm.role}
            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
            className="admin-panel__select"
          >
            <option value="client">Client</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={userForm.organizationId}
            onChange={(e) =>
              setUserForm({ ...userForm, organizationId: e.target.value })
            }
            className="admin-panel__select"
          >
            <option value="">Select Organization</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
          <button type="submit" className="admin-panel__button">
            {editUserId ? 'Update' : 'Create'}
          </button>
          {editUserId && (
            <button
              type="button"
              className="admin-panel__button admin-panel__button--cancel"
              onClick={() =>
                setUserForm({
                  email: '',
                  password: '',
                  fullName: '',
                  position: '',
                  role: 'client',
                  organizationId: '',
                })
              }
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* Список пользователей */}
      <div className="admin-panel__user-list">
        <h3 className="admin-panel__subtitle">User List</h3>
        {users.length === 0 ? (
          <p className="admin-panel__no-results">No users found</p>
        ) : (
          <table className="admin-panel__table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Full Name</th>
                <th>Position</th>
                <th>Role</th>
                <th>Organization</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="admin-panel__table-row">
                  <td>{user.email}</td>
                  <td>{user.full_name || 'N/A'}</td>
                  <td>{user.position || 'N/A'}</td>
                  <td>{user.role}</td>
                  <td>{user.organization_name || 'None'}</td>
                  <td>
                    <button
                      className="admin-panel__button admin-panel__button--edit"
                      onClick={() => handleUserEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="admin-panel__button admin-panel__button--delete"
                      onClick={() => handleUserDelete(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {error && <p className="admin-panel__error">{error}</p>}
      </div>
    </div>
  );
}

export default AdminPanel;
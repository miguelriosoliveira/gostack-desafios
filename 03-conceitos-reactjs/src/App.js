import React, { useEffect, useState } from "react";
import api from "./services/api";

import "./styles.css";

function App() {
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    api.get("repositories").then(({ data }) => setRepos(data));
  }, []);

  async function handleAddRepository() {
    const { data } = await api.post("repositories", {
      title: `Novo repositório ${Date.now()}`,
      techs: ["Node.js", "ReactJS"],
    });
    setRepos([...repos, data]);
  }

  async function handleRemoveRepository(id) {
    await api.delete(`repositories/${id}`);
    setRepos(repos.filter((repo) => repo.id !== id));
  }

  return (
    <div>
      <ul data-testid="repository-list">
        {repos.map(({ id, title }) => (
          <li key={id}>
            {title}
            <button onClick={() => handleRemoveRepository(id)}>Remover</button>
          </li>
        ))}
      </ul>

      <button onClick={handleAddRepository}>Adicionar</button>
    </div>
  );
}

export default App;

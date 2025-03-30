import { useEffect, useState } from "react";
import { api } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

export const Home = () => {
  const [projects, setProjects] = useState<Array<{ _id: string; name: string; users: Array<string> }>>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/project")
      .then((result) => {
        setProjects(Array.isArray(result.data) ? result.data : []);
      })
      .catch(() => {
        setError("Failed to fetch projects.");
        setProjects([]);
      })
      .finally(() => setLoading(false));
  }, []);
  const handleDeleteProject = (projectId: string) => {
    // Replace this with your deletion logic, e.g., call an API to delete the project
    console.log('Deleting project with id:', projectId);
  };

  const createProject = async () => {
    if (!projectName) return alert("Project name is required!");

    try {
      const result = await api.post("/project/create", { name: projectName });
      setProjects((prevProjects) => [...prevProjects, result.data]);
      setModalOpen(false);
      setProjectName("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-800 text-white p-8">
      <div onClick={() => setModalOpen(true)} className="h-16 w-16 flex justify-center items-center bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-full cursor-pointer border border-white/30 shadow-lg transition-all">
        <button className="text-2xl">+</button>
      </div>

      {loading && <p className="text-gray-400 mt-6">Loading projects...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && projects.length === 0 && (
        <p className="text-gray-400 text-lg mt-6">No projects exist 🚀</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 w-full max-w-6xl">
        {projects.map((project) => (
          <div key={project._id} className="relative p-6 bg-white/10 border border-white/20 rounded-lg shadow-xl backdrop-blur-lg hover:bg-white/20 transition">
            {/* Trashbin Icon Button */}
            <button
              onClick={() => handleDeleteProject(project._id)}
              className="absolute top-2 right-2 text-white-500 hover:text-red-700 transition"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>

            <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">
              {project.name}
            </h5>
            <p className="text-gray-400">
              Collaborators: {Array.isArray(project.users) ? project.users.length : 0}
            </p>
            <button
              onClick={() => navigate(`/projects?name=${project.name}`)}
              className="mt-3 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-md hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            >
              Start
            </button>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white/10 p-6 rounded-lg shadow-xl border border-white/20 backdrop-blur-lg">
            <input
              type="text"
              placeholder="Project name..."
              className="border p-2 rounded w-full bg-white/20 text-white placeholder-gray-300"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <div className="mt-4 flex justify-end space-x-4">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500">Cancel</button>
              <button onClick={createProject} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded cursor-pointer hover:from-blue-600 hover:to-purple-600">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { useEffect } from "react";
import type { Task } from "../types/task.types";
import api from "../api/axiosInstance";

function Home() {

  const fetch = async () => {
    try {
      await api.get<Task[]>("/tasks");
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return <></>;
}

export default Home;

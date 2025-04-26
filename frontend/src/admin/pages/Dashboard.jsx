// admin/pages/Dashboard.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const Dashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersRes = await axios.get(`${import.meta.env.VITE_API_URL}/users`);
        const productsRes = await axios.get(`${import.meta.env.VITE_API_URL}/inventory`);

        setTotalUsers(usersRes.data.data.length || 0);
        setTotalProducts(productsRes.data.data.length || 0);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      }
    };

    fetchStats();
  }, []);

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Users",
        backgroundColor: "#A58077",
        data: [5, 10, 15, 30, 50, 60],
      },
      {
        label: "Products",
        backgroundColor: "#E5CBBE",
        data: [3, 6, 9, 12, 15, 20],
      },
    ],
  };

  return (
    <div className="min-h-screen p-8 bg-[#181818] text-[#E5CBBE]">
      <h1 className="text-4xl font-bold mb-8">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#2c2c2c] rounded-xl p-6 flex flex-col items-center justify-center shadow-lg">
          <h2 className="text-2xl font-semibold">Total Users</h2>
          <p className="text-4xl mt-3 text-[#A58077]">{totalUsers}</p>
        </div>

        <div className="bg-[#2c2c2c] rounded-xl p-6 flex flex-col items-center justify-center shadow-lg">
          <h2 className="text-2xl font-semibold">Total Products</h2>
          <p className="text-4xl mt-3 text-[#E5CBBE]">{totalProducts}</p>
        </div>

        <div className="bg-[#2c2c2c] rounded-xl p-6 flex flex-col items-center justify-center shadow-lg">
          <h2 className="text-2xl font-semibold">Revenue (Estimate)</h2>
          <p className="text-4xl mt-3 text-green-400">$3,240</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-[#2c2c2c] rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Monthly Growth</h2>
        <Bar data={chartData} />
      </div>
    </div>
  );
};

export default Dashboard;

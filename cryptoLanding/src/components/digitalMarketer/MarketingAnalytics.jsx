"use client"
import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"
import { Line, Bar, Doughnut } from "react-chartjs-2"
import { fetchMarketingAnalytics } from "../../store/slices/digitalMarketerSlice"
import LoadingSpinner from "../LoadingSpinner"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement)

const MarketingAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7d")
  const dispatch = useDispatch()

  const { marketingAnalytics, analyticsLoading } = useSelector((state) => state.digitalMarketer)

  useEffect(() => {
    dispatch(fetchMarketingAnalytics(selectedPeriod))
  }, [dispatch, selectedPeriod])

  if (analyticsLoading) {
    return <LoadingSpinner />
  }

  if (!marketingAnalytics) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    )
  }

  const { summary, trafficData, salesAnalytics, topProducts, topCategories, userDemographics } = marketingAnalytics

  // Traffic Chart Data
  const trafficChartData = {
    labels: trafficData.map((item) => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: "Page Views",
        data: trafficData.map((item) => item.pageViews),
        borderColor: "rgb(147, 51, 234)",
        backgroundColor: "rgba(147, 51, 234, 0.1)",
        tension: 0.4,
      },
      {
        label: "Unique Visitors",
        data: trafficData.map((item) => item.uniqueVisitors),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  }

  // Sales Chart Data
  const salesChartData = {
    labels: salesAnalytics.map((item) => new Date(item._id).toLocaleDateString()),
    datasets: [
      {
        label: "Sales (₹)",
        data: salesAnalytics.map((item) => item.sales),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 1,
      },
    ],
  }

  // Demographics Chart Data
  const ageGroupsData = {
    labels: userDemographics.ageGroups.map((group) => group.range),
    datasets: [
      {
        data: userDemographics.ageGroups.map((group) => group.percentage),
        backgroundColor: [
          "rgba(239, 68, 68, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(59, 130, 246, 0.8)",
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  }

  const devicesData = {
    labels: userDemographics.devices.map((device) => device.type),
    datasets: [
      {
        data: userDemographics.devices.map((device) => device.percentage),
        backgroundColor: ["rgba(147, 51, 234, 0.8)", "rgba(236, 72, 153, 0.8)", "rgba(14, 165, 233, 0.8)"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Marketing Analytics</h1>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
        >
          <option value="1d">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-md">
                  <span className="text-sm font-medium text-white">₹</span>
                </div>
              </div>
              <div className="flex-1 w-0 ml-5">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">₹{summary.totalRevenue.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-md">
                  <span className="text-sm font-medium text-white">#</span>
                </div>
              </div>
              <div className="flex-1 w-0 ml-5">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                  <dd className="text-lg font-medium text-gray-900">{summary.totalOrders}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-md">
                  <span className="text-sm font-medium text-white">U</span>
                </div>
              </div>
              <div className="flex-1 w-0 ml-5">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{summary.totalUsers}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 rounded-md">
                  <span className="text-sm font-medium text-white">%</span>
                </div>
              </div>
              <div className="flex-1 w-0 ml-5">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Conversion Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">{summary.conversionRate}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-500 rounded-md">
                  <span className="text-sm font-medium text-white">T</span>
                </div>
              </div>
              <div className="flex-1 w-0 ml-5">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Session</dt>
                  <dd className="text-lg font-medium text-gray-900">{summary.avgSessionDuration}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-red-500 rounded-md">
                  <span className="text-sm font-medium text-white">B</span>
                </div>
              </div>
              <div className="flex-1 w-0 ml-5">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Bounce Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">{summary.bounceRate}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Traffic Chart */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Website Traffic</h3>
          <Line data={trafficChartData} options={chartOptions} />
        </div>

        {/* Sales Chart */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Sales Performance</h3>
          <Bar data={salesChartData} options={chartOptions} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Age Demographics */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">User Age Groups</h3>
          <div className="h-64">
            <Doughnut data={ageGroupsData} options={doughnutOptions} />
          </div>
        </div>

        {/* Device Demographics */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Device Usage</h3>
          <div className="h-64">
            <Doughnut data={devicesData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Top Products and Categories */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Top Selling Products</h3>
          <div className="space-y-4">
            {topProducts.slice(0, 5).map((item, index) => (
              <div key={item._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-md">
                      <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                    <p className="text-sm text-gray-500">{item.totalSold} sold</p>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900">₹{item.revenue.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Top Categories</h3>
          <div className="space-y-4">
            {topCategories.slice(0, 5).map((item, index) => (
              <div key={item._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-md">
                      <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.category.name}</p>
                    <p className="text-sm text-gray-500">{item.totalSold} items sold</p>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900">₹{item.revenue.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Location Demographics */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-lg font-medium text-gray-900">User Locations</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {userDemographics.locations.map((location, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-purple-600">{location.percentage}%</div>
              <div className="text-sm text-gray-500">{location.city}</div>
              <div className="text-xs text-gray-400">{location.count} users</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MarketingAnalytics

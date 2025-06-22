import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AreaChartComp({ data }) {
  return (
    <div className=" p-4 rounded">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="score" stroke="#0f172b" fill="#0f172b" />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-gray-500 ">No data to show.</p>
      )}
    </div>
  );
}

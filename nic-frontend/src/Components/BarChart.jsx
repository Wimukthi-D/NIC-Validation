import React, { PureComponent } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default class Example extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    fetch("http://localhost:3001/nic/getYearRange")
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          data: data.map((item) => ({
            name: `${item.decade}s`,
            count: item.record_count,
          })),
        });
      })
      .catch((error) => console.error("Error fetching data:", error));
  }

  render() {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={this.state.data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    );
  }
}

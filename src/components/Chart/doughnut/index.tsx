import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  ChartDataset,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import { DeviceWidth } from "utils/constants";

interface Props {
  labels: string[];
  datasets: ChartDataset<"doughnut">[];
}

ChartJS.register(ArcElement, Tooltip, Legend);

export function DoughnutChart(props: Props) {
  const { datasets, labels } = props;
  const { t } = useTranslation();

  const options: ChartOptions<"doughnut"> = {
    plugins: {
      title: {
        display: false,
        text: t("Stacked chart bar of all department in system"),
      },
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
        },
      },
    },
    responsive: true,
  };

  const data: ChartData<"doughnut"> = {
    labels: labels,
    datasets,
  };
  return (
    <Doughnut
      options={options}
      data={data}
      style={{
        maxHeight: "200px",
        maxWidth: `${
          window.innerWidth < DeviceWidth.MOBILE_WIDTH ? "220px" : ""
        }`,
      }}
    />
  );
}

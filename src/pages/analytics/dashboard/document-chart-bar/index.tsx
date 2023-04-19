import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  LocalizationProvider,
  DesktopDatePicker,
} from "@mui/x-date-pickers";
import { Autocomplete, CircularProgress, Paper, Stack, TextField } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { Department } from "models/system";
import { useSelector } from "hooks";
import { useTranslation } from "react-i18next";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  plugins: {
    title: {
      display: true,
      text: "Chart.js Bar Chart - Stacked",
    },
  },
  responsive: true,
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
};

const labels = [
  "IT",
  "Marketing",
  "HR",
  "Sales",
  "System",
  "Online",
  "Production",
];

export const data = {
  labels,
  datasets: [
    {
      label: "Rejected",
      //   data: labels.map(() => { min: -1000, max: 1000 }),
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: "rgb(255, 99, 132)",
    },
    {
      label: "Approved",
      //   data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
      data: [6, 19, 3, 5, 2, 3],
      backgroundColor: "rgb(75, 192, 192)",
    },
    {
      label: "Waiting",
      //   data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: "rgb(53, 162, 235)",
    },
  ],
};

export function DocumentChartBar() {
  const {t} = useTranslation()
  const [selectedDepartment, setSelectedDepartment] = useState<Department>();
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const { isGetDepartmentsLoading, departmentList } = useSelector(
    (state) => state.system
  );
  const handleChangeStartDate = (value: Dayjs) => {
    setStartDate(value.subtract(1, "day"));
  };

  const handleChangeEndDate = (value: Dayjs) => {
    setEndDate(value.subtract(2, "day"));
  };

  const onChangeSelectedDepartment = (value: Department | null) => {
    if (!value) {
      return;
    }
    setSelectedDepartment(value);
  };

  return (
    <Paper sx={{ p: 10, maxHeight: "600px", borderRadius: 3, maxWidth: '50%' }} elevation={3}>
      <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="end"
          >
            <Autocomplete
              id="asynchronous-demo"
              sx={{
                width: 150,
              }}
              onChange={(e, value) => onChangeSelectedDepartment(value)}
              isOptionEqualToValue={(option, value) =>
                option.departmentName === value.departmentName
              }
              getOptionLabel={(option) => t(option.departmentName)}
              options={departmentList}
              loading={isGetDepartmentsLoading}
              value={selectedDepartment}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  sx={{ borderBottom: "none" }}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {isGetDepartmentsLoading ? (
                          <CircularProgress color="primary" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Stack direction="row" spacing={2}>
                <DesktopDatePicker
                  label="From"
                  inputFormat="DD/MM/YYYY"
                  value={startDate}
                  onChange={(newValue: Dayjs | null) =>
                    handleChangeStartDate(newValue!.add(1, "day"))
                  }
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      disabled
                      sx={{ width: "150px" }}
                      // value={null}
                    />
                  )}
                  disableFuture
                  maxDate={endDate ?? undefined}
                />
                <DesktopDatePicker
                  label="To"
                  inputFormat="DD/MM/YYYY"
                  value={endDate}
                  onChange={(newValue: Dayjs | null) =>
                    handleChangeEndDate(newValue!.add(2, "day"))
                  }
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      sx={{ width: "150px" }}
                      variant="standard"
                      disabled
                    />
                  )}
                  disableFuture
                  minDate={startDate ?? undefined}
                />
              </Stack>
            </LocalizationProvider>
          </Stack>
      <Bar options={options} data={data} />
    </Paper>
  );
}

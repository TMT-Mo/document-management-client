import {
  DialogContent,
  DialogContentText,
  Autocomplete,
  CircularProgress,
  DialogActions,
  Box,
  Typography,
  TextField,
  Theme,
  SxProps,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector, useSignalR } from "hooks";
import { Department } from "models/system";
import {
  clearSharedInfo,
  getSharedDepartment,
  shareDepartment,
} from "slices/document";
import { getDepartmentList } from "slices/system";
import {
  WhiteBtn,
  SaveLoadingBtn,
} from "components/CustomStyled";
import { Stack } from "@mui/material";

interface Props {
  onOpen: () => void;
  value: number;
  idDocument: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  sx?: SxProps<Theme>;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ minWidth: `${window.innerWidth < 720 ? '100%' : '600px'}` }}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const DepartmentTab = (props: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {userInfo} = useSelector(state => state.auth)
  const { isGetDepartmentsLoading, departmentList } = useSelector(
    (state) => state.system
  );
  const {
    isGetSharedDepartmentLoading,
    sharedDepartment,
    isShareDepartmentLoading,
  } = useSelector((state) => state.document);
  const [selectedDepartment, setSelectedDepartment] = useState<Department[]>(
    sharedDepartment
  );
  const { onOpen, value, idDocument } = props;
  const {sendSignalNotification} = useSignalR()

  const onAddSelectedDepartment = (value: Department[]) => {
    if (
      selectedDepartment.find(
        (department) => department.departmentName === "All"
      )
    ) {
      setSelectedDepartment(
        value.filter((department) => department.departmentName !== "All")
      );
      return;
    }
    if (value.find((department) => department.departmentName === "All")) {
      setSelectedDepartment(
        value.filter((department) => department.departmentName === "All")
      );
      return;
    }
    setSelectedDepartment(value);
  };

  const onShareDepartment = async () => {
    await dispatch(
      shareDepartment({
        idDocument,
        departmentIdList: selectedDepartment.map((department) => department.id),
      })
    ).unwrap();
    sendSignalNotification({departmentIds: selectedDepartment.map(d => d.id), notify:{
      isChecked: false,
      description: `You has been shared to view a document by ${userInfo?.userName}!`
    }})
    onOpen();
  };

  useEffect(() => {
    const getDepartment = dispatch(getDepartmentList());
    getDepartment.unwrap();

    return () => getDepartment.abort();
  }, [dispatch]);

  useEffect(() => {
    const getSharedDepartments = dispatch(getSharedDepartment({ idDocument }));
    getSharedDepartments.unwrap();

    return () => getSharedDepartments.abort();
  }, [dispatch, idDocument]);

  useEffect(() => {
    if(sharedDepartment.length === 0) return
    setSelectedDepartment(sharedDepartment)
  }, [sharedDepartment]);

  useEffect(() => {
    return () => {
      dispatch(clearSharedInfo());
    };
  }, [dispatch]);

  return (
    <TabPanel value={value} index={0} >
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          <Stack
            spacing={2}
            sx={{
              // width: "100%",
              color: "#000",
            }}
            // width= '100%'
          >
            <h4>{t("Share Department")}</h4>
            <Autocomplete
              id="asynchronous-demo"
              multiple
              onChange={(e, value) => onAddSelectedDepartment(value!)}
              isOptionEqualToValue={(option, value) =>
                option.departmentName === value.departmentName
              }
              getOptionLabel={(option) => option.departmentName}
              options={departmentList.filter(d => d.departmentName !== 'All')}
              loading={isGetDepartmentsLoading}
              value={selectedDepartment}
              limitTags={2}
              sx={{
                ".MuiAutocomplete-clearIndicator": {
                  // backgroundColor: "#000",
                  scale: "75%",
                },
                ".MuiAutocomplete-popupIndicator": {
                  backgroundColor: "#DBEAFE",
                  scale: "75%",
                },
                ".MuiAutocomplete-popupIndicatorOpen": {
                  backgroundColor: "#2563EB",
                  scale: "75%",
                },
                "& .MuiChip-deleteIcon": {
                  // fill: "#000",
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("To")}
                  sx={{
                    border: "1px solid #fff",
                    borderRadius: "5px",
                  }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <React.Fragment>
                        {isGetDepartmentsLoading ? (
                          <CircularProgress color="primary" size={20} />
                        ) : null}
                        {params.InputProps.startAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
            />

            <Autocomplete
              multiple
              options={sharedDepartment}
              value={sharedDepartment}
              limitTags={2}
              getOptionLabel={(option) => option.departmentName}
              readOnly
              loading={isGetSharedDepartmentLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("Current Sharing:")}
                  variant="standard"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {isGetSharedDepartmentLoading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
            />
            <DialogActions>
              <WhiteBtn onClick={() => onOpen()}>{t('Cancel')}</WhiteBtn>
              <SaveLoadingBtn
                loading={isShareDepartmentLoading}
                onClick={onShareDepartment}
                disabled={selectedDepartment.length === 0}
              >
                {t('Save')}
              </SaveLoadingBtn>
            </DialogActions>
          </Stack>
        </DialogContentText>
      </DialogContent>
    </TabPanel>
  );
};

export default DepartmentTab;

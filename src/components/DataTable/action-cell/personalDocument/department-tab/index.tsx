import {
  DialogContent,
  DialogContentText,
  Autocomplete,
  CircularProgress,
  DialogActions,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { t } from "i18next";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "../../../../../hooks";
import { Department } from "../../../../../models/system";
import {
  changeSharedDepartment,
  clearSharedInfo,
  getSharedDepartment,
  shareDepartment,
} from "../../../../../slices/document";
import ClearIcon from "@mui/icons-material/Clear";
import {
  getDepartmentList,
  toggleDepartmentList,
} from "../../../../../slices/system";
import {
  TextFieldStyled,
  WhiteBtn,
  SaveLoadingBtn,
} from "../../../../CustomStyled";

interface Props {
  onOpen: () => void;
  value: number;
  idDocument: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ minWidth: "600px" }}
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
  const { isGetDepartmentsLoading, departmentList, isOpenDepartmentList } =
    useSelector((state) => state.system);
  const {
    isGetSharedDepartmentLoading,
    sharedDepartment,
    isShareDepartmentLoading,
  } = useSelector((state) => state.document);
  const { onOpen, value, idDocument } = props;

  const getDepartmentListHandler = async () => {
    if (!departmentList) {
      await dispatch(getDepartmentList()).unwrap();
    }
    dispatch(toggleDepartmentList({ isOpen: !isOpenDepartmentList }));
  };

  const onAddSelectedDepartment = (value: Department | undefined) => {
    if (!value) {
      dispatch(changeSharedDepartment({ departments: [] }));
      return;
    }
    const { departmentName } = value;
    if (sharedDepartment?.length === 0) {
      // setSelectedDepartment((prevState) => [...prevState!, value]);
      dispatch(
        changeSharedDepartment({ departments: [...sharedDepartment, value] })
      );
      return;
    }
    if (
      departmentName === "All" ||
      sharedDepartment[0].departmentName === "All"
    ) {
      // setSelectedDepartment([value]);
      dispatch(changeSharedDepartment({ departments: [value] }));
      return;
    }
    // setSelectedDepartment((prevState) => [...prevState!, value]);
    dispatch(
      changeSharedDepartment({ departments: [...sharedDepartment, value] })
    );
    return value;
  };

  const onChangeSelectedDepartment = (index: number) => {
    dispatch(
      changeSharedDepartment({
        departments: sharedDepartment?.filter(
          (d) => d !== sharedDepartment[index]
        ),
      })
    );
  };

  const onShareDepartment = async () => {
    await dispatch(
      shareDepartment({
        idDocument,
        departmentIdList: sharedDepartment.map((department) => department.id),
      })
    ).unwrap();
    onOpen()
  };

  const filterDepartment = (): Department[] => {
    let newUserList: Department[] = [];
    let checkExisted;
    departmentList?.items!.forEach((u) => {
      checkExisted = false;
      sharedDepartment.forEach((value, index) => {
        if (u.departmentName === value.departmentName) {
          checkExisted = true;
        }
      });
      !checkExisted && newUserList.push(u);
    });
    return newUserList;
  };

  useEffect(() => {
    const getSharedDepartments = dispatch(getSharedDepartment({ idDocument }));
    getSharedDepartments.unwrap();

    return () => getSharedDepartments.abort();
  }, [dispatch, idDocument]);

  useEffect(() => {
    return () => {
      dispatch(clearSharedInfo());
    };
  }, [dispatch]);
  //
  return (
    <TabPanel value={value} index={0}>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          <h4>{t("Department list")}</h4>
          <Autocomplete
            id="asynchronous-demo"
            // multiple = {departmentList?.items ? true : false}
            sx={{
              width: 300,
              color: "#000",
            }}
            open={isOpenDepartmentList}
            onOpen={getDepartmentListHandler}
            onClose={getDepartmentListHandler}
            onChange={(e, value) => onAddSelectedDepartment(value!)}
            isOptionEqualToValue={(option, value) =>
              option.departmentName === value.departmentName
            }
            getOptionLabel={(option) => t(option.departmentName)}
            options={filterDepartment()}
            loading={isGetDepartmentsLoading}
            renderInput={(params) => (
              <TextFieldStyled
                {...params}
                sx={{
                  border: "1px solid #fff",
                  borderRadius: "5px",
                }}
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
          {isGetSharedDepartmentLoading && (
            <div
              style={{
                width: "300px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </div>
          )}
          <div
            className="flex flex-col border border-slate-500 rounded-md"
            style={{ width: "300px" }}
          >
            {!isGetSharedDepartmentLoading &&
              sharedDepartment.map((department, index) => (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "300px",
                    alignItems: 'center'
                  }}
                  key={department.id}
                >
                  <span>{department.departmentName}</span>
                  <IconButton
                    onClick={() => onChangeSelectedDepartment(index)}
                    size="small"
                  >
                    <ClearIcon />
                  </IconButton>
                </div>
              ))}
          </div>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <WhiteBtn onClick={() => onOpen()}>Cancel</WhiteBtn>
        <SaveLoadingBtn
          loading={isShareDepartmentLoading}
          onClick={onShareDepartment}
        >
          Save
        </SaveLoadingBtn>
      </DialogActions>
    </TabPanel>
  );
};

export default DepartmentTab;
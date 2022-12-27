import { Divider, CircularProgress, TextField, Switch, Typography, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { styled } from "@mui/system";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import WebViewer from "@pdftron/webviewer";
import { LoadingButton } from "@mui/lab";
import AlertPopup from "../../../../components/AlertPopup";
import { useDispatch, useSelector } from "../../../../hooks";
import { approveTemplate } from "../../../../slices/template";
import { StatusTemplate } from "../../../../utils/constants";

const LoadingBtn = styled(
  LoadingButton,
  {}
)({
  backgroundColor: "#407AFF",
  borderRadius: "5px",
  color: "#fff",
  padding: '5px',
  textTransform: 'unset',
  // fontSize: '15px',
  // width: 'fit-content',
  ":hover": { backgroundColor: "#578aff" },
  "&.MuiLoadingButton-loading": {
    backgroundColor: "#fff",
    borderColor: "#407AFF",
  },
});

const CancelBtn = styled(
  Button,
  {}
)({
  backgroundColor: "#fff",
  borderRadius: "5px",
  color: "#407AFF",
  padding: '5px',
  textTransform: 'unset',
  // ":hover": { backgroundColor: "#407AFF", color: "#fff", },
});

const ApproveBtn = styled(
  Button,
  {}
)({
  backgroundColor: "#407AFF",
  borderRadius: "5px",
  color: "#fff",
  paddingTop: "10px",
  paddingBottom: "10px",
  ":hover": { backgroundColor: "#fff", color: "#407AFF" },
  "&.Mui-disabled": {
    color: "#F2F2F2",
    backgroundColor: "#6F7276",
  },
});
const RejectBtn = styled(
  Button,
  {}
)({
  backgroundColor: "#ff5252",
  borderRadius: "5px",
  color: "#fff",
  paddingTop: "10px",
  paddingBottom: "10px",
  ":hover": { backgroundColor: "#fff", color: "#407AFF" },
  "&.Mui-disabled": {
    color: "#F2F2F2",
    backgroundColor: "#6F7276",
  },
});

const {APPROVED_TEMPLATE, REJECTED_TEMPLATE} = StatusTemplate

const ViewApproveTemplate: React.FC = () => {
  const viewer = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const { isApproveTemplateLoading, templateDetail } = useSelector(
    (state) => state.template
  );
  const { userInfo } = useSelector((state) => state.auth);
  const {
    createdAt,
    createdBy,
    departmentName,
    description,
    templateName,
    typeName,
    signatoryList,
    link,
    id,
  } = templateDetail!;
  const [isAccepting, setIsAccepting] = useState<boolean>(true);
  const [reason, setReason] = useState<string | undefined>();
  const [openDialog, setOpenDialog] = useState(false);

  const signers = signatoryList.map((signer) => (
    <div className="flex flex-col space-y-3 rounded-md border border-solid border-white p-4">
      <div className="flex space-x-2 items-center ">
        <h4>Signer:</h4>
        <Typography className="text-white">{signer.email}</Typography>
      </div>
      <div className="flex space-x-2 items-center">
        <h4>Department:</h4>
        <Typography className="text-white">{templateName}</Typography>
      </div>
      <div className="flex space-x-2 items-center">
        <h4>Role:</h4>
        <Typography className="text-white">
          {signer.roleName}
        </Typography>
      </div>
    </div>
  ));

  // if using a class, equivalent of componentDidMount

  useEffect(() => {
    WebViewer(
      {
        path: "/webviewer/lib",
        initialDoc: link!,
        disabledElements: [
          // 'viewControlsButton',
          // 'leftPanel'
          // 'viewControlsOverlay'
          // 'toolbarGroup-Annotate'
        ],
      },
      viewer.current!
    ).then(async (instance) => {
      const { documentViewer} = instance.Core;
      const annotManager = documentViewer.getAnnotationManager();

      annotManager.enableReadOnlyMode();
      documentViewer.addEventListener("documentLoaded", async () => {
        await documentViewer.getDocument().getDocumentCompletePromise();
        documentViewer.updateView();
      });
    });
  }, [link]);

  const onApproveTemplate = async () => {
    await dispatch(
      approveTemplate({
        userId: +userInfo?.userId!,
        templateId: id,
        statusTemplate: isAccepting ? APPROVED_TEMPLATE : REJECTED_TEMPLATE,
        reason: `${!isAccepting ? reason : undefined}`,
      })
    ).unwrap();
    navigate('/user')
  };
  return (
    <Fragment>
      <div className="bg-blue-config px-20 py-6 flex space-x-4 items-center">
        <Link to="/user">
          <ArrowBackIosIcon fontSize="small" className="fill-white" />
        </Link>
        <span className="text-white">Approve template</span>
      </div>
      <div className="flex">
        <div className="flex flex-col bg-dark-config min-h-screen px-10 pt-12 space-y-8 w-80">
          <div className="flex flex-col space-y-8 text-white">
            <div className="flex flex-col space-y-2">
              <h4>File name:</h4>
              <span className="text-white text-base break-words w-60">
                {templateName}
              </span>
            </div>

            <div className="flex flex-col space-y-2">
              <h4>Description:</h4>
              <span className="text-white text-base break-words w-60">
                {description}
              </span>
            </div>
            <div className="flex flex-col space-y-2">
              <h4>Type:</h4>
              <span className="text-white text-base break-words w-60">
                {typeName}
              </span>
            </div>
            <div className="flex flex-col space-y-2">
              <h4>Department:</h4>
              <span className="text-white text-base break-words w-60">
                {departmentName}
              </span>
            </div>
            <div className="flex flex-col space-y-2">
              <h4>Created By:</h4>
              <span className="text-white text-base break-words w-60">
                {createdBy}
              </span>
            </div>
            <div className="flex flex-col space-y-2">
              <h4>Created At:</h4>
              <span className="text-white text-base break-words w-60">
                {createdAt}
              </span>
            </div>
            <Divider className="bg-white" />
            <div className="flex justify-center">
              <h4>Signer List:</h4>
            </div>
            {signers}
            <div className="flex items-center">
              <Switch
                defaultChecked={isAccepting}
                onClick={() => setIsAccepting((prevState) => !prevState)}
                sx={{
                  "&	.MuiSwitch-track": {
                    backgroundColor: "#ff5252",
                  },
                  "& .MuiSwitch-thumb": {
                    backgroundColor: `${!isAccepting && "#ff5252"}`,
                  },
                }}
              />
              <h4>{isAccepting ? "Approve" : "Reject"}</h4>
            </div>
            {!isAccepting ? (
              <div className="flex flex-col space-y-4">
                <h4>Reason:</h4>
                <TextField
                  id="outlined-multiline-flexible"
                  sx={{
                    border: "1px solid #fff",
                    borderRadius: "5px",
                    textarea: {
                      color: "#fff",
                    },
                  }}
                  multiline
                  minRows={4}
                  maxRows={4}
                  color="primary"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <RejectBtn
                  size="small"
                  variant="outlined"
                  onClick={() => setOpenDialog(true)}
                  disabled={!reason}
                >
                  Reject
                </RejectBtn>
              </div>
            ) : (
              <ApproveBtn
                size="small"
                variant="outlined"
                onClick={() => setOpenDialog(true)}
              >
                Approve
              </ApproveBtn>
            )}
          </div>
        </div>
        <div className="webviewer w-full" ref={viewer}></div>
      </div>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Notification
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {isAccepting ? 'Are you sure you want to approve this template?' : 'Are you sure you want to reject this template?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <CancelBtn onClick={() => setOpenDialog(false)} size='small' >Cancel</CancelBtn>
          <LoadingBtn
            size="small"
            loading={isApproveTemplateLoading}
            loadingIndicator={<CircularProgress color="inherit" size={16} />}
            variant="outlined"
            onClick={onApproveTemplate}
          >
            Save
          </LoadingBtn>
        </DialogActions>
      </Dialog>
      <AlertPopup
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={3000}
      />
    </Fragment>
  );
};

export default ViewApproveTemplate;
